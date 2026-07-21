package com.example.GinumApps.service;

import com.example.GinumApps.dto.*;
import com.example.GinumApps.model.PurchaseOrder;
import com.example.GinumApps.model.SalesOrder;
import com.example.GinumApps.repository.PurchaseOrderRepository;
import com.example.GinumApps.repository.SalesOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {
    
    private final SalesOrderRepository salesOrderRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final ReportService reportService;

    @Override
    public DashboardStatsDto getCompanyDashboardStats(Integer companyId) {
        DashboardStatsDto stats = new DashboardStatsDto();

        // Calculate date ranges
        LocalDate now = LocalDate.now();
        LocalDate last30DaysStart = now.minusDays(30);
        LocalDate prev30DaysStart = now.minusDays(60);
        LocalDate prev30DaysEnd = now.minusDays(31);

        // Get Income Statements for the current and previous periods
        IncomeStatementDto currentIncome = reportService.getIncomeStatement(companyId, last30DaysStart, now);
        IncomeStatementDto prevIncome = reportService.getIncomeStatement(companyId, prev30DaysStart, prev30DaysEnd);

        // Calculate revenue
        BigDecimal revenue = currentIncome.getTotalRevenue() != null ? currentIncome.getTotalRevenue() : BigDecimal.ZERO;
        if (currentIncome.getTotalOtherIncome() != null) revenue = revenue.add(currentIncome.getTotalOtherIncome());

        BigDecimal prevRevenue = prevIncome.getTotalRevenue() != null ? prevIncome.getTotalRevenue() : BigDecimal.ZERO;
        if (prevIncome.getTotalOtherIncome() != null) prevRevenue = prevRevenue.add(prevIncome.getTotalOtherIncome());

        // Calculate expenses
        BigDecimal expenses = currentIncome.getTotalCostOfSales() != null ? currentIncome.getTotalCostOfSales() : BigDecimal.ZERO;
        if (currentIncome.getTotalOperatingExpenses() != null) expenses = expenses.add(currentIncome.getTotalOperatingExpenses());
        if (currentIncome.getTotalOtherExpenses() != null) expenses = expenses.add(currentIncome.getTotalOtherExpenses());

        BigDecimal prevExpenses = prevIncome.getTotalCostOfSales() != null ? prevIncome.getTotalCostOfSales() : BigDecimal.ZERO;
        if (prevIncome.getTotalOperatingExpenses() != null) prevExpenses = prevExpenses.add(prevIncome.getTotalOperatingExpenses());
        if (prevIncome.getTotalOtherExpenses() != null) prevExpenses = prevExpenses.add(prevIncome.getTotalOtherExpenses());

        // Calculate profit
        BigDecimal profit = currentIncome.getNetProfit() != null ? currentIncome.getNetProfit() : BigDecimal.ZERO;
        BigDecimal prevProfit = prevIncome.getNetProfit() != null ? prevIncome.getNetProfit() : BigDecimal.ZERO;

        // Set basic stats
        stats.setRevenue(revenue);
        stats.setPrevRevenue(prevRevenue);
        stats.setExpenses(expenses);
        stats.setPrevExpenses(prevExpenses);
        stats.setProfit(profit);
        stats.setPrevProfit(prevProfit);

        // Get recent transactions (last 10 sales and purchases combined)
        List<RecentTransactionDto> recentTransactions = new ArrayList<>();
        
        // Get all sales and purchase orders for the company (used for charts and lists below)
        List<SalesOrder> allSales = salesOrderRepository.findAll().stream()
                .filter(s -> s.getCompany().getCompanyId().equals(companyId))
                .collect(Collectors.toList());

        List<PurchaseOrder> allPurchases = purchaseOrderRepository.findByCompany_CompanyId(companyId);

        // Add recent sales
        allSales.stream()
                .filter(s -> s.getIssueDate() != null)
                .sorted((a, b) -> b.getIssueDate().compareTo(a.getIssueDate()))
                .limit(5)
                .forEach(s -> recentTransactions.add(new RecentTransactionDto(
                        "SALE",
                        s.getSoNumber(),
                        s.getIssueDate(),
                        s.getCustomer().getName(),
                        s.getTotal()
                )));

        // Add recent purchases
        allPurchases.stream()
                .filter(p -> p.getIssueDate() != null)
                .sorted((a, b) -> b.getIssueDate().compareTo(a.getIssueDate()))
                .limit(5)
                .forEach(p -> recentTransactions.add(new RecentTransactionDto(
                        "PURCHASE",
                        p.getPoNumber(),
                        p.getIssueDate(),
                        p.getSupplier().getSupplierName(),
                        p.getTotal()
                )));

        // Sort all recent transactions by date and take top 10
        recentTransactions.sort((a, b) -> b.getDate().compareTo(a.getDate()));
        stats.setRecentTransactions(recentTransactions.stream().limit(10).collect(Collectors.toList()));

        // Get top clients (top 5 customers by sales)
        Map<String, BigDecimal> customerSales = new HashMap<>();
        Map<String, Long> customerOrderCount = new HashMap<>();

        allSales.forEach(s -> {
            String customerName = s.getCustomer().getName();
            customerSales.merge(customerName, s.getTotal(), BigDecimal::add);
            customerOrderCount.merge(customerName, 1L, Long::sum);
        });

        List<TopClientDto> topClients = customerSales.entrySet().stream()
                .map(entry -> new TopClientDto(
                        entry.getKey(),
                        entry.getValue(),
                        customerOrderCount.get(entry.getKey())
                ))
                .sorted((a, b) -> b.getTotalSales().compareTo(a.getTotalSales()))
                .limit(5)
                .collect(Collectors.toList());

        stats.setTopClients(topClients);

        // Get top suppliers (top 5 suppliers by purchases)
        Map<String, BigDecimal> supplierPurchases = new HashMap<>();
        Map<String, Long> supplierOrderCount = new HashMap<>();

        allPurchases.forEach(p -> {
            String supplierName = p.getSupplier().getSupplierName();
            supplierPurchases.merge(supplierName, p.getTotal(), BigDecimal::add);
            supplierOrderCount.merge(supplierName, 1L, Long::sum);
        });

        List<TopSupplierDto> topSuppliers = supplierPurchases.entrySet().stream()
                .map(entry -> new TopSupplierDto(
                        entry.getKey(),
                        entry.getValue(),
                        supplierOrderCount.get(entry.getKey())
                ))
                .sorted((a, b) -> b.getTotalPurchases().compareTo(a.getTotalPurchases()))
                .limit(5)
                .collect(Collectors.toList());

        stats.setTopSuppliers(topSuppliers);

        // Get monthly revenue for the last 6 months
        List<MonthlyRevenueDto> monthlyRevenue = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate monthStart = now.minusMonths(i).withDayOfMonth(1);
            LocalDate monthEnd = monthStart.plusMonths(1).minusDays(1);

            BigDecimal monthRevenue = allSales.stream()
                    .filter(s -> s.getIssueDate() != null)
                    .filter(s -> !s.getIssueDate().isBefore(monthStart) && !s.getIssueDate().isAfter(monthEnd))
                    .map(SalesOrder::getTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal monthExpenses = allPurchases.stream()
                    .filter(p -> p.getIssueDate() != null)
                    .filter(p -> !p.getIssueDate().isBefore(monthStart) && !p.getIssueDate().isAfter(monthEnd))
                    .map(PurchaseOrder::getTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            String monthName = monthStart.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            monthlyRevenue.add(new MonthlyRevenueDto(monthName, monthRevenue, monthExpenses));
        }

        stats.setMonthlyRevenue(monthlyRevenue);

        return stats;
    }
}
