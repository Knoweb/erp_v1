package com.example.GinumApps.controller;

import com.example.GinumApps.dto.BalanceSheetDto;
import com.example.GinumApps.dto.BankReconciliationDto;
import com.example.GinumApps.dto.CashflowStatementDto;
import com.example.GinumApps.dto.GeneralLedgerDto;
import com.example.GinumApps.dto.IncomeStatementDto;
import com.example.GinumApps.dto.TrialBalanceDto;
import com.example.GinumApps.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/companies/{companyId}/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/general-ledger")
    public ResponseEntity<GeneralLedgerDto> getGeneralLedger(
            @PathVariable Integer companyId,
            @RequestParam Long accountId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        GeneralLedgerDto ledger = reportService.getGeneralLedger(companyId, accountId, startDate, endDate);
        return ResponseEntity.ok(ledger);
    }

    @GetMapping("/trial-balance")
    public ResponseEntity<TrialBalanceDto> getTrialBalance(
            @PathVariable Integer companyId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate) {
        TrialBalanceDto trialBalance = reportService.getTrialBalance(companyId, asOfDate);
        return ResponseEntity.ok(trialBalance);
    }

    @GetMapping("/bank-reconciliation")
    public ResponseEntity<BankReconciliationDto> getBankReconciliation(
            @PathVariable Integer companyId,
            @RequestParam Long bankAccountId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate statementDate) {
        BankReconciliationDto reconciliation = reportService.getBankReconciliationData(
                companyId, bankAccountId, statementDate);
        return ResponseEntity.ok(reconciliation);
    }

    @PostMapping("/bank-reconciliation/mark-reconciled")
    public ResponseEntity<?> markTransactionReconciled(
            @PathVariable Integer companyId,
            @RequestParam Long transactionId,
            @RequestParam boolean reconciled) {
        reportService.markTransactionReconciled(companyId, transactionId, reconciled);
        return ResponseEntity.ok().build();
    }

    // Priority 3 Financial Reports
    @GetMapping("/income-statement")
    public ResponseEntity<IncomeStatementDto> getIncomeStatement(
            @PathVariable Integer companyId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        IncomeStatementDto incomeStatement = reportService.getIncomeStatement(companyId, startDate, endDate);
        return ResponseEntity.ok(incomeStatement);
    }

    @GetMapping("/balance-sheet")
    public ResponseEntity<BalanceSheetDto> getBalanceSheet(
            @PathVariable Integer companyId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate) {
        BalanceSheetDto balanceSheet = reportService.getBalanceSheet(companyId, asOfDate);
        return ResponseEntity.ok(balanceSheet);
    }

    @GetMapping("/cashflow-statement")
    public ResponseEntity<CashflowStatementDto> getCashflowStatement(
            @PathVariable Integer companyId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        CashflowStatementDto cashflow = reportService.getCashflowStatement(companyId, startDate, endDate);
        return ResponseEntity.ok(cashflow);
    }
}
