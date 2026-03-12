package com.example.GinumApps.repository;

import com.example.GinumApps.model.StockLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockLevelRepository extends JpaRepository<StockLevel, Long> {
    Optional<StockLevel> findByItem_ItemIdAndWarehouse(Long itemId, String warehouse);
    List<StockLevel> findByCompany_CompanyId(Integer companyId);
    
    @Query("SELECT s FROM StockLevel s WHERE s.company.companyId = :companyId " +
           "AND s.reorderLevel IS NOT NULL AND s.currentQuantity < s.reorderLevel")
    List<StockLevel> findLowStockItems(Integer companyId);
    
    @Query("SELECT s FROM StockLevel s WHERE s.company.companyId = :companyId " +
           "AND s.currentQuantity = 0")
    List<StockLevel> findOutOfStockItems(Integer companyId);
}
