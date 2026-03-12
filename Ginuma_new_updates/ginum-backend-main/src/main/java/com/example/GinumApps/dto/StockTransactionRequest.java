package com.example.GinumApps.dto;

import com.example.GinumApps.enums.InventoryTransactionType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class StockTransactionRequest {
    private Long itemId;
    private InventoryTransactionType transactionType;
    private String referenceNumber;
    private BigDecimal quantity;
    private BigDecimal unitCost;
    private String notes;
    private LocalDateTime transactionDate;
    private String fromWarehouse;
    private String toWarehouse;
}
