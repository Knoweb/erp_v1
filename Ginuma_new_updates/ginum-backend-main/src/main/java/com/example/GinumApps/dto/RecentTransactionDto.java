package com.example.GinumApps.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RecentTransactionDto {
    private String type; // "SALE" or "PURCHASE"
    private String referenceNumber;
    private LocalDate date;
    private String customerOrSupplier;
    private BigDecimal amount;
}
