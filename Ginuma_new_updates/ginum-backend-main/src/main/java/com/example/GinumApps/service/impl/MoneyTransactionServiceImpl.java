package com.example.GinumApps.service.impl;

import com.example.GinumApps.dto.MoneyTransactionRequestDto;
import com.example.GinumApps.dto.MoneyTransactionResponseDto;
import com.example.GinumApps.enums.TransactionType;
import com.example.GinumApps.model.*;
import com.example.GinumApps.repository.*;
import com.example.GinumApps.service.MoneyTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MoneyTransactionServiceImpl implements MoneyTransactionService {
    
    private final MoneyTransactionRepository moneyTransactionRepository;
    private final CompanyRepository companyRepository;
    private final BankAccountRepository bankAccountRepository;
    private final AccountRepository accountRepository;
    private final SupplierRepository supplierRepository;
    private final CustomerRepository customerRepository;
    private final EmployeeRepository employeeRepository;
    private final ProjectRepository projectRepository;
    private final AppUserRepository appUserRepository;
    private final JournalEntryRepository journalEntryRepository;
    
    @Override
    @Transactional
    public MoneyTransaction createTransaction(Integer companyId, MoneyTransactionRequestDto request, Integer userId) {
        // Validate company exists
        Company company = companyRepository.findById(companyId)
            .orElseThrow(() -> new RuntimeException("Company not found"));
        
        // Validate bank account
        BankAccount bankAccount = bankAccountRepository.findById(Long.valueOf(request.getBankAccountId()))
            .orElseThrow(() -> new RuntimeException("Bank account not found"));
        
        if (!bankAccount.getCompany().getCompanyId().equals(companyId)) {
            throw new RuntimeException("Bank account does not belong to this company");
        }
        
        // Validate charge account
        Account chargeAccount = accountRepository.findById(Long.valueOf(request.getChargeAccountId()))
            .orElseThrow(() -> new RuntimeException("Charge account not found"));
        
        if (!chargeAccount.getCompany().getCompanyId().equals(companyId)) {
            throw new RuntimeException("Charge account does not belong to this company");
        }
        
        // Get payee name
        String payeeName = getPayeeName(request.getPayeeType(), request.getPayeeId());
        
        // Get user
        AppUser user = appUserRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Generate transaction number
        String transactionNumber = generateTransactionNumber(companyId);
        
        // Create money transaction
        MoneyTransaction transaction = new MoneyTransaction();
        transaction.setCompany(company);
        transaction.setType(request.getType());
        transaction.setTransactionNumber(transactionNumber);
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setBankAccount(bankAccount);
        transaction.setPayeeType(request.getPayeeType());
        transaction.setPayeeId(request.getPayeeId());
        transaction.setPayeeName(payeeName);
        transaction.setChargeAccount(chargeAccount);
        transaction.setAmount(request.getAmount());
        transaction.setDescription(request.getDescription());
        transaction.setPaymentMethod(request.getPaymentMethod());
        transaction.setReferenceNumber(request.getReferenceNumber());
        transaction.setCreatedBy(user);
        
        // Handle project if provided
        if (request.getProjectId() != null) {
            Project project = projectRepository.findById(Long.valueOf(request.getProjectId()))
                .orElseThrow(() -> new RuntimeException("Project not found"));
            transaction.setProject(project);
        }
        
        // Save the transaction first
        transaction = moneyTransactionRepository.save(transaction);
        
        // Create Journal Entry for Double Entry Bookkeeping
        JournalEntry journalEntry = createJournalEntry(transaction, bankAccount);
        transaction.setJournalEntry(journalEntry);
        
        return moneyTransactionRepository.save(transaction);
    }
    
    private JournalEntry createJournalEntry(MoneyTransaction transaction, BankAccount bankAccountLedger) {
        JournalEntry entry = new JournalEntry();
        entry.setCompany(transaction.getCompany());
        entry.setEntryDate(transaction.getTransactionDate());
        entry.setReferenceNo(transaction.getTransactionNumber());
        entry.setJournalTitle("Money Transaction - " + transaction.getTransactionNumber());
        entry.setDescription(transaction.getDescription());
        entry.setAuthorId(transaction.getCreatedBy().getId());
        
        List<JournalEntryLine> lines = new ArrayList<>();
        
        if (transaction.getType() == TransactionType.SPEND_MONEY) {
            // Debit: Expense Account (Charge Account)
            JournalEntryLine debitLine = new JournalEntryLine();
            debitLine.setJournalEntry(entry);
            debitLine.setAccount(transaction.getChargeAccount());
            debitLine.setAmount(java.math.BigDecimal.valueOf(transaction.getAmount()));
            debitLine.setDebit(true);
            debitLine.setDescription(transaction.getDescription());
            lines.add(debitLine);
            
            // Credit: Bank Account (Asset)
            JournalEntryLine creditLine = new JournalEntryLine();
            creditLine.setJournalEntry(entry);
            creditLine.setAccount(bankAccountLedger);
            creditLine.setAmount(java.math.BigDecimal.valueOf(transaction.getAmount()));
            creditLine.setDebit(false);
            creditLine.setDescription(transaction.getDescription());
            lines.add(creditLine);
            
        } else if (transaction.getType() == TransactionType.RECEIVE_MONEY) {
            // Debit: Bank Account (Asset)
            JournalEntryLine debitLine = new JournalEntryLine();
            debitLine.setJournalEntry(entry);
            debitLine.setAccount(bankAccountLedger);
            debitLine.setAmount(java.math.BigDecimal.valueOf(transaction.getAmount()));
            debitLine.setDebit(true);
            debitLine.setDescription(transaction.getDescription());
            lines.add(debitLine);
            
            // Credit: Income Account (Charge Account)
            JournalEntryLine creditLine = new JournalEntryLine();
            creditLine.setJournalEntry(entry);
            creditLine.setAccount(transaction.getChargeAccount());
            creditLine.setAmount(java.math.BigDecimal.valueOf(transaction.getAmount()));
            creditLine.setDebit(false);
            creditLine.setDescription(transaction.getDescription());
            lines.add(creditLine);
        }
        
        entry.setJournalEntryLines(lines);
        return journalEntryRepository.save(entry);
    }
    
    private String getPayeeName(com.example.GinumApps.enums.PayeeType payeeType, Integer payeeId) {
        switch (payeeType) {
            case SUPPLIER:
                return supplierRepository.findById(Long.valueOf(payeeId))
                    .map(Supplier::getSupplierName)
                    .orElseThrow(() -> new RuntimeException("Supplier not found"));
            case CUSTOMER:
                return customerRepository.findById(Long.valueOf(payeeId))
                    .map(Customer::getName)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));
            case EMPLOYEE:
                return employeeRepository.findById(payeeId)
                    .map(employee -> employee.getFirstName() + " " + employee.getLastName())
                    .orElseThrow(() -> new RuntimeException("Employee not found"));
            case OTHER:
                return "Other";
            default:
                return "Unknown";
        }
    }
    
    @Override
    public String generateTransactionNumber(Integer companyId) {
        int year = LocalDate.now().getYear();
        String lastTransaction = moneyTransactionRepository.findTopByCompany_CompanyIdOrderByIdDesc(companyId)
            .map(MoneyTransaction::getTransactionNumber)
            .orElse(null);
        
        int nextNumber = 1;
        if (lastTransaction != null && lastTransaction.startsWith("MT-" + year)) {
            try {
                String numberPart = lastTransaction.substring(lastTransaction.lastIndexOf("-") + 1);
                nextNumber = Integer.parseInt(numberPart) + 1;
            } catch (Exception e) {
                nextNumber = 1;
            }
        }
        
        return String.format("MT-%d-%04d", year, nextNumber);
    }
    
    @Override
    public List<MoneyTransactionResponseDto> getAllTransactions(Integer companyId) {
        List<MoneyTransaction> transactions = moneyTransactionRepository
            .findByCompany_CompanyIdOrderByTransactionDateDesc(companyId);
        return transactions.stream()
            .map(this::convertToResponseDto)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<MoneyTransactionResponseDto> getTransactionsByType(Integer companyId, TransactionType type) {
        List<MoneyTransaction> transactions = moneyTransactionRepository
            .findByCompany_CompanyIdAndTypeOrderByTransactionDateDesc(companyId, type);
        return transactions.stream()
            .map(this::convertToResponseDto)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<MoneyTransactionResponseDto> getTransactionsByDateRange(
            Integer companyId, LocalDate startDate, LocalDate endDate) {
        List<MoneyTransaction> transactions = moneyTransactionRepository
            .findByCompany_CompanyIdAndTransactionDateBetween(companyId, startDate, endDate);
        return transactions.stream()
            .map(this::convertToResponseDto)
            .collect(Collectors.toList());
    }
    
    @Override
    public MoneyTransactionResponseDto getTransactionById(Integer id) {
        MoneyTransaction transaction = moneyTransactionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Transaction not found"));
        return convertToResponseDto(transaction);
    }
    
    @Override
    @Transactional
    public void deleteTransaction(Integer id) {
        MoneyTransaction transaction = moneyTransactionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Transaction not found"));
        
        // Delete associated journal entry
        if (transaction.getJournalEntry() != null) {
            journalEntryRepository.delete(transaction.getJournalEntry());
        }
        
        moneyTransactionRepository.delete(transaction);
    }
    
    private MoneyTransactionResponseDto convertToResponseDto(MoneyTransaction transaction) {
        MoneyTransactionResponseDto dto = new MoneyTransactionResponseDto();
        dto.setId(transaction.getId());
        dto.setTransactionNumber(transaction.getTransactionNumber());
        dto.setType(transaction.getType());
        dto.setTransactionDate(transaction.getTransactionDate());
        
        // Bank Account info
        dto.setBankAccountId(transaction.getBankAccount().getId().intValue());
        dto.setBankAccountName(transaction.getBankAccount().getAccountName());
        dto.setBankAccountCode(transaction.getBankAccount().getAccountCode());
        
        // Payee info
        dto.setPayeeType(transaction.getPayeeType());
        dto.setPayeeId(transaction.getPayeeId());
        dto.setPayeeName(transaction.getPayeeName());
        
        // Charge Account info
        dto.setChargeAccountId(transaction.getChargeAccount().getId().intValue());
        dto.setChargeAccountName(transaction.getChargeAccount().getAccountName());
        dto.setChargeAccountCode(transaction.getChargeAccount().getAccountCode());
        
        // Transaction details
        dto.setAmount(transaction.getAmount());
        dto.setDescription(transaction.getDescription());
        dto.setPaymentMethod(transaction.getPaymentMethod());
        dto.setReferenceNumber(transaction.getReferenceNumber());
        
        // Project info
        if (transaction.getProject() != null) {
            dto.setProjectId(transaction.getProject().getId().intValue());
            dto.setProjectName(transaction.getProject().getName());
        }
        
        // Journal Entry info
        if (transaction.getJournalEntry() != null) {
            dto.setJournalEntryId(transaction.getJournalEntry().getId().intValue());
            dto.setJournalEntryReference(transaction.getJournalEntry().getReferenceNo());
        }
        
        // Created by info
        dto.setCreatedById(transaction.getCreatedBy().getId());
        dto.setCreatedByName(transaction.getCreatedBy().getEmail());
        dto.setCreatedAt(transaction.getCreatedAt());
        
        return dto;
    }
}
