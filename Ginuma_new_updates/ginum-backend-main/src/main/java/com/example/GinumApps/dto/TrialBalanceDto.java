package com.example.GinumApps.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrialBalanceDto {
    private LocalDate asOfDate;
    private List<AccountBalanceDto> accounts;
    private BigDecimal totalDebits;
    private BigDecimal totalCredits;
    private boolean balanced;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AccountBalanceDto {
        private Long accountId;
        private String accountCode;
        private String accountName;
        private String accountType;
        private String mainCategory;
        private BigDecimal debitBalance;
        private BigDecimal creditBalance;
    }
}
