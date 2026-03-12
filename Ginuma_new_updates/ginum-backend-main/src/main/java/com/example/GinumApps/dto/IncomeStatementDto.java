package com.example.GinumApps.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IncomeStatementDto {
    private LocalDate startDate;
    private LocalDate endDate;
    
    // Revenue Section
    private List<AccountLineDto> revenueAccounts;
    private BigDecimal totalRevenue;
    
    // Cost of Goods Sold
    private List<AccountLineDto> costOfSalesAccounts;
    private BigDecimal totalCostOfSales;
    private BigDecimal grossProfit; // Revenue - Cost of Sales
    
    // Operating Expenses
    private List<AccountLineDto> operatingExpenses;
    private BigDecimal totalOperatingExpenses;
    private BigDecimal operatingIncome; // Gross Profit - Operating Expenses
    
    // Other Income/Expenses
    private List<AccountLineDto> otherIncomeAccounts;
    private List<AccountLineDto> otherExpenseAccounts;
    private BigDecimal totalOtherIncome;
    private BigDecimal totalOtherExpenses;
    
    // Net Profit/Loss
    private BigDecimal netProfit; // Operating Income + Other Income - Other Expenses
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AccountLineDto {
        private Long accountId;
        private String accountCode;
        private String accountName;
        private BigDecimal balance;
    }
}
