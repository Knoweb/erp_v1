package com.example.GinumApps.repository;

import com.example.GinumApps.model.AgingPayableSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AgingPayableSnapshotRepository extends JpaRepository<AgingPayableSnapshot, Long> {
    List<AgingPayableSnapshot> findByCompany_CompanyId(Integer companyId);
}
