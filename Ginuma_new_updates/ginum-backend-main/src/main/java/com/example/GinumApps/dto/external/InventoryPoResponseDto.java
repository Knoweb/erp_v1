package com.example.GinumApps.dto.external;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class InventoryPoResponseDto {
    private Long id;
    private Long orgId;
    private String poNumber;
    private Long supplierId;

    @JsonAlias({"totalAmount", "projectedTotal"})
    private BigDecimal projectedTotal;
    private String status;
    private Long warehouseId;
    private Long buyerId;
    private LocalDateTime createdAt;
    private Long createdBy;
    private List<Object> items;
    private String returnReason;
    private LocalDateTime returnedAt;
}