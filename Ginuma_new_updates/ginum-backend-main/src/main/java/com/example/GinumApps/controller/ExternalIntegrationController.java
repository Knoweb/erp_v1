package com.example.GinumApps.controller;

import com.example.GinumApps.dto.external.InventoryPoResponseDto;
import com.example.GinumApps.service.ExternalInventoryIntegrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/finance/external")
@RequiredArgsConstructor
public class ExternalIntegrationController {

    private final ExternalInventoryIntegrationService externalInventoryIntegrationService;

    @GetMapping("/inventory-pos/{supplierId}")
    public ResponseEntity<?> getApprovedPurchaseOrdersBySupplierId(
            @PathVariable Long supplierId) {
        try {
            log.info("Received request for approved POs for supplierId: {}", supplierId);
            List<InventoryPoResponseDto> purchaseOrders = 
                    externalInventoryIntegrationService.getApprovedPurchaseOrdersBySupplierId(supplierId);
            log.info("Successfully retrieved {} approved POs for supplierId: {}", 
                    purchaseOrders.size(), supplierId);
            return ResponseEntity.ok(purchaseOrders);
        } catch (Exception e) {
            log.error("Error retrieving approved POs for supplierId: {}", supplierId, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("timestamp", System.currentTimeMillis());
            errorResponse.put("supplierId", supplierId);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}