package com.example.GinumApps.controller;

import com.example.GinumApps.dto.InventoryTransactionDto;
import com.example.GinumApps.dto.StockLevelDto;
import com.example.GinumApps.dto.StockTransactionRequest;
import com.example.GinumApps.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/companies/{companyId}/inventory")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    // Transaction Endpoints

    @PostMapping("/transactions")
    public ResponseEntity<InventoryTransactionDto> recordTransaction(
            @PathVariable Integer companyId,
            @RequestBody StockTransactionRequest request,
            Authentication authentication) {
        
        Integer userId = (Integer) authentication.getPrincipal();
        InventoryTransactionDto transaction = inventoryService.recordTransaction(companyId, request, userId);
        return ResponseEntity.ok(transaction);
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<InventoryTransactionDto>> getAllTransactions(
            @PathVariable Integer companyId) {
        List<InventoryTransactionDto> transactions = inventoryService.getAllTransactions(companyId);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/transactions/{transactionId}")
    public ResponseEntity<InventoryTransactionDto> getTransactionById(
            @PathVariable Long transactionId) {
        InventoryTransactionDto transaction = inventoryService.getTransactionById(transactionId);
        return ResponseEntity.ok(transaction);
    }

    @GetMapping("/transactions/item/{itemId}")
    public ResponseEntity<List<InventoryTransactionDto>> getTransactionsByItem(
            @PathVariable Long itemId) {
        List<InventoryTransactionDto> transactions = inventoryService.getTransactionsByItem(itemId);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/transactions/date-range")
    public ResponseEntity<List<InventoryTransactionDto>> getTransactionsByDateRange(
            @PathVariable Integer companyId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<InventoryTransactionDto> transactions = inventoryService.getTransactionsByDateRange(companyId, startDate, endDate);
        return ResponseEntity.ok(transactions);
    }

    // Stock Level Endpoints

    @GetMapping("/stock-levels")
    public ResponseEntity<List<StockLevelDto>> getAllStockLevels(
            @PathVariable Integer companyId) {
        List<StockLevelDto> stockLevels = inventoryService.getAllStockLevels(companyId);
        return ResponseEntity.ok(stockLevels);
    }

    @GetMapping("/stock-levels/item/{itemId}")
    public ResponseEntity<StockLevelDto> getStockLevel(
            @PathVariable Long itemId,
            @RequestParam(required = false) String warehouse) {
        StockLevelDto stockLevel = inventoryService.getStockLevel(itemId, warehouse);
        return ResponseEntity.ok(stockLevel);
    }

    @GetMapping("/stock-levels/low-stock")
    public ResponseEntity<List<StockLevelDto>> getLowStockItems(
            @PathVariable Integer companyId) {
        List<StockLevelDto> lowStockItems = inventoryService.getLowStockItems(companyId);
        return ResponseEntity.ok(lowStockItems);
    }

    @GetMapping("/stock-levels/out-of-stock")
    public ResponseEntity<List<StockLevelDto>> getOutOfStockItems(
            @PathVariable Integer companyId) {
        List<StockLevelDto> outOfStockItems = inventoryService.getOutOfStockItems(companyId);
        return ResponseEntity.ok(outOfStockItems);
    }

    @PutMapping("/stock-levels/item/{itemId}/reorder-level")
    public ResponseEntity<StockLevelDto> updateReorderLevel(
            @PathVariable Long itemId,
            @RequestParam(required = false) String warehouse,
            @RequestParam BigDecimal reorderLevel,
            @RequestParam(required = false) BigDecimal maximumLevel) {
        StockLevelDto stockLevel = inventoryService.updateReorderLevel(itemId, warehouse, reorderLevel, maximumLevel);
        return ResponseEntity.ok(stockLevel);
    }

    // Valuation Endpoints

    @GetMapping("/valuation/total")
    public ResponseEntity<Map<String, Object>> getTotalStockValue(
            @PathVariable Integer companyId) {
        BigDecimal totalValue = inventoryService.getTotalStockValue(companyId);
        Map<String, Object> response = new HashMap<>();
        response.put("totalStockValue", totalValue);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getInventoryDashboard(
            @PathVariable Integer companyId) {
        List<StockLevelDto> allStockLevels = inventoryService.getAllStockLevels(companyId);
        List<StockLevelDto> lowStockItems = inventoryService.getLowStockItems(companyId);
        List<StockLevelDto> outOfStockItems = inventoryService.getOutOfStockItems(companyId);
        BigDecimal totalValue = inventoryService.getTotalStockValue(companyId);

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("totalItems", allStockLevels.size());
        dashboard.put("lowStockCount", lowStockItems.size());
        dashboard.put("outOfStockCount", outOfStockItems.size());
        dashboard.put("totalStockValue", totalValue);
        dashboard.put("lowStockItems", lowStockItems);
        dashboard.put("outOfStockItems", outOfStockItems);

        return ResponseEntity.ok(dashboard);
    }
}
