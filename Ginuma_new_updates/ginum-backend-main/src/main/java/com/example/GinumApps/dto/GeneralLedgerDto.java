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
public class GeneralLedgerDto {
    private Long accountId;
    private String accountCode;
    private String accountName;
    private String accountType;
    private BigDecimal openingBalance;
    private BigDecimal closingBalance;
    private List<LedgerTransactionDto> transactions;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LedgerTransactionDto {
        private LocalDate date;
        private String referenceNo;
        private String description;
        private BigDecimal debit;
        private BigDecimal credit;
        private BigDecimal balance;
        private String entryType;
    }
}
