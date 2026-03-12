package com.example.GinumApps.repository;

import com.example.GinumApps.model.EmployeeSalary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeSalaryRepository extends JpaRepository<EmployeeSalary, Long> {
    List<EmployeeSalary> findByCompany_CompanyId(Integer companyId);
    Optional<EmployeeSalary> findByEmployee_EmployeeIdAndIsActiveTrue(Integer employeeId);
    List<EmployeeSalary> findByEmployee_EmployeeIdOrderByEffectiveFromDesc(Integer employeeId);
}
