package com.example.GinumApps.service;

import com.example.GinumApps.dto.InventoryTransactionDto;
import com.example.GinumApps.dto.StockLevelDto;
import com.example.GinumApps.dto.StockTransactionRequest;

import java.time.LocalDateTime;
import java.util.List;

public interface InventoryService {
    // Transaction Management
    InventoryTransactionDto recordTransaction(Integer companyId, StockTransactionRequest request, Integer userId);
    InventoryTransactionDto getTransactionById(Long transactionId);
    List<InventoryTransactionDto> getAllTransactions(Integer companyId);
    List<InventoryTransactionDto> getTransactionsByItem(Long itemId);
    List<InventoryTransactionDto> getTransactionsByDateRange(Integer companyId, LocalDateTime startDate, LocalDateTime endDate);
    
    // Stock Level Management
    StockLevelDto getStockLevel(Long itemId, String warehouse);
    List<StockLevelDto> getAllStockLevels(Integer companyId);
    List<StockLevelDto> getLowStockItems(Integer companyId);
    List<StockLevelDto> getOutOfStockItems(Integer companyId);
    StockLevelDto updateReorderLevel(Long itemId, String warehouse, java.math.BigDecimal reorderLevel, java.math.BigDecimal maximumLevel);
    
    // Stock Valuation
    java.math.BigDecimal getTotalStockValue(Integer companyId);
}
