package com.example.GinumApps.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.math.BigDecimal;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class InventoryProductResponseDto {
    private Long id;
    private String name;
    private String sku;
    private String category;
    private BigDecimal price;
}