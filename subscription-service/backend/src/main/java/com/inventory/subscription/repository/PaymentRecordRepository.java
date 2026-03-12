package com.inventory.subscription.repository;

import com.inventory.subscription.enums.PaymentApprovalStatus;
import com.inventory.subscription.model.CompanyTenant;
import com.inventory.subscription.model.PaymentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRecordRepository extends JpaRepository<PaymentRecord, Long> {
    
    List<PaymentRecord> findByCompanyTenant(CompanyTenant companyTenant);
    
    List<PaymentRecord> findByApprovalStatus(PaymentApprovalStatus status);
    
    List<PaymentRecord> findByCompanyTenant_OrgId(Long orgId);
}
