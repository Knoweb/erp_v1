package com.example.GinumApps.model;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "aging_payables")
@Data
public class AgingPayableSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"company", "hibernateLazyInitializer", "handler"})
    private Supplier supplier;

    @Column(nullable = false)
    private String poNumber;

    @Column(nullable = false)
    private LocalDate dueDate;

    @Column(nullable = false)
    private BigDecimal balanceDue;

    @Column(nullable = false)
    private LocalDate snapshotDate;

    // Aging buckets
    private BigDecimal bucket0to30 = BigDecimal.ZERO;
    private BigDecimal bucket31to60 = BigDecimal.ZERO;
    private BigDecimal bucket61to90 = BigDecimal.ZERO;
    private BigDecimal bucket91plus = BigDecimal.ZERO;

    public void computeBuckets(LocalDate today) {
        if (dueDate == null || today == null) {
            bucket0to30 = BigDecimal.ZERO;
            bucket31to60 = BigDecimal.ZERO;
            bucket61to90 = BigDecimal.ZERO;
            bucket91plus = BigDecimal.ZERO;
            return;
        }

        long days = java.time.temporal.ChronoUnit.DAYS.between(dueDate, today);

        // Reset buckets to zero by default
        bucket0to30 = BigDecimal.ZERO;
        bucket31to60 = BigDecimal.ZERO;
        bucket61to90 = BigDecimal.ZERO;
        bucket91plus = BigDecimal.ZERO;

        if (days >= 0) {
            if (days <= 30) bucket0to30 = balanceDue;
            else if (days <= 60) bucket31to60 = balanceDue;
            else if (days <= 90) bucket61to90 = balanceDue;
            else bucket91plus = balanceDue;
        }
    }
}
