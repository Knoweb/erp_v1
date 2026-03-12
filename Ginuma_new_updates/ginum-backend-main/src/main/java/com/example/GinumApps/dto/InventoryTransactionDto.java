package com.example.GinumApps.dto;

import com.example.GinumApps.enums.InventoryTransactionType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class InventoryTransactionDto {
    private Long id;
    private Long itemId;
    private String itemName;
    private InventoryTransactionType transactionType;
    private String referenceNumber;
    private BigDecimal quantity;
    private BigDecimal unitCost;
    private BigDecimal balanceAfter;
    private String notes;
    private LocalDateTime transactionDate;
    private Integer createdBy;
    private String createdByName;
    private String fromWarehouse;
    private String toWarehouse;
}
