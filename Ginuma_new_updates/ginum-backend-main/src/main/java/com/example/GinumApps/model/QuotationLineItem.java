package com.example.GinumApps.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Entity
@Table(name = "quotation_line_items")
@Data
public class QuotationLineItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "quotation_id", nullable = false)
    @JsonBackReference("quotation-line-items")
    private Quotation quotation;

    private String description;

    private Integer quantity = 1;

    private BigDecimal unitPrice = BigDecimal.ZERO;

    private BigDecimal discountPercent = BigDecimal.ZERO;

    private BigDecimal totalPrice = BigDecimal.ZERO;

    @PrePersist
    @PreUpdate
    private void calculateTotalPrice() {
        BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(quantity));
        BigDecimal discount = subtotal.multiply(discountPercent.divide(BigDecimal.valueOf(100), RoundingMode.HALF_UP));
        this.totalPrice = subtotal.subtract(discount);
    }
}
