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
public class BalanceSheetDto {
    private LocalDate asOfDate;
    
    // Assets
    private List<AccountSectionDto> currentAssets;
    private BigDecimal totalCurrentAssets;
    private List<AccountSectionDto> fixedAssets;
    private BigDecimal totalFixedAssets;
    private List<AccountSectionDto> otherAssets;
    private BigDecimal totalOtherAssets;
    private BigDecimal totalAssets;
    
    // Liabilities
    private List<AccountSectionDto> currentLiabilities;
    private BigDecimal totalCurrentLiabilities;
    private List<AccountSectionDto> longTermLiabilities;
    private BigDecimal totalLongTermLiabilities;
    private BigDecimal totalLiabilities;
    
    // Equity
    private List<AccountSectionDto> equityAccounts;
    private BigDecimal retainedEarnings;
    private BigDecimal totalEquity;
    
    // Total Liabilities + Equity (must equal Total Assets)
    private BigDecimal totalLiabilitiesAndEquity;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AccountSectionDto {
        private Long accountId;
        private String accountCode;
        private String accountName;
        private BigDecimal balance;
    }
}
