import React, { useState, useEffect } from "react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";
import api from "../../utils/api";
import CrossAppNavButton from "../../components/CrossAppNavButton";

// Finance Stats Component
const FinanceStats = ({ revenue, expenses, profit, prevRevenue, prevExpenses, prevProfit }) => {
  return (
    <div className="rounded-lg">
      <h2 className="text-lg font-semibold text-gray-500 mb-4">Last 30 Days</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Revenue" value={revenue || 0} previous={prevRevenue || 0} color="text-green-600" />
        <StatCard title="Total Expenses" value={expenses || 0} previous={prevExpenses || 0} color="text-red-500" />
        <StatCard title="Net Profit" value={profit || 0} previous={prevProfit || 0} color="text-blue-500" />
      </div>
    </div>
  );
};

// Reusable Stat Card Component
const StatCard = ({ title, value, previous, color }) => {
  const change = previous && previous !== 0 ? (((value - previous) / previous) * 100).toFixed(2) : 0;
  const isPositive = change >= 0;

  return (
    <div className="bg-white p-5 rounded-lg shadow flex flex-col items-center">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className={`text-3xl font-semibold ${color}`}>${Number(value).toLocaleString()}</p>
      <p className="text-gray-400 text-xs">from ${Number(previous).toLocaleString()}</p>
      <span
        className={`mt-2 text-sm font-medium px-2 py-1 rounded-full ${
          isPositive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
        }`}
      >
        {isPositive ? "▲" : "▼"} {Math.abs(change)}%
      </span>
    </div>
  );
};

const DashboardPage = () => {
  const [financeStats, setFinanceStats] = useState({
    revenue: 0,
    prevRevenue: 0,
    expenses: 0,
    prevExpenses: 0,
    profit: 0,
    prevProfit: 0,
    recentTransactions: [],
    topClients: [],
    monthlyRevenue: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setIsLoading(true);
        const companyId = localStorage.getItem("companyId");
        if (companyId) {
          const response = await api.get(`/api/companies/${companyId}/dashboard/stats`);
          setFinanceStats(response);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  // Monthly Revenue Chart Data
  const monthlyRevenueChartData = {
    labels: financeStats.monthlyRevenue?.map(m => m.month) || [],
    datasets: [
      {
        label: "Revenue",
        data: financeStats.monthlyRevenue?.map(m => m.revenue) || [],
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderWidth: 2,
        tension: 0.3
      },
      {
        label: "Expenses",
        data: financeStats.monthlyRevenue?.map(m => m.expenses) || [],
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderWidth: 2,
        tension: 0.3
      }
    ]
  };

  // Top Clients Bar Chart Data
  const topClientsChartData = {
    labels: financeStats.topClients?.map(c => c.customerName) || [],
    datasets: [
      {
        label: "Total Sales ($)",
        data: financeStats.topClients?.map(c => c.totalSales) || [],
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1
      }
    ]
  };

  // Revenue vs Expenses Distribution (Doughnut)
  const revenueExpenseDistribution = {
    labels: ["Revenue", "Expenses"],
    datasets: [
      {
        data: [financeStats.revenue || 0, financeStats.expenses || 0],
        backgroundColor: ["#36A2EB", "#FF6384"],
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-100 min-h-screen flex flex-col gap-6">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <CrossAppNavButton />
      </div>

      {/* Finance Stats Section */}
      <FinanceStats
        revenue={financeStats.revenue}
        prevRevenue={financeStats.prevRevenue}
        expenses={financeStats.expenses}
        prevExpenses={financeStats.prevExpenses}
        profit={financeStats.profit}
        prevProfit={financeStats.prevProfit}
      />

      <h2 className="font-semibold text-gray-500">Financial Analytics</h2>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly Revenue & Expenses Line Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
          <h3 className="text-lg font-semibold mb-4">Revenue & Expenses (Last 6 Months)</h3>
          <div className="h-80 w-full">
            <Line data={monthlyRevenueChartData} options={chartOptions} />
          </div>
        </div>

        {/* Top Clients Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
          <h3 className="text-lg font-semibold mb-4">Top 5 Clients by Sales</h3>
          <div className="h-80 w-full">
            <Bar data={topClientsChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Revenue vs Expenses Doughnut */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-4">Revenue vs Expenses (Last 30 Days)</h3>
          <div className="h-80 w-full max-w-md">
            <Doughnut data={revenueExpenseDistribution} options={{...chartOptions, scales: undefined}} />
          </div>
        </div>

        {/* Top Clients List */}
        <div className="bg-white p-6 rounded-lg shadow-lg col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Clients Details</h3>
          <div className="bg-gradient-to-r from-cyan-300 to-cyan-500 h-px mb-6"></div>
          {financeStats.topClients && financeStats.topClients.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-4 text-left">Customer</th>
                    <th className="py-2 px-4 text-right">Total Sales</th>
                    <th className="py-2 px-4 text-right">Orders</th>
                    <th className="py-2 px-4 text-right">Avg Order</th>
                  </tr>
                </thead>
                <tbody>
                  {financeStats.topClients.map((client, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{client.customerName}</td>
                      <td className="py-2 px-4 text-right font-medium text-green-600">
                        ${Number(client.totalSales).toLocaleString()}
                      </td>
                      <td className="py-2 px-4 text-right">{client.orderCount}</td>
                      <td className="py-2 px-4 text-right">
                        ${(Number(client.totalSales) / client.orderCount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">No client data available yet</p>
          )}
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h3>
        <div className="bg-gradient-to-r from-cyan-300 to-cyan-500 h-px mb-6"></div>
        {financeStats.recentTransactions && financeStats.recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-4">Type</th>
                  <th className="py-2 px-4">Reference</th>
                  <th className="py-2 px-4">Date</th>
                  <th className="py-2 px-4">Customer/Supplier</th>
                  <th className="py-2 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {financeStats.recentTransactions.map((tx, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        tx.type === 'SALE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-2 px-4 font-mono text-xs">{tx.referenceNumber}</td>
                    <td className="py-2 px-4">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="py-2 px-4">{tx.customerOrSupplier}</td>
                    <td className={`py-2 px-4 text-right font-medium ${
                      tx.type === 'SALE' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${Number(tx.amount).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">No recent transactions found</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
