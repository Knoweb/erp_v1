import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import Alert from "../Alert/Alert";
import { FaUniversity, FaCheckCircle, FaSearch, FaRegCircle, FaSyncAlt } from "react-icons/fa";

function BankReconsilation() {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankCode, setSelectedBankCode] = useState("");
  const [statementDate, setStatementDate] = useState("");
  const [statementBalance, setStatementBalance] = useState("0.00");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReconciliation, setIsLoadingReconciliation] = useState(false);
  const [reconciliationData, setReconciliationData] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const fetchBankAccounts = async () => {
    try {
      setIsLoading(true);
      const companyId = localStorage.getItem("companyId");
      if (!companyId) return;

      const response = await api.get(`/api/companies/${companyId}/accounts`);
      let accountsData = response.data || response;
      if (!Array.isArray(accountsData)) throw new Error("Invalid accounts structure");

      const banks = accountsData.filter(a => a.accountType === "ASSET_BANK");
      setBankAccounts(banks);
      if (banks.length > 0) {
        setSelectedBankCode(banks[0].accountCode);
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
      Alert.error("Failed to load bank accounts");
    } finally {
      setIsLoading(false);
    }
  };

  const loadReconciliationData = async () => {
    try {
      if (!selectedBankCode || !statementDate) {
        Alert.warning("Please select a bank account and statement date");
        return;
      }

      setIsLoadingReconciliation(true);
      const companyId = localStorage.getItem("companyId");
      const selectedBank = bankAccounts.find(b => b.accountCode === selectedBankCode);

      if (!selectedBank) {
        Alert.error("Bank account not found");
        return;
      }

      const response = await api.get(`/api/companies/${companyId}/reports/bank-reconciliation`, {
        params: {
          bankAccountId: selectedBank.id,
          statementDate: statementDate
        }
      });

      const data = response.data || response;
      setReconciliationData(data);

      // Transform transactions to match the UI expected format
      const transformedTransactions = (data.transactions || []).map(t => ({
        id: t.transactionId,
        date: t.date,
        description: `${t.description} (${t.referenceNo})`,
        type: t.type.toLowerCase(), // "DEPOSIT" -> "deposit", "WITHDRAWAL" -> "withdrawal"
        amount: t.amount,
        cleared: t.reconciled
      }));

      setTransactions(transformedTransactions);
      
      // Set the statement balance from backend if available (or keep user input)
      // The backend doesn't provide statement balance, so we keep what user entered
      
      Alert.success("Reconciliation data loaded successfully");
    } catch (error) {
      console.error("Error loading reconciliation data:", error);
      Alert.error("Failed to load reconciliation data");
    } finally {
      setIsLoadingReconciliation(false);
    }
  };

  useEffect(() => {
    fetchBankAccounts();
    const today = new Date().toISOString().split("T")[0];
    setStatementDate(today);
  }, []);

  const toggleClear = async (id) => {
    try {
      const transaction = transactions.find(t => t.id === id);
      if (!transaction) return;

      const companyId = localStorage.getItem("companyId");
      const newReconciledStatus = !transaction.cleared;

      // Optimistically update UI
      setTransactions(transactions.map(t => t.id === id ? { ...t, cleared: newReconciledStatus } : t));

      // Call API to persist the change
      await api.post(`/api/companies/${companyId}/reports/bank-reconciliation/mark-reconciled`, null, {
        params: {
          transactionId: id,
          reconciled: newReconciledStatus
        }
      });

    } catch (error) {
      console.error("Error toggling reconciliation status:", error);
      Alert.error("Failed to update reconciliation status");
      
      // Revert on error
      setTransactions(transactions.map(t => t.id === id ? { ...t, cleared: !t.cleared } : t));
    }
  };

  const selectedBank = bankAccounts.find(b => b.accountCode === selectedBankCode);
  
  // Use reconciliation data from backend if available, otherwise calculate from current balance
  const systemBalance = reconciliationData 
    ? parseFloat(reconciliationData.systemBalance) || 0 
    : (selectedBank ? parseFloat(selectedBank.currentBalance) || 0 : 0);

  const clearedDeposits = transactions.filter(t => t.cleared && t.type === "deposit").reduce((acc, t) => acc + t.amount, 0);
  const clearedWithdrawals = transactions.filter(t => t.cleared && t.type === "withdrawal").reduce((acc, t) => acc + t.amount, 0);

  const calculatedBalance = systemBalance + clearedDeposits - clearedWithdrawals;
  const difference = (parseFloat(statementBalance) || 0) - calculatedBalance;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 my-4 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <FaUniversity className="text-blue-600 mr-3" />
          Bank Reconciliation
        </h2>
        <div className="mt-4 sm:mt-0 space-x-3">
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition drop-shadow-sm font-medium">Save for later</button>
          <button
            disabled={difference !== 0}
            className={`px-4 py-2 font-medium rounded-lg shadow transition ${difference === 0 ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
            Reconcile Now
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Setup Column */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-1 space-y-6">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-3">Statement Setup</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
            <select
              value={selectedBankCode}
              onChange={e => setSelectedBankCode(e.target.value)}
              className="w-full h-11 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none bg-white">
              {isLoading ? <option>Loading...</option> : bankAccounts.map(b => (
                <option key={b.id} value={b.accountCode}>{b.accountName} ({b.accountCode})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statement Date</label>
            <input type="date" value={statementDate} onChange={e => setStatementDate(e.target.value)}
              className="w-full h-11 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statement Balance</label>
            <div className="relative">
              <span className="absolute left-4 top-2.5 text-gray-500 font-medium">Rs.</span>
              <input type="number" value={statementBalance} onChange={e => setStatementBalance(e.target.value)}
                className="w-full h-11 pl-8 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 font-medium" />
            </div>
          </div>

          <button
            onClick={loadReconciliationData}
            disabled={isLoadingReconciliation || !selectedBankCode || !statementDate}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center">
            {isLoadingReconciliation ? (
              <>
                <FaSyncAlt className="animate-spin mr-2" />
                Loading...
              </>
            ) : (
              <>
                <FaSearch className="mr-2" />
                Load Transactions
              </>
            )}
          </button>
        </div>

        {/* Balancing Column */}
        <div className="bg-blue-600 bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-2xl shadow-lg lg:col-span-2 text-white flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white opacity-5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-10 -mb-10 w-32 h-32 bg-blue-400 opacity-20 rounded-full blur-xl"></div>

          <h3 className="text-blue-100 font-medium mb-8 text-lg flex items-center">
            <FaCheckCircle className="mr-2 opacity-80" /> Reconciliation Status
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
            <div className="flex flex-col">
              <span className="text-blue-200 text-sm mb-1">Statement Balance</span>
              <span className="text-2xl font-bold">Rs. {parseFloat(statementBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex flex-col">
              <span className="text-blue-200 text-sm mb-1">Cleared Balance</span>
              <span className="text-2xl font-bold">Rs. {calculatedBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex flex-col md:col-span-2 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20">
              <span className="text-blue-100 text-sm mb-1 uppercase tracking-wider font-semibold">Difference</span>
              <span className={`text-3xl font-bold ${difference === 0 ? "text-green-300" : "text-red-300"}`}>
                Rs. {Math.abs(difference).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              {difference === 0 && (
                <span className="text-xs text-green-200 mt-1 mt-auto flex items-center">
                  <FaCheckCircle className="mr-1" /> Perfectly Balanced
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4 border-b pb-4">
          <h3 className="text-lg font-bold text-gray-800">Transactions to Reconcile</h3>
          <div className="relative">
            <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
            <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 w-64 outline-none transition" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-sm text-gray-500 border-b border-gray-200">
                <th className="py-3 px-4 w-16 text-center">Cleared</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Description</th>
                <th className="py-3 px-4 font-semibold text-right">Withdrawal</th>
                <th className="py-3 px-4 font-semibold text-right">Deposit</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors group">
                  <td className="py-3 px-4 text-center">
                    <button onClick={() => toggleClear(t.id)} className="focus:outline-none">
                      {t.cleared ? (
                        <FaCheckCircle className="text-green-500 text-xl inline-block" />
                      ) : (
                        <FaRegCircle className="text-gray-300 text-xl inline-block group-hover:text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-gray-700 whitespace-nowrap">{t.date}</td>
                  <td className="py-3 px-4 text-gray-800 font-medium">{t.description}</td>
                  <td className="py-3 px-4 text-right">
                    {t.type === "withdrawal" && <span className="text-gray-800">Rs. {t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {t.type === "deposit" && <span className="text-gray-800">Rs. {t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500 bg-gray-50/50 rounded-b-xl">
                    {reconciliationData ? "No transactions found for this period." : "Click 'Load Transactions' to start reconciliation."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default BankReconsilation;
