import React, { useState } from "react";
import api from "../../utils/api";
import Alert from "../Alert/Alert";
import { FaBalanceScale, FaPrint, FaFileExport, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

function BalanceSheet() {
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split("T")[0]);
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalanceSheet = async () => {
    if (!asOfDate) {
      Alert.error("Please select a date");
      return;
    }

    try {
      setIsLoading(true);
      const companyId = localStorage.getItem("companyId");
      const response = await api.get(
        `/api/companies/${companyId}/reports/balance-sheet`,
        {
          params: { asOfDate },
        }
      );
      setReportData(response);
    } catch (error) {
      console.error("Error fetching balance sheet:", error);
      Alert.error("Failed to load balance sheet");
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

  const isBalanced = reportData && 
    Math.abs(reportData.totalAssets - reportData.totalLiabilitiesAndEquity) < 0.01;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-6 print:mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FaBalanceScale className="text-3xl text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Balance Sheet</h1>
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

        {/* Date Filter */}
        <div className="bg-white p-4 rounded-lg shadow-sm print:hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                As Of Date
              </label>
              <input
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchBalanceSheet}
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
            <h2 className="text-2xl font-bold text-gray-800">Balance Sheet</h2>
            <p className="text-gray-600 mt-2">As of {asOfDate}</p>
            {/* Balance Check */}
            <div className="mt-3">
              {isBalanced ? (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <FaCheckCircle />
                  <span className="font-semibold">Balanced</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-red-600">
                  <FaTimesCircle />
                  <span className="font-semibold">
                    Out of Balance by{" "}
                    {formatCurrency(
                      Math.abs(
                        reportData.totalAssets - reportData.totalLiabilitiesAndEquity
                      )
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* ASSETS SIDE */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 bg-blue-100 p-3 rounded">
                ASSETS
              </h3>

              {/* Current Assets */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-700 mb-2 bg-blue-50 p-2">
                  Current Assets
                </h4>
                {reportData.currentAssets?.map((account) => (
                  <div
                    key={account.accountId}
                    className="flex justify-between py-2 px-4 hover:bg-gray-50"
                  >
                    <span className="text-gray-700 text-sm">
                      {account.accountCode} - {account.accountName}
                    </span>
                    <span className="text-gray-800 font-medium text-sm">
                      {formatCurrency(account.balance)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between py-2 px-4 bg-blue-100 font-bold border-t-2 border-blue-300">
                  <span>Total Current Assets</span>
                  <span>{formatCurrency(reportData.totalCurrentAssets)}</span>
                </div>
              </div>

              {/* Fixed Assets */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-700 mb-2 bg-blue-50 p-2">
                  Fixed Assets
                </h4>
                {reportData.fixedAssets?.map((account) => (
                  <div
                    key={account.accountId}
                    className="flex justify-between py-2 px-4 hover:bg-gray-50"
                  >
                    <span className="text-gray-700 text-sm">
                      {account.accountCode} - {account.accountName}
                    </span>
                    <span className="text-gray-800 font-medium text-sm">
                      {formatCurrency(account.balance)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between py-2 px-4 bg-blue-100 font-bold border-t-2 border-blue-300">
                  <span>Total Fixed Assets</span>
                  <span>{formatCurrency(reportData.totalFixedAssets)}</span>
                </div>
              </div>

              {/* Other Assets */}
              {reportData.otherAssets?.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-700 mb-2 bg-blue-50 p-2">
                    Other Assets
                  </h4>
                  {reportData.otherAssets.map((account) => (
                    <div
                      key={account.accountId}
                      className="flex justify-between py-2 px-4 hover:bg-gray-50"
                    >
                      <span className="text-gray-700 text-sm">
                        {account.accountCode} - {account.accountName}
                      </span>
                      <span className="text-gray-800 font-medium text-sm">
                        {formatCurrency(account.balance)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 px-4 bg-blue-100 font-bold border-t-2 border-blue-300">
                    <span>Total Other Assets</span>
                    <span>{formatCurrency(reportData.totalOtherAssets)}</span>
                  </div>
                </div>
              )}

              {/* Total Assets */}
              <div className="flex justify-between py-4 px-4 bg-blue-200 font-bold text-lg border-y-4 border-blue-600">
                <span>TOTAL ASSETS</span>
                <span>{formatCurrency(reportData.totalAssets)}</span>
              </div>
            </div>

            {/* LIABILITIES & EQUITY SIDE */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 bg-red-100 p-3 rounded">
                LIABILITIES & EQUITY
              </h3>

              {/* Current Liabilities */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-700 mb-2 bg-red-50 p-2">
                  Current Liabilities
                </h4>
                {reportData.currentLiabilities?.map((account) => (
                  <div
                    key={account.accountId}
                    className="flex justify-between py-2 px-4 hover:bg-gray-50"
                  >
                    <span className="text-gray-700 text-sm">
                      {account.accountCode} - {account.accountName}
                    </span>
                    <span className="text-gray-800 font-medium text-sm">
                      {formatCurrency(account.balance)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between py-2 px-4 bg-red-100 font-bold border-t-2 border-red-300">
                  <span>Total Current Liabilities</span>
                  <span>{formatCurrency(reportData.totalCurrentLiabilities)}</span>
                </div>
              </div>

              {/* Long Term Liabilities */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-700 mb-2 bg-red-50 p-2">
                  Long Term Liabilities
                </h4>
                {reportData.longTermLiabilities?.map((account) => (
                  <div
                    key={account.accountId}
                    className="flex justify-between py-2 px-4 hover:bg-gray-50"
                  >
                    <span className="text-gray-700 text-sm">
                      {account.accountCode} - {account.accountName}
                    </span>
                    <span className="text-gray-800 font-medium text-sm">
                      {formatCurrency(account.balance)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between py-2 px-4 bg-red-100 font-bold border-t-2 border-red-300">
                  <span>Total Long Term Liabilities</span>
                  <span>{formatCurrency(reportData.totalLongTermLiabilities)}</span>
                </div>
              </div>

              {/* Total Liabilities */}
              <div className="flex justify-between py-3 px-4 bg-red-200 font-bold text-lg border-y-2 border-red-400 mb-6">
                <span>Total Liabilities</span>
                <span>{formatCurrency(reportData.totalLiabilities)}</span>
              </div>

              {/* Equity */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-700 mb-2 bg-purple-50 p-2">
                  Equity
                </h4>
                {reportData.equityAccounts?.map((account) => (
                  <div
                    key={account.accountId}
                    className="flex justify-between py-2 px-4 hover:bg-gray-50"
                  >
                    <span className="text-gray-700 text-sm">
                      {account.accountCode} - {account.accountName}
                    </span>
                    <span className="text-gray-800 font-medium text-sm">
                      {formatCurrency(account.balance)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between py-2 px-4 hover:bg-gray-50">
                  <span className="text-gray-700 text-sm">Retained Earnings</span>
                  <span className={`font-medium text-sm ${reportData.retainedEarnings >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {formatCurrency(reportData.retainedEarnings)}
                  </span>
                </div>
                <div className="flex justify-between py-2 px-4 bg-purple-100 font-bold border-t-2 border-purple-300">
                  <span>Total Equity</span>
                  <span>{formatCurrency(reportData.totalEquity)}</span>
                </div>
              </div>

              {/* Total Liabilities & Equity */}
              <div className="flex justify-between py-4 px-4 bg-purple-200 font-bold text-lg border-y-4 border-purple-600">
                <span>TOTAL LIABILITIES & EQUITY</span>
                <span>{formatCurrency(reportData.totalLiabilitiesAndEquity)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!reportData && !isLoading && (
        <div className="bg-white p-12 rounded-lg shadow-sm text-center">
          <FaBalanceScale className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            Select a date and generate your balance sheet
          </p>
        </div>
      )}
    </div>
  );
}

export default BalanceSheet;
