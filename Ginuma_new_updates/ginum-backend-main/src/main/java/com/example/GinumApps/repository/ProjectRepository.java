package com.example.GinumApps.repository;

import com.example.GinumApps.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    Optional<Project> findById(Long id);

    List<Project> findByCompany_CompanyId(Integer companyId);

    // Count projects per company — for auto code generation
    @Query("SELECT COUNT(p) FROM Project p WHERE p.company.companyId = :companyId")
    Long countByCompanyId(@Param("companyId") Integer companyId);

    // Check if project code already used in the same company
    boolean existsByCodeAndCompany_CompanyId(String code, Integer companyId);
}
