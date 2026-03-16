package com.example.GinumApps.repository;

import com.example.GinumApps.model.JournalEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JournalEntryRepository extends JpaRepository<JournalEntry, Long> {
    List<JournalEntry> findByCompany_CompanyIdOrderByEntryDateDesc(Integer companyId);
}