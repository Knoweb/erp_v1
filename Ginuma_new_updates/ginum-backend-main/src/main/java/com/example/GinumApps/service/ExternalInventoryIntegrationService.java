package com.example.GinumApps.service;

import com.example.GinumApps.client.InventoryClient;
import com.example.GinumApps.dto.external.InventoryPoResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExternalInventoryIntegrationService {

    private final InventoryClient inventoryClient;

    public List<InventoryPoResponseDto> getApprovedPurchaseOrdersBySupplierId(Long supplierId) {
        try {
            log.info("Fetching approved purchase orders for supplierId: {}", supplierId);
            
            List<InventoryPoResponseDto> purchaseOrders = inventoryClient.getPurchaseOrders();
            log.info("Successfully fetched {} purchase orders from inventory service", 
                    purchaseOrders != null ? purchaseOrders.size() : 0);
            
            if (purchaseOrders == null || purchaseOrders.isEmpty()) {
                log.warn("No purchase orders found from inventory service");
                return new ArrayList<>();
            }
            
            List<InventoryPoResponseDto> filtered = purchaseOrders.stream()
                    .filter(Objects::nonNull)
                    .peek(po -> log.debug("Processing PO: id={}, supplierId={}, status={}", 
                            po.getId(), po.getSupplierId(), po.getStatus()))
                    .filter(po -> supplierId.equals(po.getSupplierId()))
                    .filter(po -> "APPROVED".equalsIgnoreCase(po.getStatus()))
                    .collect(Collectors.toList());
            
            log.info("Filtered to {} approved purchase orders for supplierId: {}", 
                    filtered.size(), supplierId);
            return filtered;
            
        } catch (feign.FeignException e) {
            log.error("Feign error fetching purchase orders (status={}): {}", e.status(), e.getMessage());
            return new ArrayList<>();
        } catch (Exception e) {
            log.error("Error fetching approved purchase orders for supplierId: {}", supplierId, e);
            return new ArrayList<>();
        }
    }
}