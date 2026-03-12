package com.example.GinumApps.model;

import com.example.GinumApps.enums.PayeeType;
import com.example.GinumApps.enums.PaymentMethod;
import com.example.GinumApps.enums.TransactionType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "money_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MoneyTransaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;
    
    @Column(nullable = false, unique = true, length = 50)
    private String transactionNumber;
    
    @Column(nullable = false)
    private LocalDate transactionDate;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bank_account_id", nullable = false)
    private BankAccount bankAccount;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PayeeType payeeType;
    
    @Column(nullable = false)
    private Integer payeeId;
    
    @Column(nullable = false, length = 255)
    private String payeeName;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "charge_account_id", nullable = false)
    private Account chargeAccount;
    
    @Column(nullable = false)
    private Double amount;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod paymentMethod;
    
    @Column(length = 100)
    private String referenceNumber;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "journal_entry_id")
    private JournalEntry journalEntry;
    
    @Column(nullable = false)
    private boolean reconciled = false;
    
    @Column
    private LocalDate reconciledDate;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private AppUser createdBy;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
