package com.example.GinumApps.service.impl;

import com.example.GinumApps.dto.BalanceSheetDto;
import com.example.GinumApps.dto.BankReconciliationDto;
import com.example.GinumApps.dto.CashflowStatementDto;
import com.example.GinumApps.dto.GeneralLedgerDto;
import com.example.GinumApps.dto.IncomeStatementDto;
import com.example.GinumApps.dto.TrialBalanceDto;
import com.example.GinumApps.enums.AccountType;
import com.example.GinumApps.model.Account;
import com.example.GinumApps.model.BankAccount;
import com.example.GinumApps.model.JournalEntry;
import com.example.GinumApps.model.JournalEntryLine;
import com.example.GinumApps.model.MoneyTransaction;
import com.example.GinumApps.repository.AccountRepository;
import com.example.GinumApps.repository.BankAccountRepository;
import com.example.GinumApps.repository.JournalEntryLineRepository;
import com.example.GinumApps.repository.MoneyTransactionRepository;
import com.example.GinumApps.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final AccountRepository accountRepository;
    private final JournalEntryLineRepository journalEntryLineRepository;
    private final BankAccountRepository bankAccountRepository;
    private final MoneyTransactionRepository moneyTransactionRepository;
    private final com.example.GinumApps.repository.BankReconciliationHistoryRepository bankReconciliationHistoryRepository;

    @Override
    public GeneralLedgerDto getGeneralLedger(Integer companyId, Long accountId, LocalDate startDate, LocalDate endDate) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (!account.getCompany().getCompanyId().equals(companyId)) {
            throw new RuntimeException("Account does not belong to this company");
        }

        // Get all journal entry lines for this account within date range
        List<JournalEntryLine> lines = journalEntryLineRepository
                .findByAccountAndDateRange(accountId, startDate, endDate);

        // Calculate opening balance (all transactions before start date)
        BigDecimal openingBalance = calculateOpeningBalance(accountId, startDate);

        // Build transactions list
        BigDecimal runningBalance = openingBalance;
        List<GeneralLedgerDto.LedgerTransactionDto> transactions = new ArrayList<>();

        for (JournalEntryLine line : lines) {
            JournalEntry entry = line.getJournalEntry();
            
            BigDecimal debit = line.isDebit() ? line.getAmount() : BigDecimal.ZERO;
            BigDecimal credit = !line.isDebit() ? line.getAmount() : BigDecimal.ZERO;

            // Update running balance based on account type
            if (account.getAccountType().isDebitType()) {
                runningBalance = runningBalance.add(debit).subtract(credit);
            } else {
                runningBalance = runningBalance.add(credit).subtract(debit);
            }

            transactions.add(GeneralLedgerDto.LedgerTransactionDto.builder()
                    .date(entry.getEntryDate())
                    .referenceNo(entry.getReferenceNo())
                    .description(line.getDescription() != null ? line.getDescription() : entry.getJournalTitle())
                    .debit(debit)
                    .credit(credit)
                    .balance(runningBalance)
                    .entryType(entry.getEntryType() != null ? entry.getEntryType().toString() : "MANUAL")
                    .build());
        }

        return GeneralLedgerDto.builder()
                .accountId(account.getId())
                .accountCode(account.getAccountCode())
                .accountName(account.getAccountName())
                .accountType(account.getAccountType().toString())
                .openingBalance(openingBalance)
                .closingBalance(runningBalance)
                .transactions(transactions)
                .build();
    }

    @Override
    public TrialBalanceDto getTrialBalance(Integer companyId, LocalDate asOfDate) {
        // Get all accounts for the company
        List<Account> accounts = accountRepository.findByCompany_CompanyId(companyId);

        BigDecimal totalDebits = BigDecimal.ZERO;
        BigDecimal totalCredits = BigDecimal.ZERO;
        List<TrialBalanceDto.AccountBalanceDto> accountBalances = new ArrayList<>();

        for (Account account : accounts) {
            // 1. Get Opening Balance (Treat null as 0)
            BigDecimal balance = account.getOpeningBalance() != null ? account.getOpeningBalance() : BigDecimal.ZERO;

            // 2. Fetch all Journal Entry Lines before the asOfDate (inclusive)
            List<JournalEntryLine> lines = journalEntryLineRepository.findByAccountBeforeDate(account.getId(), asOfDate.plusDays(1));

            // 3. Pure Mathematical Aggregation based on Account Normal Side
            for (JournalEntryLine line : lines) {
                if (account.getAccountType().isDebitType()) {
                    balance = line.isDebit() ? balance.add(line.getAmount()) : balance.subtract(line.getAmount());
                } else {
                    balance = !line.isDebit() ? balance.add(line.getAmount()) : balance.subtract(line.getAmount());
                }
            }

            // 4. Split into Debit/Credit Columns for the Report
            BigDecimal debitBalance = BigDecimal.ZERO;
            BigDecimal creditBalance = BigDecimal.ZERO;
            
            if (balance.compareTo(BigDecimal.ZERO) != 0) {
                if (account.getAccountType().isDebitType()) {
                    if (balance.compareTo(BigDecimal.ZERO) > 0) {
                        debitBalance = balance;
                    } else {
                        creditBalance = balance.abs();
                    }
                } else {
                    if (balance.compareTo(BigDecimal.ZERO) > 0) {
                        creditBalance = balance;
                    } else {
                        debitBalance = balance.abs();
                    }
                }
            }

            totalDebits = totalDebits.add(debitBalance);
            totalCredits = totalCredits.add(creditBalance);

            accountBalances.add(TrialBalanceDto.AccountBalanceDto.builder()
                    .accountId(account.getId())
                    .accountCode(account.getAccountCode())
                    .accountName(account.getAccountName())
                    .accountType(account.getAccountType().toString())
                    .mainCategory(account.getAccountType().getMainCategory())
                    .debitBalance(debitBalance)
                    .creditBalance(creditBalance)
                    .build());
        }

        // Sort by account code
        accountBalances = accountBalances.stream()
                .sorted(Comparator.comparing(TrialBalanceDto.AccountBalanceDto::getAccountCode))
                .collect(Collectors.toList());

        boolean balanced = totalDebits.compareTo(totalCredits) == 0;

        return TrialBalanceDto.builder()
                .asOfDate(asOfDate)
                .accounts(accountBalances)
                .totalDebits(totalDebits)
                .totalCredits(totalCredits)
                .balanced(balanced)
                .build();
    }

    @Override
    public BankReconciliationDto getBankReconciliationData(Integer companyId, Long bankAccountId, LocalDate statementDate) {
        BankAccount bankAccount = bankAccountRepository.findById(bankAccountId)
                .orElseThrow(() -> new RuntimeException("Bank account not found"));

        if (!bankAccount.getCompany().getCompanyId().equals(companyId)) {
            throw new RuntimeException("Bank account does not belong to this company");
        }

        // IMPORTANT: We now fetch transactions from JournalEntryLine instead of MoneyTransaction
        // This ensures ALL GL impact on the bank account is included (Payments, Receipts, Manual Entries, etc.)
        List<JournalEntryLine> transactions = journalEntryLineRepository
                .findByAccountAndDateDesc(bankAccountId, statementDate);

        BigDecimal systemBalance = bankAccount.getCurrentBalance() != null 
                ? bankAccount.getCurrentBalance() : BigDecimal.ZERO;

        BigDecimal clearedBalance = BigDecimal.ZERO;
        List<BankReconciliationDto.TransactionItemDto> transactionItems = new ArrayList<>();

        for (JournalEntryLine jel : transactions) {
            JournalEntry je = jel.getJournalEntry();
            
            // Debit bank account = Deposit, Credit bank account = Withdrawal
            String type = jel.isDebit() ? "deposit" : "withdrawal";
            BigDecimal amount = jel.getAmount();

            if (jel.isReconciled()) {
                if (type.equals("deposit")) {
                    clearedBalance = clearedBalance.add(amount);
                } else {
                    clearedBalance = clearedBalance.subtract(amount);
                }
            }

            transactionItems.add(BankReconciliationDto.TransactionItemDto.builder()
                    .transactionId(jel.getId())
                    .date(je.getEntryDate())
                    .referenceNo(je.getReferenceNo())
                    .description(jel.getDescription() != null ? jel.getDescription() : je.getJournalTitle())
                    .type(type)
                    .amount(amount)
                    .reconciled(jel.isReconciled())
                    .reconciledDate(jel.getReconciledDate())
                    .build());
        }

        return BankReconciliationDto.builder()
                .bankAccountId(bankAccount.getId())
                .bankAccountName(bankAccount.getAccountName())
                .statementDate(statementDate)
                .statementBalance(BigDecimal.ZERO) // To be provided by user
                .systemBalance(systemBalance)
                .clearedBalance(clearedBalance)
                .unreconciledDifference(systemBalance.subtract(clearedBalance))
                .transactions(transactionItems)
                .build();
    }

    private BigDecimal calculateOpeningBalance(Long accountId, LocalDate beforeDate) {
        Account account = accountRepository.findById(accountId).orElse(null);
        if (account == null) {
            return BigDecimal.ZERO;
        }

        // 1. Get initial balance from the database opening_balance column (Treat null as 0)
        BigDecimal balance = account.getOpeningBalance() != null ? account.getOpeningBalance() : BigDecimal.ZERO;

        // 2. Fetch all Journal Entry Lines strictly before the given date
        List<JournalEntryLine> lines = journalEntryLineRepository.findByAccountBeforeDate(accountId, beforeDate);

        // 3. Pure Mathematical Aggregation based on Account Normal Side
        for (JournalEntryLine line : lines) {
            if (account.getAccountType().isDebitType()) {
                // For Debit-type accounts (Assets, Expenses): Debits increase balance, Credits decrease balance
                if (line.isDebit()) {
                    balance = balance.add(line.getAmount());
                } else {
                    balance = balance.subtract(line.getAmount());
                }
            } else {
                // For Credit-type accounts (Liabilities, Equity, Income): Credits increase balance, Debits decrease balance
                if (!line.isDebit()) {
                    balance = balance.add(line.getAmount());
                } else {
                    balance = balance.subtract(line.getAmount());
                }
            }
        }

        return balance;
    }

    @Override
    public void markTransactionReconciled(Integer companyId, Long transactionId, boolean reconciled) {
        JournalEntryLine jel = journalEntryLineRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction line not found"));

        // Verify transaction belongs to the company
        if (!jel.getAccount().getCompany().getCompanyId().equals(companyId)) {
            throw new RuntimeException("Transaction does not belong to this company");
        }

        jel.setReconciled(reconciled);
        jel.setReconciledDate(reconciled ? LocalDate.now() : null);
        journalEntryLineRepository.save(jel);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void completeBankReconciliation(Integer companyId, com.example.GinumApps.dto.ReconciliationCompleteRequestDto request) {
        BankAccount bankAccount = bankAccountRepository.findById(request.getBankAccountId())
                .orElseThrow(() -> new RuntimeException("Bank account not found"));

        if (!bankAccount.getCompany().getCompanyId().equals(companyId)) {
            throw new RuntimeException("Bank account does not belong to this company");
        }

        // Fetch transactions by ID
        List<JournalEntryLine> transactions = journalEntryLineRepository.findAllById(request.getTransactionIds());
        
        // Ensure they all belong to this account
        for (JournalEntryLine jel : transactions) {
            if (!jel.getAccount().getId().equals(request.getBankAccountId())) {
                throw new RuntimeException("Transaction " + jel.getId() + " does not belong to the selected bank account");
            }
        }

        // Validate Difference == 0
        BigDecimal clearedDeposits = BigDecimal.ZERO;
        BigDecimal clearedWithdrawals = BigDecimal.ZERO;

        for (JournalEntryLine jel : transactions) {
            String type = jel.isDebit() ? "deposit" : "withdrawal";
            if (type.equals("deposit")) {
                clearedDeposits = clearedDeposits.add(jel.getAmount());
            } else {
                clearedWithdrawals = clearedWithdrawals.add(jel.getAmount());
            }
        }

        BigDecimal calculatedClearedBalance = clearedDeposits.subtract(clearedWithdrawals);

        if (request.getStatementBalance().compareTo(calculatedClearedBalance) != 0) {
            throw new RuntimeException("Reconciliation failed: Statement Balance (" + request.getStatementBalance() + 
                ") does not match sum of cleared transactions (" + calculatedClearedBalance + ").");
        }

        // Update transactions
        for (JournalEntryLine jel : transactions) {
            jel.setReconciled(true);
            jel.setReconciledDate(LocalDate.now());
        }
        journalEntryLineRepository.saveAll(transactions);

        // Update Account
        bankAccount.setLastReconciledBalance(request.getStatementBalance());
        bankAccount.setLastReconciledDate(LocalDate.now());
        bankAccountRepository.save(bankAccount);

        // Save History
        com.example.GinumApps.model.BankReconciliationHistory history = new com.example.GinumApps.model.BankReconciliationHistory();
        history.setCompany(bankAccount.getCompany());
        history.setAccount(bankAccount);
        history.setStatementDate(request.getStatementDate());
        history.setStatementBalance(request.getStatementBalance());
        history.setReconciliationDate(LocalDate.now());
        history.setTransactionIds(request.getTransactionIds());
        
        bankReconciliationHistoryRepository.save(history);
    }

    @Override
    public IncomeStatementDto getIncomeStatement(Integer companyId, LocalDate startDate, LocalDate endDate) {
        List<Account> accounts = accountRepository.findByCompany_CompanyId(companyId);

        // Revenue Accounts
        List<IncomeStatementDto.AccountLineDto> revenueAccounts = new ArrayList<>();
        BigDecimal totalRevenue = BigDecimal.ZERO;
        
        for (Account account : accounts) {
            if (account.getAccountType() == AccountType.INCOME) {
                BigDecimal balance = calculateBalanceForPeriod(account.getId(), startDate, endDate);
                if (balance.compareTo(BigDecimal.ZERO) != 0) {
                    revenueAccounts.add(new IncomeStatementDto.AccountLineDto(
                        account.getId(),
                        account.getAccountCode(),
                        account.getAccountName(),
                        balance
                    ));
                    totalRevenue = totalRevenue.add(balance);
                }
            }
        }

        // Cost of Sales Accounts
        List<IncomeStatementDto.AccountLineDto> costOfSalesAccounts = new ArrayList<>();
        BigDecimal totalCostOfSales = BigDecimal.ZERO;
        
        for (Account account : accounts) {
            if (account.getAccountType() == AccountType.COST_OF_SALES) {
                BigDecimal balance = calculateBalanceForPeriod(account.getId(), startDate, endDate);
                if (balance.compareTo(BigDecimal.ZERO) != 0) {
                    costOfSalesAccounts.add(new IncomeStatementDto.AccountLineDto(
                        account.getId(),
                        account.getAccountCode(),
                        account.getAccountName(),
                        balance
                    ));
                    totalCostOfSales = totalCostOfSales.add(balance);
                }
            }
        }

        BigDecimal grossProfit = totalRevenue.subtract(totalCostOfSales);

        // Operating Expenses
        List<IncomeStatementDto.AccountLineDto> operatingExpenses = new ArrayList<>();
        BigDecimal totalOperatingExpenses = BigDecimal.ZERO;
        
        for (Account account : accounts) {
            if (account.getAccountType() == AccountType.EXPENSE) {
                BigDecimal balance = calculateBalanceForPeriod(account.getId(), startDate, endDate);
                if (balance.compareTo(BigDecimal.ZERO) != 0) {
                    operatingExpenses.add(new IncomeStatementDto.AccountLineDto(
                        account.getId(),
                        account.getAccountCode(),
                        account.getAccountName(),
                        balance
                    ));
                    totalOperatingExpenses = totalOperatingExpenses.add(balance);
                }
            }
        }

        BigDecimal operatingIncome = grossProfit.subtract(totalOperatingExpenses);

        // Other Income
        List<IncomeStatementDto.AccountLineDto> otherIncomeAccounts = new ArrayList<>();
        BigDecimal totalOtherIncome = BigDecimal.ZERO;
        
        for (Account account : accounts) {
            if (account.getAccountType() == AccountType.OTHER_INCOME) {
                BigDecimal balance = calculateBalanceForPeriod(account.getId(), startDate, endDate);
                if (balance.compareTo(BigDecimal.ZERO) != 0) {
                    otherIncomeAccounts.add(new IncomeStatementDto.AccountLineDto(
                        account.getId(),
                        account.getAccountCode(),
                        account.getAccountName(),
                        balance
                    ));
                    totalOtherIncome = totalOtherIncome.add(balance);
                }
            }
        }

        // Other Expenses
        List<IncomeStatementDto.AccountLineDto> otherExpenseAccounts = new ArrayList<>();
        BigDecimal totalOtherExpenses = BigDecimal.ZERO;
        
        for (Account account : accounts) {
            if (account.getAccountType() == AccountType.OTHER_EXPENSE) {
                BigDecimal balance = calculateBalanceForPeriod(account.getId(), startDate, endDate);
                if (balance.compareTo(BigDecimal.ZERO) != 0) {
                    otherExpenseAccounts.add(new IncomeStatementDto.AccountLineDto(
                        account.getId(),
                        account.getAccountCode(),
                        account.getAccountName(),
                        balance
                    ));
                    totalOtherExpenses = totalOtherExpenses.add(balance);
                }
            }
        }

        BigDecimal netProfit = operatingIncome.add(totalOtherIncome).subtract(totalOtherExpenses);

        IncomeStatementDto dto = new IncomeStatementDto();
        dto.setStartDate(startDate);
        dto.setEndDate(endDate);
        dto.setRevenueAccounts(revenueAccounts);
        dto.setTotalRevenue(totalRevenue);
        dto.setCostOfSalesAccounts(costOfSalesAccounts);
        dto.setTotalCostOfSales(totalCostOfSales);
        dto.setGrossProfit(grossProfit);
        dto.setOperatingExpenses(operatingExpenses);
        dto.setTotalOperatingExpenses(totalOperatingExpenses);
        dto.setOperatingIncome(operatingIncome);
        dto.setOtherIncomeAccounts(otherIncomeAccounts);
        dto.setTotalOtherIncome(totalOtherIncome);
        dto.setOtherExpenseAccounts(otherExpenseAccounts);
        dto.setTotalOtherExpenses(totalOtherExpenses);
        dto.setNetProfit(netProfit);

        return dto;
    }

    @Override
    public BalanceSheetDto getBalanceSheet(Integer companyId, LocalDate asOfDate) {
        List<Account> accounts = accountRepository.findByCompany_CompanyId(companyId);

        // Current Assets
        List<BalanceSheetDto.AccountSectionDto> currentAssets = new ArrayList<>();
        BigDecimal totalCurrentAssets = BigDecimal.ZERO;
        
        for (Account account : accounts) {
            if (account.getAccountType() == AccountType.ASSET_BANK ||
                account.getAccountType() == AccountType.ASSET_ACCOUNT_RECEIVABLE ||
                account.getAccountType() == AccountType.ASSET_OTHER_CURRENT_ASSET) {
                BigDecimal balance = calculateOpeningBalance(account.getId(), asOfDate.plusDays(1));
                if (balance.compareTo(BigDecimal.ZERO) != 0) {
                    currentAssets.add(new BalanceSheetDto.AccountSectionDto(
                        account.getId(),
                        account.getAccountCode(),
                        account.getAccountName(),
                        balance
                    ));
                    totalCurrentAssets = totalCurrentAssets.add(balance);
                }
            }
        }

        // Fixed Assets
        List<BalanceSheetDto.AccountSectionDto> fixedAssets = new ArrayList<>();
        BigDecimal totalFixedAssets = BigDecimal.ZERO;
        
        for (Account account : accounts) {
            if (account.getAccountType() == AccountType.ASSET_FIXED_ASSET) {
                BigDecimal balance = calculateOpeningBalance(account.getId(), asOfDate.plusDays(1));
                if (balance.compareTo(BigDecimal.ZERO) != 0) {
                    fixedAssets.add(new BalanceSheetDto.AccountSectionDto(
                        account.getId(),
                        account.getAccountCode(),
                        account.getAccountName(),
                        balance
                    ));
                    totalFixedAssets = totalFixedAssets.add(balance);
                }
            }
        }

        // Other Assets
        List<BalanceSheetDto.AccountSectionDto> otherAssets = new ArrayList<>();
        BigDecimal totalOtherAssets = BigDecimal.ZERO;
        
        for (Account account : accounts) {
            if (account.getAccountType() == AccountType.ASSET_OTHER_ASSET) {
                BigDecimal balance = calculateOpeningBalance(account.getId(), asOfDate.plusDays(1));
                if (balance.compareTo(BigDecimal.ZERO) != 0) {
                    otherAssets.add(new BalanceSheetDto.AccountSectionDto(
                        account.getId(),
                        account.getAccountCode(),
                        account.getAccountName(),
                        balance
                    ));
                    totalOtherAssets = totalOtherAssets.add(balance);
                }
            }
        }

        BigDecimal totalAssets = totalCurrentAssets.add(totalFixedAssets).add(totalOtherAssets);

        // Current Liabilities
        List<BalanceSheetDto.AccountSectionDto> currentLiabilities = new ArrayList<>();
        BigDecimal totalCurrentLiabilities = BigDecimal.ZERO;
        
        for (Account account : accounts) {
            if (account.getAccountType() == AccountType.LIABILITY_CREDIT_CARD ||
                account.getAccountType() == AccountType.LIABILITY_ACCOUNTS_PAYABLE ||
                account.getAccountType() == AccountType.LIABILITY_OTHER_CURRENT_LIABILITY) {
                BigDecimal balance = calculateOpeningBalance(account.getId(), asOfDate.plusDays(1));
                if (balance.compareTo(BigDecimal.ZERO) != 0) {
                    currentLiabilities.add(new BalanceSheetDto.AccountSectionDto(
                        account.getId(),
                        account.getAccountCode(),
                        account.getAccountName(),
                        balance
                    ));
                    totalCurrentLiabilities = totalCurrentLiabilities.add(balance);
                }
            }
        }

        // Long Term Liabilities
        List<BalanceSheetDto.AccountSectionDto> longTermLiabilities = new ArrayList<>();
        BigDecimal totalLongTermLiabilities = BigDecimal.ZERO;
        
        for (Account account : accounts) {
            if (account.getAccountType() == AccountType.LIABILITY_LONG_TERM_LIABILITY ||
                account.getAccountType() == AccountType.LIABILITY_OTHER_LIABILITY) {
                BigDecimal balance = calculateOpeningBalance(account.getId(), asOfDate.plusDays(1));
                if (balance.compareTo(BigDecimal.ZERO) != 0) {
                    longTermLiabilities.add(new BalanceSheetDto.AccountSectionDto(
                        account.getId(),
                        account.getAccountCode(),
                        account.getAccountName(),
                        balance
                    ));
                    totalLongTermLiabilities = totalLongTermLiabilities.add(balance);
                }
            }
        }

        BigDecimal totalLiabilities = totalCurrentLiabilities.add(totalLongTermLiabilities);

        // Equity
        List<BalanceSheetDto.AccountSectionDto> equityAccounts = new ArrayList<>();
        BigDecimal equityFromAccounts = BigDecimal.ZERO;
        
        for (Account account : accounts) {
            if (account.getAccountType() == AccountType.EQUITY) {
                BigDecimal balance = calculateOpeningBalance(account.getId(), asOfDate.plusDays(1));
                if (balance.compareTo(BigDecimal.ZERO) != 0) {
                    equityAccounts.add(new BalanceSheetDto.AccountSectionDto(
                        account.getId(),
                        account.getAccountCode(),
                        account.getAccountName(),
                        balance
                    ));
                    equityFromAccounts = equityFromAccounts.add(balance);
                }
            }
        }

        // Calculate retained earnings from inception to asOfDate
        IncomeStatementDto incomeStatement = getIncomeStatement(companyId, LocalDate.of(2000, 1, 1), asOfDate);
        BigDecimal retainedEarnings = incomeStatement.getNetProfit();

        BigDecimal totalEquity = equityFromAccounts.add(retainedEarnings);
        BigDecimal totalLiabilitiesAndEquity = totalLiabilities.add(totalEquity);

        BalanceSheetDto dto = new BalanceSheetDto();
        dto.setAsOfDate(asOfDate);
        dto.setCurrentAssets(currentAssets);
        dto.setTotalCurrentAssets(totalCurrentAssets);
        dto.setFixedAssets(fixedAssets);
        dto.setTotalFixedAssets(totalFixedAssets);
        dto.setOtherAssets(otherAssets);
        dto.setTotalOtherAssets(totalOtherAssets);
        dto.setTotalAssets(totalAssets);
        dto.setCurrentLiabilities(currentLiabilities);
        dto.setTotalCurrentLiabilities(totalCurrentLiabilities);
        dto.setLongTermLiabilities(longTermLiabilities);
        dto.setTotalLongTermLiabilities(totalLongTermLiabilities);
        dto.setTotalLiabilities(totalLiabilities);
        dto.setEquityAccounts(equityAccounts);
        dto.setRetainedEarnings(retainedEarnings);
        dto.setTotalEquity(totalEquity);
        dto.setTotalLiabilitiesAndEquity(totalLiabilitiesAndEquity);

        return dto;
    }

    @Override
    public CashflowStatementDto getCashflowStatement(Integer companyId, LocalDate startDate, LocalDate endDate) {
        // Get net income from Income Statement
        IncomeStatementDto incomeStatement = getIncomeStatement(companyId, startDate, endDate);
        BigDecimal netIncome = incomeStatement.getNetProfit();

        List<CashflowStatementDto.CashflowLineDto> operatingAdjustments = new ArrayList<>();
        // In a full implementation, we would add back non-cash expenses like depreciation
        // and adjust for changes in working capital

        BigDecimal netCashFromOperating = netIncome;

        // Find all bank/cash accounts
        List<Account> cashAccounts = accountRepository.findByCompany_CompanyId(companyId).stream()
                .filter(a -> a.getAccountType() == AccountType.ASSET_BANK)
                .collect(Collectors.toList());

        // Calculate beginning and ending cash balances
        BigDecimal beginningCash = BigDecimal.ZERO;
        BigDecimal endingCash = BigDecimal.ZERO;

        for (Account account : cashAccounts) {
            beginningCash = beginningCash.add(calculateOpeningBalance(account.getId(), startDate));
            endingCash = endingCash.add(calculateOpeningBalance(account.getId(), endDate.plusDays(1)));
        }

        // Investing Activities (simplified - would track fixed asset purchases/sales)
        List<CashflowStatementDto.CashflowLineDto> investingActivities = new ArrayList<>();
        BigDecimal netCashFromInvesting = BigDecimal.ZERO;

        // Financing Activities (simplified - would track loans, equity transactions)
        List<CashflowStatementDto.CashflowLineDto> financingActivities = new ArrayList<>();
        BigDecimal netCashFromFinancing = BigDecimal.ZERO;

        BigDecimal netCashChange = endingCash.subtract(beginningCash);

        CashflowStatementDto dto = new CashflowStatementDto();
        dto.setStartDate(startDate);
        dto.setEndDate(endDate);
        dto.setNetIncome(netIncome);
        dto.setOperatingAdjustments(operatingAdjustments);
        dto.setNetCashFromOperating(netCashFromOperating);
        dto.setInvestingActivities(investingActivities);
        dto.setNetCashFromInvesting(netCashFromInvesting);
        dto.setFinancingActivities(financingActivities);
        dto.setNetCashFromFinancing(netCashFromFinancing);
        dto.setNetCashChange(netCashChange);
        dto.setBeginningCash(beginningCash);
        dto.setEndingCash(endingCash);

        return dto;
    }

    private BigDecimal calculateBalanceForPeriod(Long accountId, LocalDate startDate, LocalDate endDate) {
        List<JournalEntryLine> lines = journalEntryLineRepository
                .findByAccountAndDateRange(accountId, startDate, endDate);

        BigDecimal balance = BigDecimal.ZERO;
        Account account = accountRepository.findById(accountId).orElse(null);
        
        if (account == null) return balance;

        for (JournalEntryLine line : lines) {
            if (account.getAccountType().isDebitType()) {
                if (line.isDebit()) {
                    balance = balance.add(line.getAmount());
                } else {
                    balance = balance.subtract(line.getAmount());
                }
            } else {
                if (!line.isDebit()) {
                    balance = balance.add(line.getAmount());
                } else {
                    balance = balance.subtract(line.getAmount());
                }
            }
        }

        return balance;
    }
}
