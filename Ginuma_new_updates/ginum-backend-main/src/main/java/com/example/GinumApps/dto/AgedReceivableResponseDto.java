package com.example.GinumApps.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class AgedReceivableResponseDto {
    private String customer;
    private String invoice;
    private LocalDate invoiceDate;
    private LocalDate dueDate;
    private BigDecimal notDueYet = BigDecimal.ZERO;
    private BigDecimal age1 = BigDecimal.ZERO; // 1-30
    private BigDecimal age2 = BigDecimal.ZERO; // 31-60
    private BigDecimal age3 = BigDecimal.ZERO; // 61-90+
    private BigDecimal total = BigDecimal.ZERO;
    private BigDecimal balance = BigDecimal.ZERO;
}
