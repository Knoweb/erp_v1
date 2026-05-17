package com.example.GinumApps.dto.external;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ItemResponseDto {
    private String id;
    private String name;
    private BigDecimal price;
}
