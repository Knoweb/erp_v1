package com.example.GinumApps.repository;

import com.example.GinumApps.enums.TransactionType;
import com.example.GinumApps.model.MoneyTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MoneyTransactionRepository extends JpaRepository<MoneyTransaction, Integer> {
    
    List<MoneyTransaction> findByCompany_CompanyIdOrderByTransactionDateDesc(Integer companyId);
    
    List<MoneyTransaction> findByCompany_CompanyIdAndTypeOrderByTransactionDateDesc(Integer companyId, TransactionType type);
    
    List<MoneyTransaction> findByBankAccount_IdOrderByTransactionDateDesc(Long bankAccountId);
    
    Optional<MoneyTransaction> findTopByCompany_CompanyIdOrderByIdDesc(Integer companyId);
    
    List<MoneyTransaction> findByCompany_CompanyIdAndTransactionDateBetween(
        Integer companyId, 
        LocalDate startDate, 
        LocalDate endDate
    );
    
    List<MoneyTransaction> findByBankAccount_IdAndTransactionDateLessThanEqualOrderByTransactionDateDesc(
        Long bankAccountId, 
        LocalDate statementDate
    );
}
