package com.example.GinumApps.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "items", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"company_id", "itemCode"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Item {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String itemCode;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(precision = 19, scale = 2)
    private BigDecimal salesPrice;

    @ManyToOne
    @JoinColumn(name = "income_account_id")
    private Account incomeAccount;

    @Column(precision = 19, scale = 2)
    private BigDecimal purchasePrice;

    @ManyToOne
    @JoinColumn(name = "expense_account_id")
    private Account expenseAccount;

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = false)
    @JsonIgnore
    private Company company;
    private boolean isActive = true;
}

