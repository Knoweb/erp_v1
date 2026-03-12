package com.example.GinumApps.dto;

import com.example.GinumApps.enums.LineItemType;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class SalesOrderItemRequestDto {
    @NotNull
    private Long itemId;

    @NotBlank
    private String description;

    @NotBlank
    private String accountCode;

    @Positive
    private int quantity;

    @DecimalMin("0.01")
    private BigDecimal unitPrice;

    @DecimalMin("0.00")
    @DecimalMax("100.00")
    private BigDecimal discountPercent = BigDecimal.ZERO;

    private Long projectId;

    private LineItemType itemType; // GOODS or SERVICE
}
