package com.example.GinumApps.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MonthlyRevenueDto {
    private String month;
    private BigDecimal revenue;
    private BigDecimal expenses;
}
