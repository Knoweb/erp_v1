package com.example.GinumApps.model;

import jakarta.persistence.Embeddable;
import lombok.Data;
import java.math.BigDecimal;

@Embeddable
@Data
public class TaxBreakdown {
    private String taxType;
    private BigDecimal percentage;
    private BigDecimal amount;
}
