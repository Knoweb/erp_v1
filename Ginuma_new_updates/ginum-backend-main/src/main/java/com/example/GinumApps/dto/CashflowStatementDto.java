package com.example.GinumApps.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CashflowStatementDto {
    private LocalDate startDate;
    private LocalDate endDate;
    
    // Operating Activities
    private BigDecimal netIncome;
    private List<CashflowLineDto> operatingAdjustments;
    private BigDecimal netCashFromOperating;
    
    // Investing Activities
    private List<CashflowLineDto> investingActivities;
    private BigDecimal netCashFromInvesting;
    
    // Financing Activities
    private List<CashflowLineDto> financingActivities;
    private BigDecimal netCashFromFinancing;
    
    // Net Change in Cash
    private BigDecimal netCashChange;
    private BigDecimal beginningCash;
    private BigDecimal endingCash;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CashflowLineDto {
        private String description;
        private BigDecimal amount;
    }
}
