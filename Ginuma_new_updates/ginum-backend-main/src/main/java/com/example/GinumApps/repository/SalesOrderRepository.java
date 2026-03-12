package com.example.GinumApps.repository;

import com.example.GinumApps.model.SalesOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SalesOrderRepository extends JpaRepository<SalesOrder, Long> {

    // Count how many SOs exist for this company — used for sequential number
    // generation
    @Query("SELECT COUNT(s) FROM SalesOrder s WHERE s.company.companyId = :companyId")
    Long countByCompanyId(@Param("companyId") Long companyId);

    // Keep this for backward compatibility (used by getNextSoNumber)
    @Query("SELECT MAX(s.soNumber) FROM SalesOrder s WHERE s.company.companyId = :companyId")
    String findLastSoNumberByCompanyId(@Param("companyId") Long companyId);

    // Find all orders for a company
    List<SalesOrder> findByCompany_CompanyId(Integer companyId);
}
