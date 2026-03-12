package com.example.GinumApps.repository;

import com.example.GinumApps.model.InventoryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {
    List<InventoryTransaction> findByCompany_CompanyIdOrderByTransactionDateDesc(Integer companyId);
    List<InventoryTransaction> findByItem_ItemIdOrderByTransactionDateDesc(Long itemId);
    List<InventoryTransaction> findByCompany_CompanyIdAndTransactionDateBetween(
        Integer companyId, LocalDateTime start, LocalDateTime end);
}
