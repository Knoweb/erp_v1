package com.example.GinumApps.repository;

import com.example.GinumApps.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByCompany_CompanyId(Integer companyId);
    Optional<Item> findByItemCodeAndCompany_CompanyId(String itemCode, Integer companyId);
}
