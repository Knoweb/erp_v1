package com.example.GinumApps.repository;

import com.example.GinumApps.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    List<Customer> findByCompany_CompanyId(Integer companyId);
    Optional<Customer> findByNameAndCompany_CompanyId(String name, Integer companyId);
}
