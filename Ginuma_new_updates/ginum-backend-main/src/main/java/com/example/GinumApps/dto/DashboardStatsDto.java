package com.example.GinumApps.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStatsDto {
    private BigDecimal revenue;
    private BigDecimal prevRevenue;
    private BigDecimal expenses;
    private BigDecimal prevExpenses;
    private BigDecimal profit;
    private BigDecimal prevProfit;
    private java.util.List<RecentTransactionDto> recentTransactions;
    private java.util.List<TopClientDto> topClients;
    private java.util.List<MonthlyRevenueDto> monthlyRevenue;
}
