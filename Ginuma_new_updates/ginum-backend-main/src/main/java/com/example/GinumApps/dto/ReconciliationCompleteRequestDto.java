package com.example.GinumApps.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class ReconciliationCompleteRequestDto {
    private Long bankAccountId;
    private LocalDate statementDate;
    private BigDecimal statementBalance;
    private List<Long> transactionIds;
}
