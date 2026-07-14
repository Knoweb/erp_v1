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
    
    void completeBankReconciliation(Integer companyId, com.example.GinumApps.dto.ReconciliationCompleteRequestDto request);
    
    void saveBankReconciliationDraft(Integer companyId, com.example.GinumApps.dto.ReconciliationDraftRequestDto request);
    com.example.GinumApps.dto.ReconciliationDraftResponseDto getBankReconciliationDraft(Integer companyId, Long accountId);
    
    java.util.List<com.example.GinumApps.dto.ReconciliationHistoryResponseDto> getBankReconciliationHistory(Integer companyId, LocalDate startDate, LocalDate endDate);

    com.example.GinumApps.dto.ReconciliationHistoryDetailResponseDto getBankReconciliationHistoryDetails(Integer companyId, Long historyId);
    
    // Priority 3 Financial Reports
    IncomeStatementDto getIncomeStatement(Integer companyId, LocalDate startDate, LocalDate endDate);
    BalanceSheetDto getBalanceSheet(Integer companyId, LocalDate asOfDate);
    CashflowStatementDto getCashflowStatement(Integer companyId, LocalDate startDate, LocalDate endDate);
}
