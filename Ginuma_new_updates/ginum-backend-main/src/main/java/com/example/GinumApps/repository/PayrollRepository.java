package com.example.GinumApps.repository;

import com.example.GinumApps.enums.PayrollStatus;
import com.example.GinumApps.model.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Long> {
    List<Payroll> findByCompany_CompanyIdOrderByPayPeriodEndDesc(Integer companyId);
    List<Payroll> findByCompany_CompanyIdAndStatus(Integer companyId, PayrollStatus status);
    Optional<Payroll> findTopByCompany_CompanyIdOrderByIdDesc(Integer companyId);
    List<Payroll> findByCompany_CompanyIdAndPayPeriodEndBetween(Integer companyId, LocalDate start, LocalDate end);
}
