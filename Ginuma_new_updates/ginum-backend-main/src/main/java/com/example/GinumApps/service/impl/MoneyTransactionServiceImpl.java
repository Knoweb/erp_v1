package com.example.GinumApps.service.impl;

import com.example.GinumApps.dto.MoneyTransactionRequestDto;
import com.example.GinumApps.dto.MoneyTransactionResponseDto;
import com.example.GinumApps.enums.TransactionType;
import com.example.GinumApps.model.*;
import com.example.GinumApps.repository.*;
import com.example.GinumApps.service.MoneyTransactionService;
import com.example.GinumApps.service.JournalEntryService;
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

    private final AccountRepository accountRepository;
    private final SupplierRepository supplierRepository;
    private final CustomerRepository customerRepository;
    private final EmployeeRepository employeeRepository;
    private final ProjectRepository projectRepository;
    private final AppUserRepository appUserRepository;
    private final JournalEntryRepository journalEntryRepository;
    private final JournalEntryService journalEntryService;
    
    @Override
    @Transactional
    public MoneyTransaction createTransaction(Integer companyId, MoneyTransactionRequestDto request, Integer userId) {
        // Validate company exists
        Company company = companyRepository.findById(companyId)
            .orElseThrow(() -> new RuntimeException("Company not found"));
        
        // Validate bank account (which could be a cash account)
        Account bankAccount = accountRepository.findById(Long.valueOf(request.getBankAccountId()))
            .orElseThrow(() -> new RuntimeException("Bank/Payment account not found"));
        
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
        
        // Get user — nullable: Company admins may not have an AppUser record
        AppUser user = (userId != null)
            ? appUserRepository.findById(userId).orElse(null)
            : null;
        
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
        // If payeeId is null (e.g. for OTHER payeeType), set a default of 0 to satisfy not-null DB constraint
        transaction.setPayeeId(request.getPayeeId() != null ? request.getPayeeId() : 0);
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
        
        // Create Journal Entry via Service to ensure balance updates
        JournalEntry journalEntry = createJournalEntryViaService(transaction, companyId);
        transaction.setJournalEntry(journalEntry);
        
        return moneyTransactionRepository.save(transaction);
    }
    
    private JournalEntry createJournalEntryViaService(MoneyTransaction transaction, Integer companyId) {
        com.example.GinumApps.dto.JournalEntryDto dto = new com.example.GinumApps.dto.JournalEntryDto();
        
        if (transaction.getType() == TransactionType.SPEND_MONEY) {
            dto.setEntryType(com.example.GinumApps.enums.JournalEntryType.PAYMENT);
        } else if (transaction.getType() == TransactionType.RECEIVE_MONEY) {
            dto.setEntryType(com.example.GinumApps.enums.JournalEntryType.RECEIPT);
        } else {
            dto.setEntryType(com.example.GinumApps.enums.JournalEntryType.SYSTEM_GENERATED);
        }
        
        dto.setCompanyId(companyId);
        dto.setEntryDate(transaction.getTransactionDate());
        dto.setReferenceNo(transaction.getTransactionNumber());
        dto.setJournalTitle("Money Transaction - " + transaction.getTransactionNumber());
        dto.setDescription(transaction.getDescription());
        dto.setAuthorId(transaction.getCreatedBy() != null ? transaction.getCreatedBy().getId() : null);
        
        List<com.example.GinumApps.dto.JournalEntryLineDto> lines = new ArrayList<>();
        
        if (transaction.getType() == TransactionType.SPEND_MONEY) {
            // Debit: Expense/Charge Account
            lines.add(new com.example.GinumApps.dto.JournalEntryLineDto(
                transaction.getChargeAccount().getAccountCode(),
                java.math.BigDecimal.valueOf(transaction.getAmount()),
                true,
                transaction.getDescription()
            ));
            
            // Credit: Bank Account
            lines.add(new com.example.GinumApps.dto.JournalEntryLineDto(
                transaction.getBankAccount().getAccountCode(),
                java.math.BigDecimal.valueOf(transaction.getAmount()),
                false,
                transaction.getDescription()
            ));
            
        } else if (transaction.getType() == TransactionType.RECEIVE_MONEY) {
            // Debit: Bank Account
            lines.add(new com.example.GinumApps.dto.JournalEntryLineDto(
                transaction.getBankAccount().getAccountCode(),
                java.math.BigDecimal.valueOf(transaction.getAmount()),
                true,
                transaction.getDescription()
            ));
            
            // Credit: Income/Charge Account
            lines.add(new com.example.GinumApps.dto.JournalEntryLineDto(
                transaction.getChargeAccount().getAccountCode(),
                java.math.BigDecimal.valueOf(transaction.getAmount()),
                false,
                transaction.getDescription()
            ));
        }
        
        dto.setLines(lines);
        return journalEntryService.createJournalEntry(dto);
    }
    
    private String getPayeeName(com.example.GinumApps.enums.PayeeType payeeType, Integer payeeId) {
        if (payeeType == com.example.GinumApps.enums.PayeeType.OTHER) {
            return "Other";
        }
        
        if (payeeId == null || payeeId <= 0) {
            return "Unknown";
        }
        
        switch (payeeType) {
            case SUPPLIER:
                return supplierRepository.findById(Long.valueOf(payeeId))
                    .map(Supplier::getSupplierName)
                    .orElse("Unknown Supplier");
            case CUSTOMER:
                return customerRepository.findById(Long.valueOf(payeeId))
                    .map(Customer::getName)
                    .orElse("Unknown Customer");
            case EMPLOYEE:
                return employeeRepository.findById(payeeId)
                    .map(employee -> employee.getFirstName() + " " + employee.getLastName())
                    .orElse("Unknown Employee");
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
        if (transaction.getCreatedBy() != null) {
            dto.setCreatedById(transaction.getCreatedBy().getId());
            dto.setCreatedByName(transaction.getCreatedBy().getEmail());
        }
        dto.setCreatedAt(transaction.getCreatedAt());
        
        return dto;
    }
}
