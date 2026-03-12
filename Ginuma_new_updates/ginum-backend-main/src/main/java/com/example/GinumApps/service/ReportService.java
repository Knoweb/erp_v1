package com.example.GinumApps.service;

import com.example.GinumApps.dto.BankReconciliationDto;
import com.example.GinumApps.dto.BalanceSheetDto;
import com.example.GinumApps.dto.CashflowStatementDto;
import com.example.GinumApps.dto.GeneralLedgerDto;
import com.example.GinumApps.dto.IncomeStatementDto;
import com.example.GinumApps.dto.TrialBalanceDto;

import java.time.LocalDate;

public interface ReportService {
    GeneralLedgerDto getGeneralLedger(Integer companyId, Long accountId, LocalDate startDate, LocalDate endDate);
    TrialBalanceDto getTrialBalance(Integer companyId, LocalDate asOfDate);
    BankReconciliationDto getBankReconciliationData(Integer companyId, Long bankAccountId, LocalDate statementDate);
    void markTransactionReconciled(Integer companyId, Long transactionId, boolean reconciled);
    
    // Priority 3 Financial Reports
    IncomeStatementDto getIncomeStatement(Integer companyId, LocalDate startDate, LocalDate endDate);
    BalanceSheetDto getBalanceSheet(Integer companyId, LocalDate asOfDate);
    CashflowStatementDto getCashflowStatement(Integer companyId, LocalDate startDate, LocalDate endDate);
}
