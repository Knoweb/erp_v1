package com.example.GinumApps.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuotationLineItemDto {
    private Long id;
    
    @NotNull(message = "Description is required")
    private String description;
    
    @NotNull(message = "Quantity is required")
    private Integer quantity;
    
    @NotNull(message = "Unit price is required")
    private BigDecimal unitPrice;
    
    private BigDecimal discountPercent = BigDecimal.ZERO;
    
    private BigDecimal totalPrice;
}
