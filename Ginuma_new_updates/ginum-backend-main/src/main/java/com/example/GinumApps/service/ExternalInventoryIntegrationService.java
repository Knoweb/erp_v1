package com.example.GinumApps.service;

import com.example.GinumApps.client.InventoryClient;
import com.example.GinumApps.dto.external.InventoryPoResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExternalInventoryIntegrationService {

    private final InventoryClient inventoryClient;

    public List<InventoryPoResponseDto> getApprovedPurchaseOrdersBySupplierId(Long supplierId) {
        return inventoryClient.getApprovedPurchaseOrdersBySupplierId(supplierId, "APPROVED");
    }
}