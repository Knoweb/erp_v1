package com.inventory.inventoryservice.dto;

import lombok.Data;

@Data
public class WarehouseDto {
    private Long id;
    private String warehouseName;
    private String location;
    private String code;
}
