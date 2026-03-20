import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import Alert from '../Alert/Alert';
import { FaBalanceScale, FaFileDownload, FaPrint, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

function TrialBalance() {
  const [asOfDate, setAsOfDate] = useState('');
  const [trialBalanceData, setTrialBalanceData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [groupedAccounts, setGroupedAccounts] = useState({});

  useEffect(() => {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    setAsOfDate(today);
  }, []);

  const fetchTrialBalance = async () => {
    if (!asOfDate) {
      Alert.error('Please select a date');
      return;
    }

    try {
      setIsLoading(true);
      const companyId = localStorage.getItem('companyId');
      const response = await api.get(`/api/companies/${companyId}/reports/trial-balance`, {
        params: { asOfDate }
      });
      setTrialBalanceData(response);
      
      // Group accounts by main category
      const grouped = {};
      response.accounts.forEach(account => {
        const category = account.mainCategory;
        if (!grouped[category]) {
          grouped[category] = [];
        }
        grouped[category].push(account);
      });
      setGroupedAccounts(grouped);
    } catch (error) {
      console.error('Error fetching trial balance:', error);
      Alert.error('Failed to load trial balance');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const categoryOrder = ['Asset', 'Liability', 'Equity', 'Income', 'Expense', 'Cost of Sales', 'Other Income', 'Other Expense'];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 my-4 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <FaBalanceScale className="text-blue-600 mr-3" />
          Trial Balance
        </h2>
        <div className="mt-4 sm:mt-0 space-x-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition drop-shadow-sm font-medium"
          >
            <FaPrint className="inline mr-2" /> Print
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition drop-shadow-sm font-medium">
            <FaFileDownload className="inline mr-2" /> Export
          </button>
        </div>
      </div>

      {/* Date Selection */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">As Of Date</label>
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="w-full h-11 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <button
            onClick={fetchTrialBalance}
            disabled={isLoading}
            className="h-11 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium disabled:bg-gray-400"
          >
            {isLoading ? 'Loading...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {/* Trial Balance Report */}
      {trialBalanceData && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          {/* Report Header */}
          <div className="mb-6 pb-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Trial Balance Report</h3>
            <p className="text-gray-600">
              As of: <span className="font-medium">{new Date(asOfDate).toLocaleDateString()}</span>
            </p>
            <div className="mt-2 flex items-center">
              {trialBalanceData.balanced ? (
                <span className="flex items-center text-green-600 font-medium">
                  <FaCheckCircle className="mr-2" /> Balanced
                </span>
              ) : (
                <span className="flex items-center text-red-600 font-medium">
                  <FaTimesCircle className="mr-2" /> Out of Balance
                </span>
              )}
            </div>
          </div>

          {/* Accounts by Category */}
          {categoryOrder.map(category => {
            if (!groupedAccounts[category] || groupedAccounts[category].length === 0) return null;
            
            const categoryAccounts = groupedAccounts[category];
            const categoryTotalDebit = categoryAccounts.reduce((sum, acc) => sum + parseFloat(acc.debitBalance || 0), 0);
            const categoryTotalCredit = categoryAccounts.reduce((sum, acc) => sum + parseFloat(acc.creditBalance || 0), 0);

            return (
              <div key={category} className="mb-6">
                <h4 className="text-lg font-bold text-gray-800 mb-3 bg-gray-50 px-4 py-2 rounded-lg">
                  {category}
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-sm text-gray-500 border-b border-gray-300">
                        <th className="py-2 px-4 font-semibold">Account Code</th>
                        <th className="py-2 px-4 font-semibold">Account Name</th>
                        <th className="py-2 px-4 font-semibold text-right">Debit</th>
                        <th className="py-2 px-4 font-semibold text-right">Credit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryAccounts.map((account) => (
                        <tr key={account.accountId} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-4 text-gray-700">{account.accountCode}</td>
                          <td className="py-2 px-4 text-gray-800">{account.accountName}</td>
                          <td className="py-2 px-4 text-right text-gray-800">
                            {account.debitBalance > 0 && 
                              `Rs. ${parseFloat(account.debitBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                          </td>
                          <td className="py-2 px-4 text-right text-gray-800">
                            {account.creditBalance > 0 && 
                              `Rs. ${parseFloat(account.creditBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                          </td>
                        </tr>
                      ))}
                      {/* Category Subtotal */}
                      <tr className="bg-gray-100 font-semibold">
                        <td colSpan="2" className="py-2 px-4 text-gray-800">{category} Total</td>
                        <td className="py-2 px-4 text-right text-gray-800">
                          {categoryTotalDebit > 0 && 
                            `Rs. ${categoryTotalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                        </td>
                        <td className="py-2 px-4 text-right text-gray-800">
                          {categoryTotalCredit > 0 && 
                            `Rs. ${categoryTotalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          {/* Grand Total */}
          <div className="mt-6 pt-4 border-t-2 border-gray-300">
            <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
              <span className="text-lg font-bold text-gray-800">Grand Total</span>
              <div className="flex space-x-8">
                <div className="text-right">
                  <div className="text-sm text-gray-600">Debit</div>
                  <div className="text-xl font-bold text-blue-600">
                    Rs. {parseFloat(trialBalanceData.totalDebits || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Credit</div>
                  <div className="text-xl font-bold text-blue-600">
                    Rs. {parseFloat(trialBalanceData.totalCredits || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>
            {!trialBalanceData.balanced && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 font-medium">
                  ⚠️ Difference: Rs. {Math.abs(trialBalanceData.totalDebits - trialBalanceData.totalCredits).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <p className="text-red-600 text-sm mt-1">The trial balance is not balanced. Please check your journal entries.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {!trialBalanceData && !isLoading && (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
          <FaBalanceScale className="mx-auto text-gray-300 text-6xl mb-4" />
          <p className="text-gray-500 text-lg">Select a date to generate the trial balance report</p>
        </div>
      )}
    </div>
  );
}

export default TrialBalance;