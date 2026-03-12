package com.example.GinumApps.dto;

import com.example.GinumApps.enums.DeductionType;
import com.example.GinumApps.enums.PayrollStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayrollResponseDto {
    private Long id;
    private String payrollNumber;
    private LocalDate payPeriodStart;
    private LocalDate payPeriodEnd;
    private LocalDate paymentDate;
    private PayrollStatus status;
    private List<PayrollItemResponseDto> payrollItems;
    private BigDecimal totalGrossPay;
    private BigDecimal totalDeductions;
    private BigDecimal totalNetPay;
    private String notes;
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime approvedAt;
    private String approvedBy;
    private LocalDateTime paidAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PayrollItemResponseDto {
        private Long id;
        private Integer employeeId;
        private String employeeName;
        private String employeeCode;
        private String nic;
        private BigDecimal basicSalary;
        private BigDecimal allowances;
        private BigDecimal overtimePay;
        private BigDecimal bonus;
        private BigDecimal grossPay;
        private List<DeductionResponseDto> deductions;
        private BigDecimal totalDeductions;
        private BigDecimal netPay;
        private BigDecimal workedDays;
        private BigDecimal overtimeHours;
        private String notes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeductionResponseDto {
        private Long id;
        private DeductionType deductionType;
        private String description;
        private BigDecimal amount;
        private boolean mandatory;
    }
}
