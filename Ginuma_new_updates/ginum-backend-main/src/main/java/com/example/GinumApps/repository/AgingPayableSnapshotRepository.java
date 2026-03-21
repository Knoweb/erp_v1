package com.example.GinumApps.repository;

import com.example.GinumApps.model.AgingPayableSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AgingPayableSnapshotRepository extends JpaRepository<AgingPayableSnapshot, Long> {
    List<AgingPayableSnapshot> findByCompany_CompanyId(Integer companyId);
    Optional<AgingPayableSnapshot> findByCompany_CompanyIdAndPoNumber(Integer companyId, String poNumber);
}
