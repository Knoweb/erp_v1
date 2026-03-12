package com.example.GinumApps.model;

import com.example.GinumApps.enums.SalaryFrequency;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "employee_salary")
public class EmployeeSalary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(precision = 19, scale = 2, nullable = false)
    private BigDecimal basicSalary;

    @Column(precision = 19, scale = 2)
    private BigDecimal housingAllowance = BigDecimal.ZERO;

    @Column(precision = 19, scale = 2)
    private BigDecimal transportAllowance = BigDecimal.ZERO;

    @Column(precision = 19, scale = 2)
    private BigDecimal otherAllowances = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    private SalaryFrequency frequency; // MONTHLY, BI_WEEKLY, WEEKLY

    @Column(nullable = false)
    private LocalDate effectiveFrom;

    private LocalDate effectiveTo;

    private boolean isActive = true;

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = false)
    @JsonIgnore
    private Company company;

    public BigDecimal getTotalAllowances() {
        return housingAllowance.add(transportAllowance).add(otherAllowances);
    }

    public BigDecimal getTotalSalary() {
        return basicSalary.add(getTotalAllowances());
    }
}
