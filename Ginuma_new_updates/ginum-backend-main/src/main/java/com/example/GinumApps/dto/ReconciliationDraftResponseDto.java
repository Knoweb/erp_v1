package com.example.GinumApps.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class ReconciliationDraftResponseDto {
    private Long draftId;
    private Long accountId;
    private LocalDate statementDate;
    private BigDecimal statementBalance;
    private List<Long> transactionIds;
}
