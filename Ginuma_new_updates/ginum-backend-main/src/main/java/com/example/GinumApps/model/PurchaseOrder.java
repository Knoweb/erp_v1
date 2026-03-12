package com.example.GinumApps.model;

import com.example.GinumApps.enums.PurchaseType;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "purchase_orders",
            uniqueConstraints = @UniqueConstraint(
                columnNames = {"company_id", "po_number"}
            )
        ) // PO numbers are unique per company)
@Data
public class PurchaseOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "supplier_id", nullable = false)
    @JsonManagedReference("supplier-purchase-orders")
    private Supplier supplier;

    @Column(name = "po_number", nullable = false)
    private String poNumber;

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    private String supplierInvoiceNumber;

    private LocalDate issueDate;

    private LocalDate dueDate;

    private String notes;

    @DecimalMin("0.00")
    private BigDecimal subtotal = BigDecimal.ZERO;

    @DecimalMin("0.00")
    private BigDecimal freight = BigDecimal.ZERO;

    @DecimalMin("0.00")
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @DecimalMin("0.00")
    private BigDecimal total = BigDecimal.ZERO;

    @ManyToOne
    @JoinColumn(name = "payment_account_id")
    private Account paymentAccount;

    @DecimalMin("0.00")
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @DecimalMin("0.00")
    private BigDecimal balanceDue = BigDecimal.ZERO;

    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("po-line-items")
    private List<PurchaseOrderLineItem> items = new ArrayList<>();


    @Enumerated(EnumType.STRING)
    private PurchaseType purchaseType; // ITEM or SERVICE

//    @ManyToOne
//    private Project project;

    @PrePersist
    @PreUpdate
    private void calculateTotals() {
        // Recalculate subtotal from line items (prevents tampered frontend values)
        this.subtotal = items.stream()
                .map(item -> item.getUnitPrice()
                        .multiply(BigDecimal.valueOf(item.getQuantity()))
                        .multiply(BigDecimal.ONE.subtract(
                                item.getDiscountPercent().divide(BigDecimal.valueOf(100), RoundingMode.HALF_UP)
                        ))
                )
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Recalculate total and balance due (enforce consistency)
        this.total = subtotal.add(freight != null ? freight : BigDecimal.ZERO)
                .add(taxAmount != null ? taxAmount : BigDecimal.ZERO);
        this.balanceDue = total.subtract(amountPaid != null ? amountPaid : BigDecimal.ZERO);
        if (this.balanceDue.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalStateException("Overpayment detected");
        }
    }
}
