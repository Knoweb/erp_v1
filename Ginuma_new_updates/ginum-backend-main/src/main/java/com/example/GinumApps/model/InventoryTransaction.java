package com.example.GinumApps.model;

import com.example.GinumApps.enums.InventoryTransactionType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "inventory_transaction")
public class InventoryTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = false)
    @JsonIgnore
    private Company company;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InventoryTransactionType transactionType; // STOCK_IN, STOCK_OUT, ADJUSTMENT, TRANSFER

    @Column(nullable = false)
    private String referenceNumber;

    @Column(precision = 19, scale = 4, nullable = false)
    private BigDecimal quantity;

    @Column(precision = 19, scale = 2)
    private BigDecimal unitCost;

    @Column(precision = 19, scale = 4)
    private BigDecimal balanceAfter;

    private String notes;

    @Column(nullable = false)
    private LocalDateTime transactionDate;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private AppUser createdBy;

    // For transfers
    private String fromWarehouse;
    private String toWarehouse;

    @PrePersist
    protected void onCreate() {
        transactionDate = LocalDateTime.now();
    }
}
