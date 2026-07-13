package com.example.GinumApps.repository;

import com.example.GinumApps.model.BankReconciliationHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BankReconciliationHistoryRepository extends JpaRepository<BankReconciliationHistory, Long> {
    List<BankReconciliationHistory> findByCompany_CompanyIdAndAccount_IdOrderByReconciliationDateDesc(Integer companyId, Long accountId);
    
    List<BankReconciliationHistory> findByCompany_CompanyIdOrderByReconciliationDateDesc(Integer companyId);
    
    List<BankReconciliationHistory> findByCompany_CompanyIdAndReconciliationDateBetweenOrderByReconciliationDateDesc(Integer companyId, java.time.LocalDate startDate, java.time.LocalDate endDate);
}
