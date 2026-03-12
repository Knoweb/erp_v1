package com.inventory.subscription.repository;

import com.inventory.subscription.model.CompanyTenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyTenantRepository extends JpaRepository<CompanyTenant, Long> {
    
    Optional<CompanyTenant> findByOrgId(Long orgId);
    
    boolean existsByOrgId(Long orgId);
}
