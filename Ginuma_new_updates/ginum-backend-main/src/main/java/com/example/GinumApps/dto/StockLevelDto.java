package com.example.GinumApps.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class StockLevelDto {
    private Long id;
    private Long itemId;
    private String itemName;
    private String itemUnit;
    private BigDecimal currentQuantity;
    private BigDecimal reorderLevel;
    private BigDecimal maximumLevel;
    private BigDecimal averageCost;
    private BigDecimal totalValue;
    private String warehouse;
    private LocalDateTime lastUpdated;
    private boolean belowReorderLevel;
}
