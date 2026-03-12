package com.example.GinumApps.dto;

import com.example.GinumApps.enums.DeductionType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayrollRequestDto {
    private LocalDate payPeriodStart;
    private LocalDate payPeriodEnd;
    private LocalDate paymentDate;
    private List<PayrollItemDto> payrollItems;
    private String notes;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PayrollItemDto {
        private Integer employeeId;
        private BigDecimal basicSalary;
        private BigDecimal allowances;
        private BigDecimal overtimePay;
        private BigDecimal bonus;
        private BigDecimal workedDays;
        private BigDecimal overtimeHours;
        private List<DeductionDto> deductions;
        private String notes;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeductionDto {
        private DeductionType deductionType;
        private String description;
        private BigDecimal amount;
        private boolean mandatory;
    }
}
