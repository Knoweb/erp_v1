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
public class BankReconciliationDto {
    private Long bankAccountId;
    private String bankAccountName;
    private LocalDate statementDate;
    private BigDecimal statementBalance;
    private BigDecimal systemBalance;
    private BigDecimal clearedBalance;
    private BigDecimal unreconciledDifference;
    private List<TransactionItemDto> transactions;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransactionItemDto {
        private Long transactionId;
        private LocalDate date;
        private String referenceNo;
        private String description;
        private String type; // "deposit" or "withdrawal"
        private BigDecimal amount;
        private boolean reconciled;
        private LocalDate reconciledDate;
    }
}
