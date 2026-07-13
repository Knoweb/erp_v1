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
public class ReconciliationHistoryDetailResponseDto {
    private Long historyId;
    private Long accountId;
    private String accountName;
    private LocalDate statementDate;
    private BigDecimal statementBalance;
    private BigDecimal clearedBalance;
    private BigDecimal difference;
    private LocalDate reconciliationDate;
    
    private List<ReconciliationTransactionDto> transactions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReconciliationTransactionDto {
        private Long transactionId;
        private LocalDate date;
        private String referenceNo;
        private String description;
        private String type; // "deposit" or "withdrawal"
        private BigDecimal amount;
    }
}
