package com.example.GinumApps.repository;

import com.example.GinumApps.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByCompany_CompanyId(Integer companyId);
}

