package com.example.GinumApps.repository;

import com.example.GinumApps.model.JournalEntryLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface JournalEntryLineRepository extends JpaRepository<JournalEntryLine, Long> {

    @Query("SELECT jel FROM JournalEntryLine jel " +
           "JOIN jel.journalEntry je " +
           "WHERE jel.account.id = :accountId " +
           "AND je.entryDate BETWEEN :startDate AND :endDate " +
           "ORDER BY je.entryDate, je.id")
    List<JournalEntryLine> findByAccountAndDateRange(
            @Param("accountId") Long accountId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT jel FROM JournalEntryLine jel " +
           "JOIN jel.journalEntry je " +
           "WHERE jel.account.id = :accountId " +
           "AND je.entryDate < :beforeDate " +
           "ORDER BY je.entryDate, je.id")
    List<JournalEntryLine> findByAccountBeforeDate(
            @Param("accountId") Long accountId,
            @Param("beforeDate") LocalDate beforeDate);

    @Query("SELECT jel FROM JournalEntryLine jel WHERE jel.account.id = :accountId")
    List<JournalEntryLine> findByAccount(@Param("accountId") Long accountId);
}
