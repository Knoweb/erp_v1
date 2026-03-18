package com.example.GinumApps.repository;

import com.example.GinumApps.model.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

        // Count how many POs exist for this company — used for sequential number
        // generation
        @Query("SELECT COUNT(p) FROM PurchaseOrder p WHERE p.company.companyId = :companyId")
        Long countByCompanyId(@Param("companyId") Long companyId);

        // Find the last PO number for a company (kept for MAX-based fallback)
        @Query("SELECT MAX(p.poNumber) FROM PurchaseOrder p WHERE p.company.companyId = :companyId")
        String findLastPoNumberByCompanyId(@Param("companyId") Long companyId);

        java.util.List<PurchaseOrder> findByCompany_CompanyId(Integer companyId);

        boolean existsByCompany_CompanyIdAndSupplier_IdAndSupplierInvoiceNumber(Integer companyId, Long supplierId,
                        String supplierInvoiceNumber);

        @Query("SELECT MAX(p.supplierInvoiceNumber) FROM PurchaseOrder p WHERE p.company.companyId = :companyId")
        String findLastSupplierInvoiceNumberByCompanyId(@Param("companyId") Long companyId);
}
