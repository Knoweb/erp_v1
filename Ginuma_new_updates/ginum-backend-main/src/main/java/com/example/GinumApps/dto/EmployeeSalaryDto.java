package com.example.GinumApps.dto;

import com.example.GinumApps.enums.SalaryFrequency;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeSalaryDto {
    private Long id;
    private Integer employeeId;
    private String employeeName;
    private BigDecimal basicSalary;
    private BigDecimal housingAllowance;
    private BigDecimal transportAllowance;
    private BigDecimal otherAllowances;
    private BigDecimal totalAllowances;
    private BigDecimal totalSalary;
    private SalaryFrequency frequency;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
    private boolean active;
}
