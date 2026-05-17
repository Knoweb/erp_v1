package com.example.GinumApps.dto.external;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class InventoryPoResponseDto {
    private String poNumber;
    private Long supplierId;
    private BigDecimal projectedTotal;
    private String status;
}