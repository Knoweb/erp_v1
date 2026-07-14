package com.example.GinumApps.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "bank_reconciliation_drafts")
@Data
@NoArgsConstructor
public class BankReconciliationDraft {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    @JsonIgnore
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(nullable = false)
    private LocalDate statementDate;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal statementBalance;

    @ElementCollection
    @CollectionTable(name = "bank_reconciliation_draft_transactions", joinColumns = @JoinColumn(name = "draft_id"))
    @Column(name = "transaction_id")
    private List<Long> transactionIds;
}
