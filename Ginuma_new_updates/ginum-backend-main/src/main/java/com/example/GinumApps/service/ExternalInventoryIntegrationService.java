package com.example.GinumApps.service;

import com.example.GinumApps.client.InventoryClient;
import com.example.GinumApps.dto.external.InventoryPoResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExternalInventoryIntegrationService {

    private final InventoryClient inventoryClient;

    public List<InventoryPoResponseDto> getApprovedPurchaseOrdersBySupplierId(Long supplierId) {
        return inventoryClient.getPurchaseOrders().stream()
                .filter(Objects::nonNull)
                .filter(po -> supplierId.equals(po.getSupplierId()))
                .filter(po -> "APPROVED".equalsIgnoreCase(po.getStatus()))
                .collect(Collectors.toList());
    }
}