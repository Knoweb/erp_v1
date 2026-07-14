package com.example.GinumApps.repository;

import com.example.GinumApps.model.BankReconciliationDraft;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BankReconciliationDraftRepository extends JpaRepository<BankReconciliationDraft, Long> {
    Optional<BankReconciliationDraft> findByCompany_CompanyIdAndAccount_Id(Integer companyId, Long accountId);
}
