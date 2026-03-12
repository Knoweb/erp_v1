package com.example.GinumApps.model;

import com.example.GinumApps.enums.QuotationStatus;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quotations",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"company_id", "quotation_number"}
        ))
@Data
public class Quotation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "quotation_number", nullable = false)
    private String quotationNumber;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    private LocalDate issueDate;

    private LocalDate expiryDate;

    private BigDecimal subtotal = BigDecimal.ZERO;

    private BigDecimal taxPercent = BigDecimal.ZERO;

    private BigDecimal taxAmount = BigDecimal.ZERO;

    private BigDecimal total = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    private QuotationStatus status = QuotationStatus.DRAFT;

    @Column(length = 1000)
    private String notes;

    @Column(length = 1000)
    private String termsAndConditions;

    @OneToMany(mappedBy = "quotation", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("quotation-line-items")
    private List<QuotationLineItem> lineItems = new ArrayList<>();

    @PrePersist
    @PreUpdate
    private void calculateTotals() {
        // Calculate subtotal from line items
        this.subtotal = lineItems.stream()
                .map(item -> item.getUnitPrice()
                        .multiply(BigDecimal.valueOf(item.getQuantity()))
                        .multiply(BigDecimal.ONE.subtract(
                                item.getDiscountPercent().divide(BigDecimal.valueOf(100), RoundingMode.HALF_UP)
                        ))
                )
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calculate tax amount
        if (taxPercent != null && taxPercent.compareTo(BigDecimal.ZERO) > 0) {
            this.taxAmount = subtotal.multiply(taxPercent.divide(BigDecimal.valueOf(100), RoundingMode.HALF_UP));
        } else {
            this.taxAmount = BigDecimal.ZERO;
        }

        // Calculate total
        this.total = subtotal.add(taxAmount);
    }
}
