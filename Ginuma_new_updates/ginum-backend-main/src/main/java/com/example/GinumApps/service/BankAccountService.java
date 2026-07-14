package com.example.GinumApps.service;

import com.example.GinumApps.dto.BankAccountRequestDto;
import com.example.GinumApps.dto.BankAccountResponseDto;
import com.example.GinumApps.enums.AccountType;
import com.example.GinumApps.model.BankAccount;
import com.example.GinumApps.model.Company;
import com.example.GinumApps.repository.AccountRepository;
import com.example.GinumApps.repository.BankAccountRepository;
import com.example.GinumApps.repository.CompanyRepository;
import com.example.GinumApps.repository.JournalEntryLineRepository;
import com.example.GinumApps.repository.JournalEntryRepository;
import com.example.GinumApps.model.JournalEntry;
import com.example.GinumApps.model.JournalEntryLine;
import com.example.GinumApps.model.Account;
import com.example.GinumApps.enums.JournalEntryType;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BankAccountService {

    private static final List<String> ASSET_RESERVED_CODES = List.of();

    private final BankAccountRepository bankAccountRepository;
    private final CompanyRepository companyRepository;
    private final AccountRepository accountRepository;
    private final JournalEntryRepository journalEntryRepository;
    private final JournalEntryLineRepository journalEntryLineRepository;

    @Transactional
    public BankAccount createBankAccount(Integer companyId,BankAccountRequestDto request) {
        if (bankAccountRepository.existsByAccountNumber(request.getAccountNumber())) {
            throw new RuntimeException("Account number already exists");
        }

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        // Generate account code
        String accountCode = generateAssetAccountCode(company);

        BankAccount bankAccount = new BankAccount();
        bankAccount.setBankName(request.getBankName());
        bankAccount.setBranchName(request.getBranchName());
        bankAccount.setAccountNumber(request.getAccountNumber());
        bankAccount.setSubAccountName(request.getSubAccountName());
        bankAccount.setCurrentBalance(request.getCurrentBalance());
        bankAccount.setCompany(company);
        bankAccount.setAccountCode(accountCode);

        // Handle account name
        if (request.getAccountName() != null && !request.getAccountName().isBlank()) {
            bankAccount.setAccountName(request.getAccountName());
        } else {
            bankAccount.setBankName(request.getBankName()); // Auto-sets "Bank-{name}"
        }
        
        bankAccount.setOpeningBalance(request.getCurrentBalance() != null ? request.getCurrentBalance() : BigDecimal.ZERO);

        BankAccount savedAccount = bankAccountRepository.save(bankAccount);
        
        // Create Opening Balance Journal Entry if applicable
        BigDecimal openingBalance = savedAccount.getOpeningBalance();
        if (openingBalance != null && openingBalance.compareTo(BigDecimal.ZERO) != 0 && !savedAccount.getAccountCode().equals("3001")) {
            createOpeningBalanceJournalEntry(companyId, savedAccount);
        }

        return savedAccount;
    }

    private void createOpeningBalanceJournalEntry(Integer companyId, Account account) {
        BigDecimal amount = account.getOpeningBalance().abs();

        boolean isDebit = account.getAccountType().isDebitType();
        if (account.getOpeningBalance().compareTo(BigDecimal.ZERO) < 0) {
            isDebit = !isDebit; // Reverse if negative
        }

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new EntityNotFoundException("Company not found"));
                
        Account equityAccount = accountRepository.findByAccountCodeAndCompany_CompanyId("3001", companyId)
                .orElseThrow(() -> new EntityNotFoundException("Opening Balance Equity account (3001) not found"));

        // 1. Create and save the JournalEntry
        JournalEntry entry = new JournalEntry();
        entry.setCompany(company);
        entry.setEntryType(JournalEntryType.SYSTEM_GENERATED);
        entry.setEntryDate(LocalDate.now());
        entry.setJournalTitle("Opening Balance: " + account.getAccountName());
        entry.setDescription("Initial balance for " + account.getAccountName());
        entry.setReferenceNo("OB-" + account.getAccountCode());
        entry.setAuthorId(1); // Default system author
        
        JournalEntry savedEntry = journalEntryRepository.save(entry);

        // 2. Create the JournalEntryLines
        // Line 1: The new account
        JournalEntryLine accountLine = new JournalEntryLine();
        accountLine.setJournalEntry(savedEntry);
        accountLine.setAccount(account);
        accountLine.setAmount(amount);
        accountLine.setDebit(isDebit);
        accountLine.setDescription("Opening Balance");
        accountLine.setReconciled(false);
        journalEntryLineRepository.save(accountLine);

        // Line 2: Opening Balance Equity (Code 3000)
        JournalEntryLine equityLine = new JournalEntryLine();
        equityLine.setJournalEntry(savedEntry);
        equityLine.setAccount(equityAccount);
        equityLine.setAmount(amount);
        equityLine.setDebit(!isDebit);
        equityLine.setDescription("Opening Balance Offset");
        equityLine.setReconciled(false);
        journalEntryLineRepository.save(equityLine);

        // 3. Update the Equity Account's current balance
        BigDecimal currentEqBal = equityAccount.getCurrentBalance() != null ? equityAccount.getCurrentBalance() : BigDecimal.ZERO;
        // BigDecimal is immutable, so we MUST use setCurrentBalance with the result of .add()
        equityAccount.setCurrentBalance(currentEqBal.add(account.getOpeningBalance()));
        accountRepository.save(equityAccount);
    }

    private String generateAssetAccountCode(Company company) {
        List<AccountType> assetTypes = Arrays.stream(AccountType.values())
                .filter(t -> t.getMainCategory().equals("Asset"))
                .collect(Collectors.toList());

        long count = accountRepository.countByCompanyAndAccountTypes(
                company.getCompanyId(),
                assetTypes,
                ASSET_RESERVED_CODES
        );

        // Add validation for code range
        int nextCode = 1000 + (int) count + 1;
        if (nextCode > 9999) {
            throw new IllegalStateException("Asset account code overflow (max 9999)");
        }

        return String.format("%04d", nextCode);
    }

    public List<BankAccountResponseDto> getBankAccountsByCompany(Integer companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new EntityNotFoundException("Company not found"));

        return bankAccountRepository.findByCompany_CompanyId(companyId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private BankAccountResponseDto convertToDto(BankAccount account) {
        BankAccountResponseDto dto = new BankAccountResponseDto();
        dto.setId(account.getId());
        dto.setAccountName(account.getAccountName());
        dto.setAccountType(account.getAccountType());
        dto.setCurrentBalance(account.getCurrentBalance());
        dto.setAccountCode(account.getAccountCode());
        dto.setBankName(account.getBankName());
        dto.setBranchName(account.getBranchName());
        dto.setAccountNumber(account.getAccountNumber());
        return dto;
    }
}