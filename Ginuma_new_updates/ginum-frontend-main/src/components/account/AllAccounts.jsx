import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import Alert from "../Alert/Alert";
import { FaPlus, FaSearch, FaUniversity, FaMoneyBill } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function AllAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const navigate = useNavigate();

  const accountTypes = {
    ALL: "All Accounts",
    ASSET_BANK: "Bank",
    ASSET_ACCOUNT_RECEIVABLE: "Account Receivable",
    ASSET_OTHER_CURRENT_ASSET: "Other Current Asset",
    ASSET_FIXED_ASSET: "Fixed Asset",
    ASSET_OTHER_ASSET: "Other Asset",
    LIABILITY_CREDIT_CARD: "Credit Card",
    LIABILITY_ACCOUNTS_PAYABLE: "Accounts Payable",
    LIABILITY_OTHER_CURRENT_LIABILITY: "Other Current Liability",
    LIABILITY_LONG_TERM_LIABILITY: "Long Term Liability",
    LIABILITY_OTHER_LIABILITY: "Other Liability",
    EQUITY: "Equity",
    INCOME: "Income",
    EXPENSE: "Expense",
    COST_OF_SALES: "Cost of Sales",
    OTHER_INCOME: "Other Income",
    OTHER_EXPENSE: "Other Expense",
  };

  const getCategoryFromType = (type) => {
    if (type.startsWith("ASSET")) return "Asset";
    if (type.startsWith("LIABILITY")) return "Liability";
    if (type === "EQUITY") return "Equity";
    if (type === "INCOME" || type === "OTHER_INCOME") return "Income";
    if (type === "EXPENSE" || type === "OTHER_EXPENSE" || type === "COST_OF_SALES") return "Expense";
    return "Other";
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    filterAccounts();
  }, [searchTerm, selectedType, accounts]);

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      const companyId = localStorage.getItem("companyId");
      if (!companyId) {
        Alert.error("Company ID not found");
        return;
      }

      const response = await api.get(`/api/companies/${companyId}/accounts`);
      const accountsData = response.data || response;
      setAccounts(accountsData);
      setFilteredAccounts(accountsData);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      Alert.error("Failed to load accounts");
    } finally {
      setIsLoading(false);
    }
  };

  const filterAccounts = () => {
    let filtered = accounts;

    // Filter by type
    if (selectedType !== "ALL") {
      filtered = filtered.filter((acc) => acc.accountType === selectedType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (acc) =>
          acc.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          acc.accountCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (acc.subAccountName && acc.subAccountName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredAccounts(filtered);
  };

  const formatBalance = (balance) => {
    if (balance === null || balance === undefined) return "Rs. 0.00";
    return `Rs. ${parseFloat(balance).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      Asset: "bg-blue-100 text-blue-700",
      Liability: "bg-red-100 text-red-700",
      Equity: "bg-purple-100 text-purple-700",
      Income: "bg-green-100 text-green-700",
      Expense: "bg-orange-100 text-orange-700",
      Other: "bg-gray-100 text-gray-700",
    };
    return colors[category] || colors.Other;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 my-4 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaMoneyBill className="text-green-600 mr-3" />
            Chart of Accounts
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {filteredAccounts.length} {filteredAccounts.length === 1 ? "account" : "accounts"}
          </p>
        </div>
        <button
          onClick={() => navigate("/app/account/new")}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center shadow-sm"
        >
          <FaPlus className="mr-2" />
          New Account
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by account name, code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition appearance-none"
          >
            {Object.entries(accountTypes).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="text-center py-12">
            <FaMoneyBill className="mx-auto text-gray-300 text-5xl mb-4" />
            <p className="text-gray-500 text-lg">No accounts found</p>
            <button
              onClick={() => navigate("/app/account/new")}
              className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              Create Your First Account
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Account Name
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="py-4 px-6 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAccounts.map((account) => {
                  const category = getCategoryFromType(account.accountType);
                  return (
                    <tr
                      key={account.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => {
                        // Future: navigate to account details page
                        console.log("Account clicked:", account);
                      }}
                    >
                      <td className="py-4 px-6">
                        <span className="font-mono text-sm font-medium text-gray-700">
                          {account.accountCode}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900">{account.accountName}</p>
                          {account.subAccountName && (
                            <p className="text-sm text-gray-500">{account.subAccountName}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-600">
                          {accountTypes[account.accountType] || account.accountType}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
                            category
                          )}`}
                        >
                          {category}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span
                          className={`font-mono font-semibold ${
                            parseFloat(account.currentBalance || 0) < 0
                              ? "text-red-600"
                              : "text-gray-900"
                          }`}
                        >
                          {formatBalance(account.currentBalance)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AllAccounts;
