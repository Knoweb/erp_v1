import React, { useState } from "react";
import api from "../../utils/api";
import Alert from "../Alert/Alert";
import { FaFileInvoiceDollar, FaPrint, FaFileExport } from "react-icons/fa";

function IncomeStatement() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchIncomeStatement = async () => {
    if (!startDate || !endDate) {
      Alert.error("Please select start and end dates");
      return;
    }

    try {
      setIsLoading(true);
      const companyId = localStorage.getItem("companyId");
      const response = await api.get(
        `/api/companies/${companyId}/reports/income-statement`,
        {
          params: { startDate, endDate },
        }
      );
      setReportData(response);
    } catch (error) {
      console.error("Error fetching income statement:", error);
      Alert.error("Failed to load income statement");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "Rs. 0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "LKR",
    }).format(amount);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-6 print:mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FaFileInvoiceDollar className="text-3xl text-green-600" />
            <h1 className="text-2xl font-bold text-gray-800">
              Income Statement
            </h1>
          </div>
          {reportData && (
            <div className="flex gap-2 print:hidden">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                <FaPrint /> Print
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
                <FaFileExport /> Export
              </button>
            </div>
          )}
        </div>

        {/* Date Filter - Hidden on Print */}
        <div className="bg-white p-4 rounded-lg shadow-sm print:hidden no-print filter-section">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchIncomeStatement}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:bg-gray-400"
              >
                {isLoading ? "Loading..." : "Generate Report"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Display */}
      {reportData && (
        <div className="bg-white p-8 rounded-lg shadow-sm">
          {/* Report Header */}
          <div className="text-center mb-8 border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Income Statement (Profit & Loss)
            </h2>
            <p className="text-gray-600 mt-2">
              For the Period: {startDate} to {endDate}
            </p>
          </div>

          {/* Revenue Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 bg-green-50 p-2">
              Revenue
            </h3>
            {reportData.revenueAccounts?.map((account) => (
              <div
                key={account.accountId}
                className="flex justify-between py-2 px-4 hover:bg-gray-50"
              >
                <span className="text-gray-700">
                  {account.accountCode} - {account.accountName}
                </span>
                <span className="text-gray-800 font-medium">
                  {formatCurrency(account.balance)}
                </span>
              </div>
            ))}
            <div className="flex justify-between py-3 px-4 bg-green-100 font-bold border-t-2 border-green-300">
              <span>Total Revenue</span>
              <span>{formatCurrency(reportData.totalRevenue)}</span>
            </div>
          </div>

          {/* Cost of Sales Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 bg-orange-50 p-2">
              Cost of Sales
            </h3>
            {reportData.costOfSalesAccounts?.map((account) => (
              <div
                key={account.accountId}
                className="flex justify-between py-2 px-4 hover:bg-gray-50"
              >
                <span className="text-gray-700">
                  {account.accountCode} - {account.accountName}
                </span>
                <span className="text-gray-800 font-medium">
                  {formatCurrency(account.balance)}
                </span>
              </div>
            ))}
            <div className="flex justify-between py-3 px-4 bg-orange-100 font-bold border-t-2 border-orange-300">
              <span>Total Cost of Sales</span>
              <span>{formatCurrency(reportData.totalCostOfSales)}</span>
            </div>
          </div>

          {/* Gross Profit */}
          <div className="flex justify-between py-3 px-4 bg-blue-100 font-bold text-lg border-y-2 border-blue-400 mb-6">
            <span>Gross Profit</span>
            <span>{formatCurrency(reportData.grossProfit)}</span>
          </div>

          {/* Operating Expenses Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 bg-red-50 p-2">
              Operating Expenses
            </h3>
            {reportData.operatingExpenses?.map((account) => (
              <div
                key={account.accountId}
                className="flex justify-between py-2 px-4 hover:bg-gray-50"
              >
                <span className="text-gray-700">
                  {account.accountCode} - {account.accountName}
                </span>
                <span className="text-gray-800 font-medium">
                  {formatCurrency(account.balance)}
                </span>
              </div>
            ))}
            <div className="flex justify-between py-3 px-4 bg-red-100 font-bold border-t-2 border-red-300">
              <span>Total Operating Expenses</span>
              <span>{formatCurrency(reportData.totalOperatingExpenses)}</span>
            </div>
          </div>

          {/* Operating Income */}
          <div className="flex justify-between py-3 px-4 bg-purple-100 font-bold text-lg border-y-2 border-purple-400 mb-6">
            <span>Operating Income</span>
            <span>{formatCurrency(reportData.operatingIncome)}</span>
          </div>

          {/* Other Income Section */}
          {reportData.otherIncomeAccounts?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3 bg-teal-50 p-2">
                Other Income
              </h3>
              {reportData.otherIncomeAccounts.map((account) => (
                <div
                  key={account.accountId}
                  className="flex justify-between py-2 px-4 hover:bg-gray-50"
                >
                  <span className="text-gray-700">
                    {account.accountCode} - {account.accountName}
                  </span>
                  <span className="text-gray-800 font-medium">
                    {formatCurrency(account.balance)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between py-3 px-4 bg-teal-100 font-bold border-t-2 border-teal-300">
                <span>Total Other Income</span>
                <span>{formatCurrency(reportData.totalOtherIncome)}</span>
              </div>
            </div>
          )}

          {/* Other Expenses Section */}
          {reportData.otherExpenseAccounts?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3 bg-pink-50 p-2">
                Other Expenses
              </h3>
              {reportData.otherExpenseAccounts.map((account) => (
                <div
                  key={account.accountId}
                  className="flex justify-between py-2 px-4 hover:bg-gray-50"
                >
                  <span className="text-gray-700">
                    {account.accountCode} - {account.accountName}
                  </span>
                  <span className="text-gray-800 font-medium">
                    {formatCurrency(account.balance)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between py-3 px-4 bg-pink-100 font-bold border-t-2 border-pink-300">
                <span>Total Other Expenses</span>
                <span>{formatCurrency(reportData.totalOtherExpenses)}</span>
              </div>
            </div>
          )}

          {/* Net Profit/Loss */}
          <div
            className={`flex justify-between py-4 px-4 font-bold text-xl border-y-4 ${
              reportData.netProfit >= 0
                ? "bg-green-200 border-green-600 text-green-900"
                : "bg-red-200 border-red-600 text-red-900"
            }`}
          >
            <span>Net {reportData.netProfit >= 0 ? "Profit" : "Loss"}</span>
            <span>{formatCurrency(Math.abs(reportData.netProfit))}</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!reportData && !isLoading && (
        <div className="bg-white p-12 rounded-lg shadow-sm text-center">
          <FaFileInvoiceDollar className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            Select date range and generate your income statement
          </p>
        </div>
      )}
    </div>
  );
}

export default IncomeStatement;
