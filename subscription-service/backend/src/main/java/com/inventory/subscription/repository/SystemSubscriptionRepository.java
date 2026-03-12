package com.inventory.subscription.repository;

import com.inventory.subscription.enums.SystemName;
import com.inventory.subscription.model.CompanyTenant;
import com.inventory.subscription.model.SystemSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SystemSubscriptionRepository extends JpaRepository<SystemSubscription, Long> {
    
    List<SystemSubscription> findByCompanyTenant(CompanyTenant companyTenant);
    
    Optional<SystemSubscription> findByCompanyTenantAndSystemName(CompanyTenant companyTenant, SystemName systemName);
    
    List<SystemSubscription> findByCompanyTenant_OrgId(Long orgId);
}
