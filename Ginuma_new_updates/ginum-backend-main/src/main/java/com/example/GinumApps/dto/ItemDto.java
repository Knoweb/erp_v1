package com.example.GinumApps.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemDto {
    private Long id;
    private String itemCode;
    private String name;
    private String description;
    private BigDecimal salesPrice;
    private Long incomeAccountId;
    private BigDecimal purchasePrice;
    private Long expenseAccountId;
    private Integer companyId;
    private boolean isActive = true;
}
