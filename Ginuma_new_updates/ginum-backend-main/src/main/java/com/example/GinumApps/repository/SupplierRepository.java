package com.example.GinumApps.repository;

import com.example.GinumApps.model.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    List<Supplier> findByCompany_CompanyId(Integer companyId);

    // Optional<Supplier> findByIdAndCompany_Id(Long id, Integer companyId);
}
