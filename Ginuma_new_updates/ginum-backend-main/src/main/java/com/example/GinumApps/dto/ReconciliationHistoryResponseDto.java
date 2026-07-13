package com.example.GinumApps.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class ReconciliationHistoryResponseDto {
    private Long historyId;
    private Long accountId;
    private String accountName;
    private LocalDate statementDate;
    private BigDecimal statementBalance;
    private LocalDate reconciliationDate;
}
