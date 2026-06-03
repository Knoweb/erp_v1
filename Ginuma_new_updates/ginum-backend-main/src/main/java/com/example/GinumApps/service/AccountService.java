package com.example.GinumApps.service;

import com.example.GinumApps.dto.AccountRequestDto;
import java.math.BigDecimal;
import com.example.GinumApps.dto.AccountResponseDto;
import com.example.GinumApps.enums.AccountType;
import com.example.GinumApps.model.Account;
import com.example.GinumApps.model.Company;
import com.example.GinumApps.repository.AccountRepository;
import com.example.GinumApps.repository.CompanyRepository;
import com.example.GinumApps.repository.JournalEntryLineRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountService {

    private static final List<String> RESERVED_CODES = List.of(
            "5100", "5200", "2100"
    );

    private final AccountRepository accountRepository;
    private final CompanyRepository companyRepository;
    private final JournalEntryLineRepository journalEntryLineRepository;

    @Transactional
    public Account createAccount(Integer companyId, AccountRequestDto request) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        // Check for duplicate account code
        if(request.getAccountCode() != null) {
            accountRepository.findByAccountCodeAndCompany_CompanyId(
                    request.getAccountCode(), companyId
            ).ifPresent(acc -> {
                throw new IllegalArgumentException("Account code already exists");
            });
        }

        String accountCode = request.getAccountCode() != null ?
                request.getAccountCode() :
                generateAccountCode(company, request.getAccountType());

        String normalizedName = normalizeName(request.getAccountName());

        String normalizedSubAccount = request.getSubAccountName() != null ?
                normalizeName(request.getSubAccountName()) : "";

        if (accountRepository.existsByNormalizedNameAndNormalizedSubAccountAndCompany_CompanyId(normalizedName,normalizedSubAccount, company.getCompanyId())) {
            throw new IllegalArgumentException("Account name already exists for this company");
        }

//        String accountCode = generateAccountCode(company, request.getAccountType());

        Account account = new Account();
        account.setAccountName(request.getAccountName());
        account.setNormalizedName(normalizedName);
        account.setSubAccountName(request.getSubAccountName());
        account.setAccountType(request.getAccountType());
        account.setCurrentBalance(request.getCurrentBalance());
        account.setOpeningBalance(request.getCurrentBalance() != null ? request.getCurrentBalance() : BigDecimal.ZERO);
        account.setCompany(company);
        account.setAccountCode(accountCode);

        return accountRepository.save(account);
    }

    private String normalizeName(String name) {
        return name.replaceAll("\\s+", "").toUpperCase();
    }

    private String generateAccountCode(Company company, AccountType accountType) {
        List<String> reservedForCategory = getReservedCodesForCategory(
                accountType.getMainCategory()
        );
        List<AccountType> categoryTypes = getAccountTypesByCategory(accountType.getMainCategory());

//        long count = accountRepository.countByCompanyAndAccountTypes(
//                company.getCompanyId(),
//                categoryTypes
//        );

        long count = accountRepository.countByCompanyAndAccountTypes(
                company.getCompanyId(),
                getAccountTypesByCategory(accountType.getMainCategory()),
                getReservedCodesForCategory(accountType.getMainCategory())
        );

        return switch (accountType.getMainCategory()) {
            case "Asset" -> 1000 + count + 1;
            case "Liability" -> 2000 + count + 1;
            case "Equity" -> 3000 + count + 1;
            case "Income" -> 4000 + count + 1;
            case "Expense" -> 5000 + count + 1;
            default -> 9000 + count + 1;
        } + "";
    }

    private List<AccountType> getAccountTypesByCategory(String mainCategory) {
        return Arrays.stream(AccountType.values())
                .filter(type -> type.getMainCategory().equals(mainCategory))
                .collect(Collectors.toList());
    }

    public List<AccountResponseDto> getAccountsByCompany(Integer companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new EntityNotFoundException("Company not found"));

        return accountRepository.findByCompany_CompanyId(companyId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private AccountResponseDto convertToDto(Account account) {
        AccountResponseDto dto = new AccountResponseDto();
        dto.setId(account.getId());
        dto.setAccountName(account.getAccountName());
        dto.setSubAccountName(account.getSubAccountName());
        dto.setAccountType(account.getAccountType());
        dto.setCurrentBalance(account.getCurrentBalance());
        dto.setAccountCode(account.getAccountCode());

//        if (account instanceof BankAccount) {
//            BankAccount bankAccount = (BankAccount) account;
//            dto.setBankName(bankAccount.getBankName());
//            dto.setBranchName(bankAccount.getBranchName());
//            dto.setAccountNumber(bankAccount.getAccountNumber());
//        }

        return dto;
    }
    private List<String> getReservedCodesForCategory(String mainCategory) {
        return switch (mainCategory) {
            case "Expense" -> List.of("5100", "5200");
            case "Liability" -> List.of("2100");
            default -> List.of();
        };
    }

    @Transactional
    public void deleteAccount(Integer companyId, Long id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Account not found with ID: " + id));
        if (account.getCompany() == null || !account.getCompany().getCompanyId().equals(companyId)) {
            throw new org.springframework.security.access.AccessDeniedException("You do not have permission to delete this account");
        }

        // Check if reserved code
        if (RESERVED_CODES.contains(account.getAccountCode()) || "1100".equals(account.getAccountCode())) {
            throw new IllegalArgumentException("Cannot delete reserved system accounts (e.g., Accounts Receivable, Accounts Payable, Tax, Freight).");
        }

        // Check default configuration
        Company company = account.getCompany();
        if (id.equals(company.getAccountsPayableAccount() != null ? company.getAccountsPayableAccount().getId() : null) ||
            id.equals(company.getAccountsReceivableAccount() != null ? company.getAccountsReceivableAccount().getId() : null) ||
            id.equals(company.getTaxAccount() != null ? company.getTaxAccount().getId() : null) ||
            id.equals(company.getFreightAccount() != null ? company.getFreightAccount().getId() : null)) {
            throw new IllegalArgumentException("Cannot delete account because it is configured as a default account for your company.");
        }

        // Check transaction history
        if (journalEntryLineRepository.existsByAccount_Id(id)) {
            throw new IllegalArgumentException("Cannot delete account because it contains transaction history. Please delete all transactions referencing this account first.");
        }

        accountRepository.delete(account);
    }
}