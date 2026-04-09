package com.example.GinumApps.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class TaxBreakdownDto {
    private String taxType;
    private BigDecimal percentage;
    private BigDecimal amount;
}
