import React, { useState } from "react";
import api from "../../utils/api"; // Ensure correct API utility import
import Alert from "../../components/Alert/Alert"; // Alert component for notifications

const AddAccountForm = () => {
  const [accountType, setAccountType] = useState("");
  const [accountName, setAccountName] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankBranch, setBankBranch] = useState("");
  const [error, setError] = useState("");
  const [subAccount, setSubAccount] = useState("");

  // Enum values mapped for API submission
  const accountTypeMap = {
    Bank: "ASSET_BANK",
    "Account Receivable": "ASSET_ACCOUNT_RECEIVABLE",
    "Other Current Asset": "ASSET_OTHER_CURRENT_ASSET",
    "Fixed Asset": "ASSET_FIXED_ASSET",
    "Other Asset": "ASSET_OTHER_ASSET",

    "Credit Card": "LIABILITY_CREDIT_CARD",
    "Accounts Payable": "LIABILITY_ACCOUNTS_PAYABLE",
    "Other Current Liability": "LIABILITY_OTHER_CURRENT_LIABILITY",
    "Long Term Liability": "LIABILITY_LONG_TERM_LIABILITY",
    "Other Liability": "LIABILITY_OTHER_LIABILITY",

    Equity: "EQUITY",
    Income: "INCOME",
    Expense: "EXPENSE",
    "Cost of Sales": "COST_OF_SALES",
    "Other Income": "OTHER_INCOME",
    "Other Expense": "OTHER_EXPENSE",
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get company ID and token from session storage
    const companyId = localStorage.getItem("companyId");
    const token = localStorage.getItem("auth_token");

    if (!companyId) {
      Alert.error("Company ID is missing. Please log in again.");
      return;
    }
    if (!token) {
      Alert.error("Authentication token is missing. Please log in again.");
      return;
    }
    if (!accountName.trim()) {
      Alert.error("Account Name is required.");
      return;
    }

    try {
      let endpoint = `/api/companies/${companyId}/accounts`;
      let payload = {
        accountName: accountName.trim(),
        accountType: accountTypeMap[accountType] || accountType.toUpperCase(),
        currentBalance: parseFloat(openingBalance) || 0,
        subAccount: subAccount.trim() || null,
      };

      if (accountType === "Bank") {
        endpoint = `/api/companies/${companyId}/bank-accounts`;
        payload = {
          bankName: bankName.trim(),
          branchName: bankBranch.trim(),
          accountNumber: bankAccountNumber.trim(),
          subAccountName: subAccount.trim() || null,
          currentBalance: parseFloat(openingBalance) || 0,
          accountName: accountName.trim(),
        };
      }

      const response = await api.post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      Alert.success("Account added successfully!");

      // Clear form fields
      setAccountType("");
      setAccountName("");
      setOpeningBalance("");
      setSubAccount("");
      setBankName("");
      setBankAccountNumber("");
      setBankBranch("");

      // console.log("API Response:", response.data);
    } catch (err) {
      setError("Failed to add account. Please try again.");
      Alert.error("Failed to add account. Please check your input.");
      console.error("API Error:", err.response?.data || err.message);
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">New Account</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700">Account Category *</label>
            <select
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              required
            >
              <option value="">Select Category</option>
              <optgroup label="Asset">
                <option value="Bank">Bank</option>
                <option value="Account Receivable">Account Receivable</option>
                <option value="Other Current Asset">Other Current Asset</option>
                <option value="Fixed Asset">Fixed Asset</option>
                <option value="Other Asset">Other Asset</option>
              </optgroup>
              <optgroup label="Liability">
                <option value="Credit Card">Credit Card</option>
                <option value="Accounts Payable">Accounts Payable</option>
                <option value="Other Current Liability">
                  Other Current Liability
                </option>
                <option value="Long Term Liability">Long Term Liability</option>
                <option value="Other Liability">Other Liability</option>
              </optgroup>
              <option value="Equity">Equity</option>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
              <option value="Cost Of Sale">Cost of sale</option>
              <option value="Other Income">Other income</option>
              <option value="Other Expense">Other expense</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700">Account Name *</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700">Sub Account</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={subAccount}
              onChange={(e) => setSubAccount(e.target.value)}
            />
          </div>
          {/* <div>
            <label className="block text-gray-700">Account ID *</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div> */}
          <div>
            <label className="block text-gray-700">Opening Balance (Rs.) *</label>
            <input
              type="number"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value)}
            />
          </div>

          {/* Conditional rendering for Bank account details */}
          {accountType === "Bank" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700">Bank Name *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">
                  Bank Account Number *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-gray-700">Bank Branch *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={bankBranch}
                  onChange={(e) => setBankBranch(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button className="w-1/6 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
            Save
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddAccountForm;
