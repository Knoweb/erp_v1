import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import Alert from "../Alert/Alert";
import { AccountContext, filterAccountsByContext } from "../../utils/accountFilters";

const CreateItem = () => {
  const [formData, setFormData] = useState({
    itemCode: "",
    name: "",
    description: "",
    salesPrice: "",
    incomeAccountId: "",
    purchasePrice: "",
    expenseAccountId: "",
    isActive: true,
  });

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const companyId = localStorage.getItem("companyId");

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await api.get(`/api/companies/${companyId}/accounts`);
        const allAccounts = Array.isArray(response) ? response : (response.data || []);
        setAccounts(allAccounts);
      } catch (error) {
        console.error("Error fetching accounts:", error);
        Alert.error("Failed to load accounts for dropdowns.");
      }
    };

    if (companyId) {
      fetchAccounts();
    }
  }, [companyId]);

  // Use the robust utility to filter accounts for the dropdowns
  const incomeAccounts = filterAccountsByContext(accounts, AccountContext.SALES_ITEM_ACCOUNT);
  const expenseAccounts = filterAccountsByContext(accounts, AccountContext.PURCHASE_ITEM_ACCOUNT);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mocking the structure needed for the backend
      const payload = {
        ...formData,
        salesPrice: parseFloat(formData.salesPrice) || 0,
        purchasePrice: parseFloat(formData.purchasePrice) || 0,
        incomeAccountId: parseInt(formData.incomeAccountId) || null,
        expenseAccountId: parseInt(formData.expenseAccountId) || null,
      };

      await api.post(`/api/companies/${companyId}/items`, payload);
      Alert.success("Item created successfully!");
      
      // Reset form
      setFormData({
        itemCode: "",
        name: "",
        description: "",
        salesPrice: "",
        incomeAccountId: "",
        purchasePrice: "",
        expenseAccountId: "",
        isActive: true,
      });
    } catch (error) {
      console.error("Error creating item:", error);
      Alert.error(error.response?.data?.error || "Failed to create item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl p-8 my-8 border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create New Item</h2>
          <p className="mt-2 text-gray-500">Add a non-inventory product or service to your catalog.</p>
        </div>
        <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Item Code</label>
            <input
              type="text"
              name="itemCode"
              value={formData.itemCode}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-gray-50 hover:bg-white"
              placeholder="e.g. SRV-001"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Item Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-gray-50 hover:bg-white"
              placeholder="e.g. Consulting Services"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-gray-50 hover:bg-white"
            rows="3"
            placeholder="Detailed description of the item or service..."
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Sales Information */}
          <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
            <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                <span className="mr-2">💰</span> Sales Information
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Sales Price</label>
                <div className="relative">
                    <span className="absolute left-3 top-3.5 text-gray-400 font-medium">$</span>
                    <input
                      type="number"
                      step="0.01"
                      name="salesPrice"
                      value={formData.salesPrice}
                      onChange={handleChange}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="0.00"
                    />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Income Account</label>
                <select
                  name="incomeAccountId"
                  value={formData.incomeAccountId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
                >
                  <option value="">Select Account</option>
                  {incomeAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.accountCode} - {acc.accountName}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 italic">Select an 'Income' account to track revenue.</p>
              </div>
            </div>
          </div>

          {/* Purchase Information */}
          <div className="bg-orange-50/50 p-6 rounded-xl border border-orange-100">
            <h3 className="text-lg font-bold text-orange-900 mb-4 flex items-center">
                <span className="mr-2">🛒</span> Purchase Information
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Purchase Price</label>
                <div className="relative">
                    <span className="absolute left-3 top-3.5 text-gray-400 font-medium">$</span>
                    <input
                      type="number"
                      step="0.01"
                      name="purchasePrice"
                      value={formData.purchasePrice}
                      onChange={handleChange}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                      placeholder="0.00"
                    />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Expense Account</label>
                <select
                  name="expenseAccountId"
                  value={formData.expenseAccountId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none appearance-none bg-white"
                >
                  <option value="">Select Account</option>
                  {expenseAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.accountCode} - {acc.accountName}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 italic">Select an 'Expense' or 'Cost of Sale' account.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
          />
          <label className="text-sm font-medium text-gray-700">This item is active and available for use in transactions</label>
        </div>

        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={loading}
            className={`px-10 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-blue-200 transition-all duration-200 flex items-center ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              "Create Item"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateItem;
