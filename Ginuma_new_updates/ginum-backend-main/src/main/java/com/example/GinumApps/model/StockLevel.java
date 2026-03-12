package com.example.GinumApps.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "stock_level")
public class StockLevel {
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

    @Column(precision = 19, scale = 4, nullable = false)
    private BigDecimal currentQuantity = BigDecimal.ZERO;

    @Column(precision = 19, scale = 4)
    private BigDecimal reorderLevel;

    @Column(precision = 19, scale = 4)
    private BigDecimal maximumLevel;

    @Column(precision = 19, scale = 2)
    private BigDecimal averageCost;

    private String warehouse;

    private LocalDateTime lastUpdated;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        lastUpdated = LocalDateTime.now();
    }

    public boolean isBelowReorderLevel() {
        if (reorderLevel == null) return false;
        return currentQuantity.compareTo(reorderLevel) < 0;
    }
}
