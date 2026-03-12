package com.example.GinumApps.repository;

import com.example.GinumApps.enums.QuotationStatus;
import com.example.GinumApps.model.Quotation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface QuotationRepository extends JpaRepository<Quotation, Long> {
    List<Quotation> findByCompany_CompanyId(Integer companyId);
    
    List<Quotation> findByCompany_CompanyIdAndStatus(Integer companyId, QuotationStatus status);
    
    Optional<Quotation> findByIdAndCompany_CompanyId(Long id, Integer companyId);
    
    Optional<Quotation> findByQuotationNumber(String quotationNumber);
    
    @Query("SELECT MAX(q.quotationNumber) FROM Quotation q WHERE q.company.companyId = :companyId")
    String findLastQuotationNumberByCompanyId(@Param("companyId") Integer companyId);
}
