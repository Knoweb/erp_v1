package com.example.GinumApps.repository;

import com.example.GinumApps.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    List<Customer> findByCompany_CompanyId(Integer companyId);
}
