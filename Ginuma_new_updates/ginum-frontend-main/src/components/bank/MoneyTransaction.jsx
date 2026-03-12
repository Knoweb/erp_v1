import React, { useState, useEffect } from "react";
import { MdDelete, MdRefresh } from "react-icons/md";
import { FaTimes, FaPlus } from "react-icons/fa";
import api from "../../utils/api";
import Alert from "../Alert/Alert";
import PayerPayee from "../PayerPayee/PayerPayee";
import AddAccountForm from "../account/AddAccountForm";

const MoneyTransaction = ({ type = "spend" }) => {
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [selectedBankAccountId, setSelectedBankAccountId] = useState("");
  const [payeeType, setPayeeType] = useState("SUPPLIER");
  const [payeeId, setPayeeId] = useState("");
  const [chargeAccountId, setChargeAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
  const [referenceNumber, setReferenceNumber] = useState("");

  const [bankAccounts, setBankAccounts] = useState([]);
  const [chargeAccounts, setChargeAccounts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [modalTransition, setModalTransition] = useState("");

  const companyId = localStorage.getItem("companyId");

  useEffect(() => {
    if (showContactModal || showAccountModal) {
      setModalTransition("opacity-0");
      setTimeout(() => setModalTransition("opacity-100"), 10);
    } else {
      setModalTransition("opacity-0");
    }
  }, [showContactModal, showAccountModal]);

  const handleModalClick = (e, closeModal) => {
    if (e.target === e.currentTarget) {
      setModalTransition("opacity-0");
      setTimeout(() => closeModal(false), 300);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [type]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchBankAccounts(),
        fetchChargeAccounts(),
        fetchSuppliers(),
        fetchCustomers(),
        fetchEmployees(),
        fetchTransactions()
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBankAccounts = async () => {
    try {
      const accounts = await api.get(`/api/companies/${companyId}/accounts`);
      const banks = (Array.isArray(accounts) ? accounts : []).filter(a => a.accountType === "ASSET_BANK");
      setBankAccounts(banks);
      if (banks.length > 0 && !selectedBankAccountId) {
        setSelectedBankAccountId(banks[0].id);
      }
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
    }
  };

  const fetchChargeAccounts = async () => {
    try {
      const accounts = await api.get(`/api/companies/${companyId}/accounts`);
      const allAccounts = Array.isArray(accounts) ? accounts : [];

      // For SPEND_MONEY: Show expense accounts (EXPENSE, OTHER_EXPENSE, COST_OF_SALES)
      // For RECEIVE_MONEY: Show income accounts (INCOME, OTHER_INCOME)
      const filtered = type === "spend"
        ? allAccounts.filter(a => a.accountType === "EXPENSE" || a.accountType === "OTHER_EXPENSE" || a.accountType === "COST_OF_SALES")
        : allAccounts.filter(a => a.accountType === "INCOME" || a.accountType === "OTHER_INCOME");

      setChargeAccounts(filtered);
    } catch (error) {
      console.error("Error fetching charge accounts:", error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await api.get(`/api/suppliers/companies/${companyId}`);
      setSuppliers(response.data || response || []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get(`/api/customers/companies/${companyId}`);
      setCustomers(response.data || response || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get(`/api/employees/${companyId}`);
      setEmployees(response.data || response || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const transactionType = type === "spend" ? "SPEND_MONEY" : "RECEIVE_MONEY";
      const response = await api.get(`/api/companies/${companyId}/money-transactions/type/${transactionType}`);
      setTransactions(response.data || response || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const getPayeeOptions = () => {
    switch (payeeType) {
      case "SUPPLIER":
        return suppliers;
      case "CUSTOMER":
        return customers;
      case "EMPLOYEE":
        return employees;
      default:
        return [];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedBankAccountId) {
      Alert.error("Please select a bank account");
      return;
    }

    if (!chargeAccountId) {
      Alert.error(`Please select ${type === "spend" ? "an expense" : "an income"} account`);
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.error("Please enter a valid amount");
      return;
    }

    if (payeeType !== "OTHER" && !payeeId) {
      Alert.error("Please select a payee/payer");
      return;
    }

    if (!date) {
      Alert.error("Please select a date");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        type: type === "spend" ? "SPEND_MONEY" : "RECEIVE_MONEY",
        transactionDate: date,
        bankAccountId: parseInt(selectedBankAccountId),
        payeeType: payeeType,
        payeeId: payeeType === "OTHER" ? null : parseInt(payeeId),
        chargeAccountId: parseInt(chargeAccountId),
        amount: parseFloat(amount),
        description: description || `Money ${type === "spend" ? "spent" : "received"}`,
        paymentMethod: paymentMethod,
        referenceNumber: referenceNumber || null,
        projectId: null
      };

      await api.post(`/api/companies/${companyId}/money-transactions`, payload);
      Alert.success(`${type === "spend" ? "Spend Money" : "Receive Money"} transaction recorded successfully!`);

      // Reset form
      setPayeeId("");
      setChargeAccountId("");
      setAmount("");
      setDescription("");
      setReferenceNumber("");
      setDate(new Date().toISOString().substring(0, 10));

      // Refresh transactions list
      await fetchTransactions();
    } catch (err) {
      console.error("Failed to record transaction:", err);
      Alert.error(err.response?.data?.message || "Failed to record transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (transactionId) => {
    const result = await Alert.confirm(
      "Are you sure you want to delete this transaction? This action cannot be undone.",
      "Yes, Delete",
      "Cancel"
    );
    if (!result.isConfirmed) return;

    try {
      await api.delete(`/api/companies/${companyId}/money-transactions/${transactionId}`);
      Alert.success("Transaction deleted successfully");
      await fetchTransactions();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      Alert.error(error.response?.data?.message || "Failed to delete transaction");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-6 mt-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-4 sm:p-6 mt-4 sm:mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          {type === "spend" ? "Spend Money Transaction" : "Receive Money Transaction"}
        </h2>
        <button
          onClick={fetchAllData}
          className="p-2 text-blue-600 hover:text-blue-700"
          title="Refresh"
        >
          <MdRefresh className="h-6 w-6" />
        </button>
      </div>

      {/* Transaction Form */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-8 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Bank Account */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Bank Account <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedBankAccountId}
              onChange={(e) => setSelectedBankAccountId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Bank Account</option>
              {bankAccounts.map(bank => (
                <option key={bank.id} value={bank.id}>
                  {bank.accountCode} - {bank.accountName}
                </option>
              ))}
            </select>
          </div>

          {/* Transaction Date */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Payee Type */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              {type === "spend" ? "Payee" : "Payer"} Type <span className="text-red-500">*</span>
            </label>
            <select
              value={payeeType}
              onChange={(e) => {
                setPayeeType(e.target.value);
                setPayeeId("");
              }}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="SUPPLIER">Supplier</option>
              <option value="CUSTOMER">Customer</option>
              <option value="EMPLOYEE">Employee</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Payee Selection */}
          {payeeType !== "OTHER" && (
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                {type === "spend" ? "Payee" : "Payer"} <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={payeeId}
                  onChange={(e) => setPayeeId(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select {payeeType.toLowerCase()}</option>
                  {getPayeeOptions().map(option => (
                    <option key={option.id} value={option.id}>
                      {option.supplierName || option.name || option.businessName || option.companyName || (option.firstName ? option.firstName + ' ' + option.lastName : '') || 'Unknown'}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowContactModal(true)}
                  className="p-2 text-blue-600 hover:text-blue-700 border border-blue-600 rounded-lg"
                  title="Add New"
                >
                  <FaPlus className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Charge Account */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              {type === "spend" ? "Expense" : "Income"} Account <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <select
                value={chargeAccountId}
                onChange={(e) => setChargeAccountId(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Account</option>
                {chargeAccounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.accountCode} - {account.accountName}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowAccountModal(true)}
                className="p-2 text-blue-600 hover:text-blue-700 border border-blue-600 rounded-lg"
                title="Add New Account"
              >
                <FaPlus className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Payment Method */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CASH">Cash</option>
              <option value="CHEQUE">Cheque</option>
              <option value="CREDIT_CARD">Credit Card</option>
            </select>
          </div>

          {/* Reference Number */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Reference Number
            </label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Optional"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Transaction description..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Recording..." : "Record Transaction"}
          </button>
        </div>
      </form>

      {/* Transactions History */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h3>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No transactions found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left text-sm font-semibold">Transaction #</th>
                  <th className="p-3 text-left text-sm font-semibold">Date</th>
                  <th className="p-3 text-left text-sm font-semibold">Payee/Payer</th>
                  <th className="p-3 text-left text-sm font-semibold">Bank Account</th>
                  <th className="p-3 text-left text-sm font-semibold">Charge Account</th>
                  <th className="p-3 text-left text-sm font-semibold">Payment Method</th>
                  <th className="p-3 text-right text-sm font-semibold">Amount</th>
                  <th className="p-3 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-sm">{txn.transactionNumber}</td>
                    <td className="p-3 text-sm">{new Date(txn.transactionDate).toLocaleDateString()}</td>
                    <td className="p-3 text-sm">{txn.payeeName || "N/A"}</td>
                    <td className="p-3 text-sm text-xs">{txn.bankAccountName}</td>
                    <td className="p-3 text-sm text-xs">{txn.chargeAccountName}</td>
                    <td className="p-3 text-sm">{txn.paymentMethod?.replace("_", " ")}</td>
                    <td className="p-3 text-sm text-right font-medium">${txn.amount.toFixed(2)}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDelete(txn.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Transaction"
                      >
                        <MdDelete className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      {showContactModal && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-500 ${modalTransition}`}
          onClick={(e) => handleModalClick(e, setShowContactModal)}
        >
          <div className="w-11/12 sm:w-3/4 md:w-1/2 lg:w-2/5 xl:w-1/3 p-2 rounded-lg max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-2 right-2 text-xl z-10"
              onClick={() => {
                setShowContactModal(false);
                fetchSuppliers();
                fetchCustomers();
                fetchEmployees();
              }}
            >
              <FaTimes />
            </button>
            <PayerPayee />
          </div>
        </div>
      )}

      {/* Add Account Modal */}
      {showAccountModal && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-500 ${modalTransition}`}
          onClick={(e) => handleModalClick(e, setShowAccountModal)}
        >
          <div className="w-11/12 sm:w-3/4 md:w-1/2 lg:w-2/5 xl:w-1/3 p-2 rounded-lg max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-2 right-2 text-black-600 text-xl z-10"
              onClick={() => {
                setShowAccountModal(false);
                fetchBankAccounts();
                fetchChargeAccounts();
              }}
            >
              <FaTimes />
            </button>
            <AddAccountForm />
          </div>
        </div>
      )}
    </div>
  );
};

export default MoneyTransaction;
