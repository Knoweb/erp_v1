package com.example.GinumApps.controller;

import com.example.GinumApps.service.ExternalInventoryIntegrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/finance/external")
@RequiredArgsConstructor
@Slf4j
public class ExternalInventoryController {

    private final ExternalInventoryIntegrationService externalService;

    @GetMapping("/items/{id}")
    public ResponseEntity<?> getExternalItem(@PathVariable String id) {
        try {
            Object product = externalService.fetchProductById(id);
            if (product == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(product);
        } catch (Exception e) {
            log.error("Error in getExternalItem for id {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(500).body("Error fetching external item");
        }
    }
}
