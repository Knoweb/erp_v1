package com.example.GinumApps.controller;

import com.example.GinumApps.dto.external.InventoryPoResponseDto;
import com.example.GinumApps.service.ExternalInventoryIntegrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/finance/external")
@RequiredArgsConstructor
public class ExternalIntegrationController {

    private final ExternalInventoryIntegrationService externalInventoryIntegrationService;

    @GetMapping("/inventory-pos/{supplierId}")
    public ResponseEntity<List<InventoryPoResponseDto>> getApprovedPurchaseOrdersBySupplierId(
            @PathVariable Long supplierId) {
        return ResponseEntity.ok(
                externalInventoryIntegrationService.getApprovedPurchaseOrdersBySupplierId(supplierId)
        );
    }
}