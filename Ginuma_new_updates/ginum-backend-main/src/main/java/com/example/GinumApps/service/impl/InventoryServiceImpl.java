package com.example.GinumApps.service.impl;

import com.example.GinumApps.dto.InventoryTransactionDto;
import com.example.GinumApps.dto.StockLevelDto;
import com.example.GinumApps.dto.StockTransactionRequest;
import com.example.GinumApps.enums.InventoryTransactionType;
import com.example.GinumApps.model.*;
import com.example.GinumApps.repository.*;
import com.example.GinumApps.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class InventoryServiceImpl implements InventoryService {

    @Autowired
    private InventoryTransactionRepository transactionRepository;

    @Autowired
    private StockLevelRepository stockLevelRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private AppUserRepository appUserRepository;

    @Override
    @Transactional
    public InventoryTransactionDto recordTransaction(Integer companyId, StockTransactionRequest request, Integer userId) {
        // Validate item
        Item item = itemRepository.findById(request.getItemId())
            .orElseThrow(() -> new RuntimeException("Item not found"));

        // Validate company
        Company company = companyRepository.findById(companyId)
            .orElseThrow(() -> new RuntimeException("Company not found"));

        // Validate user
        AppUser user = appUserRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Validate quantity
        if (request.getQuantity() == null || request.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Quantity must be greater than zero");
        }

        // Get or create stock level
        String warehouse = request.getFromWarehouse() != null ? request.getFromWarehouse() : "MAIN";
        StockLevel stockLevel = getOrCreateStockLevel(item, company, warehouse);

        // Calculate new quantity based on transaction type
        BigDecimal quantityChange = BigDecimal.ZERO;
        switch (request.getTransactionType()) {
            case STOCK_IN:
            case RETURN:
                quantityChange = request.getQuantity();
                break;
            case STOCK_OUT:
                quantityChange = request.getQuantity().negate();
                // Check if sufficient stock available
                if (stockLevel.getCurrentQuantity().add(quantityChange).compareTo(BigDecimal.ZERO) < 0) {
                    throw new RuntimeException("Insufficient stock. Available: " + stockLevel.getCurrentQuantity());
                }
                break;
            case ADJUSTMENT:
                // For adjustments, the quantity in request is the new absolute value
                quantityChange = request.getQuantity().subtract(stockLevel.getCurrentQuantity());
                break;
            case TRANSFER:
                // For transfers, reduce from source warehouse
                quantityChange = request.getQuantity().negate();
                if (stockLevel.getCurrentQuantity().add(quantityChange).compareTo(BigDecimal.ZERO) < 0) {
                    throw new RuntimeException("Insufficient stock for transfer. Available: " + stockLevel.getCurrentQuantity());
                }
                // Create STOCK_IN transaction for destination warehouse
                if (request.getToWarehouse() != null) {
                    StockLevel toStockLevel = getOrCreateStockLevel(item, company, request.getToWarehouse());
                    toStockLevel.setCurrentQuantity(toStockLevel.getCurrentQuantity().add(request.getQuantity()));
                    stockLevelRepository.save(toStockLevel);
                }
                break;
        }

        // Update stock level
        BigDecimal newQuantity = stockLevel.getCurrentQuantity().add(quantityChange);
        stockLevel.setCurrentQuantity(newQuantity);

        // Update average cost using weighted average method
        if (request.getTransactionType() == InventoryTransactionType.STOCK_IN && request.getUnitCost() != null) {
            updateAverageCost(stockLevel, request.getQuantity(), request.getUnitCost());
        }

        stockLevelRepository.save(stockLevel);

        // Create transaction record
        InventoryTransaction transaction = new InventoryTransaction();
        transaction.setItem(item);
        transaction.setCompany(company);
        transaction.setTransactionType(request.getTransactionType());
        transaction.setReferenceNumber(request.getReferenceNumber() != null ? 
            request.getReferenceNumber() : generateReferenceNumber(request.getTransactionType()));
        transaction.setQuantity(request.getQuantity());
        transaction.setUnitCost(request.getUnitCost());
        transaction.setBalanceAfter(newQuantity);
        transaction.setNotes(request.getNotes());
        transaction.setTransactionDate(request.getTransactionDate() != null ? 
            request.getTransactionDate() : LocalDateTime.now());
        transaction.setCreatedBy(user);
        transaction.setFromWarehouse(request.getFromWarehouse());
        transaction.setToWarehouse(request.getToWarehouse());

        transaction = transactionRepository.save(transaction);

        return convertTransactionToDto(transaction);
    }

    @Override
    public InventoryTransactionDto getTransactionById(Long transactionId) {
        InventoryTransaction transaction = transactionRepository.findById(transactionId)
            .orElseThrow(() -> new RuntimeException("Transaction not found"));
        return convertTransactionToDto(transaction);
    }

    @Override
    public List<InventoryTransactionDto> getAllTransactions(Integer companyId) {
        List<InventoryTransaction> transactions = transactionRepository
            .findByCompany_CompanyIdOrderByTransactionDateDesc(companyId);
        return transactions.stream()
            .map(this::convertTransactionToDto)
            .collect(Collectors.toList());
    }

    @Override
    public List<InventoryTransactionDto> getTransactionsByItem(Long itemId) {
        List<InventoryTransaction> transactions = transactionRepository
            .findByItem_ItemIdOrderByTransactionDateDesc(itemId);
        return transactions.stream()
            .map(this::convertTransactionToDto)
            .collect(Collectors.toList());
    }

    @Override
    public List<InventoryTransactionDto> getTransactionsByDateRange(Integer companyId, LocalDateTime startDate, LocalDateTime endDate) {
        List<InventoryTransaction> transactions = transactionRepository
            .findByCompany_CompanyIdAndTransactionDateBetween(companyId, startDate, endDate);
        return transactions.stream()
            .map(this::convertTransactionToDto)
            .collect(Collectors.toList());
    }

    @Override
    public StockLevelDto getStockLevel(Long itemId, String warehouse) {
        String warehouseName = warehouse != null ? warehouse : "MAIN";
        StockLevel stockLevel = stockLevelRepository
            .findByItem_ItemIdAndWarehouse(itemId, warehouseName)
            .orElseThrow(() -> new RuntimeException("Stock level not found for item " + itemId + " in warehouse " + warehouseName));
        return convertStockLevelToDto(stockLevel);
    }

    @Override
    public List<StockLevelDto> getAllStockLevels(Integer companyId) {
        List<StockLevel> stockLevels = stockLevelRepository.findByCompany_CompanyId(companyId);
        return stockLevels.stream()
            .map(this::convertStockLevelToDto)
            .collect(Collectors.toList());
    }

    @Override
    public List<StockLevelDto> getLowStockItems(Integer companyId) {
        List<StockLevel> stockLevels = stockLevelRepository.findLowStockItems(companyId);
        return stockLevels.stream()
            .map(this::convertStockLevelToDto)
            .collect(Collectors.toList());
    }

    @Override
    public List<StockLevelDto> getOutOfStockItems(Integer companyId) {
        List<StockLevel> stockLevels = stockLevelRepository.findOutOfStockItems(companyId);
        return stockLevels.stream()
            .map(this::convertStockLevelToDto)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public StockLevelDto updateReorderLevel(Long itemId, String warehouse, BigDecimal reorderLevel, BigDecimal maximumLevel) {
        String warehouseName = warehouse != null ? warehouse : "MAIN";
        StockLevel stockLevel = stockLevelRepository
            .findByItem_ItemIdAndWarehouse(itemId, warehouseName)
            .orElseThrow(() -> new RuntimeException("Stock level not found"));

        stockLevel.setReorderLevel(reorderLevel);
        stockLevel.setMaximumLevel(maximumLevel);
        stockLevel = stockLevelRepository.save(stockLevel);

        return convertStockLevelToDto(stockLevel);
    }

    @Override
    public BigDecimal getTotalStockValue(Integer companyId) {
        List<StockLevel> stockLevels = stockLevelRepository.findByCompany_CompanyId(companyId);
        return stockLevels.stream()
            .map(sl -> {
                BigDecimal avgCost = sl.getAverageCost() != null ? sl.getAverageCost() : BigDecimal.ZERO;
                return sl.getCurrentQuantity().multiply(avgCost);
            })
            .reduce(BigDecimal.ZERO, BigDecimal::add)
            .setScale(2, RoundingMode.HALF_UP);
    }

    // Helper methods

    private StockLevel getOrCreateStockLevel(Item item, Company company, String warehouse) {
        String warehouseName = warehouse != null ? warehouse : "MAIN";
        Optional<StockLevel> existing = stockLevelRepository.findByItem_ItemIdAndWarehouse(item.getItemId(), warehouseName);
        
        if (existing.isPresent()) {
            return existing.get();
        }

        // Create new stock level
        StockLevel stockLevel = new StockLevel();
        stockLevel.setItem(item);
        stockLevel.setCompany(company);
        stockLevel.setWarehouse(warehouseName);
        stockLevel.setCurrentQuantity(BigDecimal.ZERO);
        stockLevel.setAverageCost(BigDecimal.ZERO);
        return stockLevelRepository.save(stockLevel);
    }

    private void updateAverageCost(StockLevel stockLevel, BigDecimal incomingQuantity, BigDecimal incomingCost) {
        BigDecimal currentQuantity = stockLevel.getCurrentQuantity();
        BigDecimal currentAvgCost = stockLevel.getAverageCost() != null ? stockLevel.getAverageCost() : BigDecimal.ZERO;

        if (currentQuantity.compareTo(BigDecimal.ZERO) == 0) {
            // If no existing stock, use incoming cost as average
            stockLevel.setAverageCost(incomingCost);
        } else {
            // Weighted average: (current_qty * current_cost + incoming_qty * incoming_cost) / (current_qty + incoming_qty)
            BigDecimal currentValue = currentQuantity.multiply(currentAvgCost);
            BigDecimal incomingValue = incomingQuantity.multiply(incomingCost);
            BigDecimal totalValue = currentValue.add(incomingValue);
            BigDecimal totalQuantity = currentQuantity.add(incomingQuantity);
            BigDecimal newAvgCost = totalValue.divide(totalQuantity, 2, RoundingMode.HALF_UP);
            stockLevel.setAverageCost(newAvgCost);
        }
    }

    private String generateReferenceNumber(InventoryTransactionType type) {
        String prefix = "";
        switch (type) {
            case STOCK_IN: prefix = "IN"; break;
            case STOCK_OUT: prefix = "OUT"; break;
            case ADJUSTMENT: prefix = "ADJ"; break;
            case TRANSFER: prefix = "TRF"; break;
            case RETURN: prefix = "RET"; break;
        }
        return prefix + "-" + System.currentTimeMillis();
    }

    private InventoryTransactionDto convertTransactionToDto(InventoryTransaction transaction) {
        InventoryTransactionDto dto = new InventoryTransactionDto();
        dto.setId(transaction.getId());
        dto.setItemId(transaction.getItem().getItemId());
        dto.setItemName(transaction.getItem().getName());
        dto.setTransactionType(transaction.getTransactionType());
        dto.setReferenceNumber(transaction.getReferenceNumber());
        dto.setQuantity(transaction.getQuantity());
        dto.setUnitCost(transaction.getUnitCost());
        dto.setBalanceAfter(transaction.getBalanceAfter());
        dto.setNotes(transaction.getNotes());
        dto.setTransactionDate(transaction.getTransactionDate());
        dto.setCreatedBy(transaction.getCreatedBy() != null ? transaction.getCreatedBy().getId() : null);
        dto.setCreatedByName(transaction.getCreatedBy() != null ? transaction.getCreatedBy().getEmail() : null);
        dto.setFromWarehouse(transaction.getFromWarehouse());
        dto.setToWarehouse(transaction.getToWarehouse());
        return dto;
    }

    private StockLevelDto convertStockLevelToDto(StockLevel stockLevel) {
        StockLevelDto dto = new StockLevelDto();
        dto.setId(stockLevel.getId());
        dto.setItemId(stockLevel.getItem().getItemId());
        dto.setItemName(stockLevel.getItem().getName());
        dto.setItemUnit(stockLevel.getItem().getUnit());
        dto.setCurrentQuantity(stockLevel.getCurrentQuantity());
        dto.setReorderLevel(stockLevel.getReorderLevel());
        dto.setMaximumLevel(stockLevel.getMaximumLevel());
        dto.setAverageCost(stockLevel.getAverageCost());
        
        // Calculate total value
        BigDecimal avgCost = stockLevel.getAverageCost() != null ? stockLevel.getAverageCost() : BigDecimal.ZERO;
        dto.setTotalValue(stockLevel.getCurrentQuantity().multiply(avgCost).setScale(2, RoundingMode.HALF_UP));
        
        dto.setWarehouse(stockLevel.getWarehouse());
        dto.setLastUpdated(stockLevel.getLastUpdated());
        dto.setBelowReorderLevel(stockLevel.isBelowReorderLevel());
        return dto;
    }
}
