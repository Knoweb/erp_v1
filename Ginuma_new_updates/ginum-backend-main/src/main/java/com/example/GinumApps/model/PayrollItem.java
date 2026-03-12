package com.example.GinumApps.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "payroll_item")
public class PayrollItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "payroll_id", nullable = false)
    @JsonIgnore
    private Payroll payroll;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(precision = 19, scale = 2, nullable = false)
    private BigDecimal basicSalary;

    @Column(precision = 19, scale = 2)
    private BigDecimal allowances = BigDecimal.ZERO;

    @Column(precision = 19, scale = 2)
    private BigDecimal overtimePay = BigDecimal.ZERO;

    @Column(precision = 19, scale = 2)
    private BigDecimal bonus = BigDecimal.ZERO;

    @Column(precision = 19, scale = 2)
    private BigDecimal grossPay;

    @OneToMany(mappedBy = "payrollItem", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PayrollDeduction> deductions = new ArrayList<>();

    @Column(precision = 19, scale = 2)
    private BigDecimal totalDeductions = BigDecimal.ZERO;

    @Column(precision = 19, scale = 2)
    private BigDecimal netPay;

    @Column(precision = 10, scale = 2)
    private BigDecimal workedDays;

    @Column(precision = 10, scale = 2)
    private BigDecimal overtimeHours;

    private String notes;

    public void calculateTotals() {
        // Calculate gross pay
        grossPay = basicSalary.add(allowances).add(overtimePay).add(bonus);
        
        // Calculate total deductions
        totalDeductions = deductions.stream()
                .map(PayrollDeduction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Calculate net pay
        netPay = grossPay.subtract(totalDeductions);
    }
}
