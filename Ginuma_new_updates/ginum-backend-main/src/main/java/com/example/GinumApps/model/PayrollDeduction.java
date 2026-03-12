package com.example.GinumApps.model;

import com.example.GinumApps.enums.DeductionType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Entity
@Table(name = "payroll_deduction")
public class PayrollDeduction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "payroll_item_id", nullable = false)
    @JsonIgnore
    private PayrollItem payrollItem;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeductionType deductionType; // TAX, EPF, INSURANCE, LOAN, ADVANCE, OTHER

    @Column(nullable = false)
    private String description;

    @Column(precision = 19, scale = 2, nullable = false)
    private BigDecimal amount;

    private boolean isMandatory = false;
}
