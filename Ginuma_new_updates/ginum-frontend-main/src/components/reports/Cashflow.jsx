import React, { useState } from "react";
import api from "../../utils/api";
import Alert from "../Alert/Alert";
import { FaMoneyBillWave, FaPrint, FaFileExport } from "react-icons/fa";

function Cashflow() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCashflowStatement = async () => {
    if (!startDate || !endDate) {
      Alert.error("Please select start and end dates");
      return;
    }

    try {
      setIsLoading(true);
      const companyId = localStorage.getItem("companyId");
      const response = await api.get(
        `/api/companies/${companyId}/reports/cashflow-statement`,
        {
          params: { startDate, endDate },
        }
      );
      setReportData(response.data);
    } catch (error) {
      console.error("Error fetching cashflow statement:", error);
      Alert.error("Failed to load cashflow statement");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "$0.00";
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Math.abs(amount));
    return amount < 0 ? `(${formatted})` : formatted;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-6 print:mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FaMoneyBillWave className="text-3xl text-teal-600" />
            <h1 className="text-2xl font-bold text-gray-800">
              Cashflow Statement
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

        {/* Date Filter */}
        <div className="bg-white p-4 rounded-lg shadow-sm print:hidden">
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
                onClick={fetchCashflowStatement}
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
              Statement of Cash Flows
            </h2>
            <p className="text-gray-600 mt-2">
              For the Period: {startDate} to {endDate}
            </p>
          </div>

          {/* Operating Activities Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 bg-blue-50 p-3 border-l-4 border-blue-500">
              Cash Flows from Operating Activities
            </h3>
            
            <div className="pl-6">
              <div className="flex justify-between py-2 px-4">
                <span className="text-gray-700">Net Income</span>
                <span className="text-gray-800 font-medium">
                  {formatCurrency(reportData.netIncome)}
                </span>
              </div>

              {reportData.operatingAdjustments?.length > 0 && (
                <>
                  <div className="mt-2 mb-2 text-sm font-medium text-gray-600 px-4">
                    Adjustments to reconcile net income:
                  </div>
                  {reportData.operatingAdjustments.map((adjustment, index) => (
                    <div
                      key={index}
                      className="flex justify-between py-2 px-6 hover:bg-gray-50"
                    >
                      <span className="text-gray-700 text-sm">
                        {adjustment.description}
                      </span>
                      <span className="text-gray-800 font-medium text-sm">
                        {formatCurrency(adjustment.amount)}
                      </span>
                    </div>
                  ))}
                </>
              )}

              <div className="flex justify-between py-3 px-4 bg-blue-100 font-bold border-t-2 border-blue-300 mt-4">
                <span>Net Cash from Operating Activities</span>
                <span>{formatCurrency(reportData.netCashFromOperating)}</span>
              </div>
            </div>
          </div>

          {/* Investing Activities Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 bg-purple-50 p-3 border-l-4 border-purple-500">
              Cash Flows from Investing Activities
            </h3>
            
            <div className="pl-6">
              {reportData.investingActivities?.length > 0 ? (
                <>
                  {reportData.investingActivities.map((activity, index) => (
                    <div
                      key={index}
                      className="flex justify-between py-2 px-4 hover:bg-gray-50"
                    >
                      <span className="text-gray-700">{activity.description}</span>
                      <span className="text-gray-800 font-medium">
                        {formatCurrency(activity.amount)}
                      </span>
                    </div>
                  ))}
                </>
              ) : (
                <div className="py-2 px-4 text-gray-500 italic">
                  No investing activities during this period
                </div>
              )}

              <div className="flex justify-between py-3 px-4 bg-purple-100 font-bold border-t-2 border-purple-300 mt-4">
                <span>Net Cash from Investing Activities</span>
                <span>{formatCurrency(reportData.netCashFromInvesting)}</span>
              </div>
            </div>
          </div>

          {/* Financing Activities Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 bg-orange-50 p-3 border-l-4 border-orange-500">
              Cash Flows from Financing Activities
            </h3>
            
            <div className="pl-6">
              {reportData.financingActivities?.length > 0 ? (
                <>
                  {reportData.financingActivities.map((activity, index) => (
                    <div
                      key={index}
                      className="flex justify-between py-2 px-4 hover:bg-gray-50"
                    >
                      <span className="text-gray-700">{activity.description}</span>
                      <span className="text-gray-800 font-medium">
                        {formatCurrency(activity.amount)}
                      </span>
                    </div>
                  ))}
                </>
              ) : (
                <div className="py-2 px-4 text-gray-500 italic">
                  No financing activities during this period
                </div>
              )}

              <div className="flex justify-between py-3 px-4 bg-orange-100 font-bold border-t-2 border-orange-300 mt-4">
                <span>Net Cash from Financing Activities</span>
                <span>{formatCurrency(reportData.netCashFromFinancing)}</span>
              </div>
            </div>
          </div>

          {/* Net Change in Cash */}
          <div className="border-t-4 border-gray-400 pt-6">
            <div className="flex justify-between py-3 px-4 bg-teal-100 font-bold text-lg border-y-2 border-teal-400">
              <span>Net {reportData.netCashChange >= 0 ? 'Increase' : 'Decrease'} in Cash</span>
              <span className={reportData.netCashChange >= 0 ? 'text-green-700' : 'text-red-700'}>
                {formatCurrency(reportData.netCashChange)}
              </span>
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex justify-between py-2 px-4 bg-gray-50">
                <span className="text-gray-700 font-medium">
                  Cash at Beginning of Period
                </span>
                <span className="text-gray-800 font-medium">
                  {formatCurrency(reportData.beginningCash)}
                </span>
              </div>
              <div className="flex justify-between py-2 px-4 bg-gray-50">
                <span className="text-gray-700 font-medium">
                  Net Change in Cash
                </span>
                <span className="text-gray-800 font-medium">
                  {formatCurrency(reportData.netCashChange)}
                </span>
              </div>
              <div className="flex justify-between py-4 px-4 bg-teal-200 font-bold text-lg border-y-4 border-teal-600">
                <span>Cash at End of Period</span>
                <span>{formatCurrency(reportData.endingCash)}</span>
              </div>
            </div>
          </div>

          {/* Informational Note */}
          <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> This cashflow statement is generated using the
              indirect method, starting with net income and adjusting for non-cash
              items. Investing and financing activities are tracked through fixed
              asset and equity/loan transactions.
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!reportData && !isLoading && (
        <div className="bg-white p-12 rounded-lg shadow-sm text-center">
          <FaMoneyBillWave className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            Select date range and generate your cashflow statement
          </p>
        </div>
      )}
    </div>
  );
}

export default Cashflow;
