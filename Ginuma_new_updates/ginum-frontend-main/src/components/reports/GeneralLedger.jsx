import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import Alert from '../Alert/Alert';
import { FaBook, FaFileDownload, FaPrint, FaFilter } from 'react-icons/fa';

function GeneralLedger() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [ledgerData, setLedgerData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
    // Set default dates (current month)
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  }, []);

  const fetchAccounts = async () => {
    try {
      const companyId = localStorage.getItem('companyId');
      if (!companyId) return;

      const response = await api.get(`/api/companies/${companyId}/accounts`);
      let accountsData = response.data || response;
      if (!Array.isArray(accountsData)) throw new Error('Invalid accounts structure');

      setAccounts(accountsData);
      if (accountsData.length > 0) {
        setSelectedAccountId(accountsData[0].id);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      Alert.error('Failed to load accounts');
    }
  };

  const fetchLedger = async () => {
    if (!selectedAccountId || !startDate || !endDate) {
      Alert.error('Please select account and date range');
      return;
    }

    try {
      setIsLoading(true);
      const companyId = localStorage.getItem('companyId');
      const response = await api.get(`/api/companies/${companyId}/reports/general-ledger`, {
        params: {
          accountId: selectedAccountId,
          startDate,
          endDate
        }
      });
      setLedgerData(response);
    } catch (error) {
      console.error('Error fetching ledger:', error);
      Alert.error('Failed to load general ledger');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 my-4 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <FaBook className="text-blue-600 mr-3" />
          General Ledger
        </h2>
        <div className="mt-4 sm:mt-0 space-x-3">
          <button
            onClick={handlePrint}
            className  ="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition drop-shadow-sm font-medium"
          >
            <FaPrint className="inline mr-2" /> Print
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition drop-shadow-sm font-medium">
            <FaFileDownload className="inline mr-2" /> Export
          </button>
        </div>
      </div>

      {/* Filters - Hidden on Print */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 no-print filter-section">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FaFilter className="mr-2 text-blue-600" /> Filters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full h-11 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.accountName} ({acc.accountCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full h-11 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full h-11 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchLedger}
              disabled={isLoading}
              className="w-full h-11 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium disabled:bg-gray-400"
            >
              {isLoading ? 'Loading...' : 'Generate'}
            </button>
          </div>
        </div>
      </div>

      {/* Ledger Report */}
      {ledgerData && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          {/* Account Info */}
          <div className="mb-6 pb-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">{ledgerData.accountName}</h3>
            <p className="text-gray-600">
              Account Code: <span className="font-medium">{ledgerData.accountCode}</span>
              {' '} | Account Type: <span className="font-medium">{ledgerData.accountType}</span>
            </p>
            <p className="text-gray-600 mt-1">
              Period: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
            </p>
          </div>

          {/* Opening Balance */}
          <div className="mb-4 flex justify-between items-center bg-gray-50 p-4 rounded-lg">
            <span className="font-semibold text-gray-700">Opening Balance:</span>
            <span className="text-lg font-bold text-gray-900">
              Rs. {parseFloat(ledgerData.openingBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-sm text-gray-500 border-b-2 border-gray-300">
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Reference</th>
                  <th className="py-3 px-4 font-semibold">Description</th>
                  <th className="py-3 px-4 font-semibold text-right">Debit</th>
                  <th className="py-3 px-4 font-semibold text-right">Credit</th>
                  <th className="py-3 px-4 font-semibold text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {ledgerData.transactions && ledgerData.transactions.length > 0 ? (
                  ledgerData.transactions.map((tx, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-gray-700 whitespace-nowrap">
                        {new Date(tx.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-gray-700">{tx.referenceNo}</td>
                      <td className="py-3 px-4 text-gray-800">{tx.description}</td>
                      <td className="py-3 px-4 text-right text-gray-800">
                        {tx.debit > 0 && `Rs. ${parseFloat(tx.debit).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-800">
                        {tx.credit > 0 && `Rs. ${parseFloat(tx.credit).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">
                        Rs. {parseFloat(tx.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-500">
                      No transactions found for this period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Closing Balance */}
          <div className="mt-4 flex justify-between items-center bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
            <span className="font-semibold text-gray-700">Closing Balance:</span>
            <span className="text-xl font-bold text-blue-600">
              Rs. {parseFloat(ledgerData.closingBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      )}

      {!ledgerData && !isLoading && (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
          <FaBook className="mx-auto text-gray-300 text-6xl mb-4" />
          <p className="text-gray-500 text-lg">Select an account and date range to generate the general ledger report</p>
        </div>
      )}
    </div>
  );
}

export default GeneralLedger;