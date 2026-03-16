import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import Alert from "../Alert/Alert";
import { AccountContext, filterAccountsByContext } from "../../utils/accountFilters";

const CreateItem = ({ isModal = false, onSuccess }) => {
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
        // Using window.alert for simplicity if the Alert component is not available or buggy
        alert("Failed to load accounts for dropdowns.");
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
      const payload = {
        ...formData,
        salesPrice: parseFloat(formData.salesPrice) || 0,
        purchasePrice: parseFloat(formData.purchasePrice) || 0,
        incomeAccountId: parseInt(formData.incomeAccountId) || null,
        expenseAccountId: parseInt(formData.expenseAccountId) || null,
      };

      const response = await api.post(`/api/companies/${companyId}/items`, payload);
      alert("Item created successfully!");
      
      if (isModal && onSuccess) {
        onSuccess(response.data);
      } else {
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
      }
    } catch (error) {
      console.error("Error creating item:", error);
      alert(error.response?.data?.error || "Failed to create item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${isModal ? "" : "max-w-4xl mx-auto bg-white shadow-xl rounded-xl p-8 my-8 border border-gray-100"}`}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className={`${isModal ? "text-xl" : "text-3xl"} font-extrabold text-gray-900 tracking-tight`}>
            {isModal ? "Add New Item" : "Create New Item"}
          </h2>
          {!isModal && <p className="mt-2 text-gray-500">Add a non-inventory product or service to your catalog.</p>}
        </div>
        {!isModal && (
          <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Item Code</label>
            <input
              type="text"
              name="itemCode"
              value={formData.itemCode}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50/50"
              placeholder="e.g. ITM-001"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Item Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50/50"
              placeholder="e.g. Graphic Design"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50"
            rows="2"
            placeholder="Item details..."
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sales Information */}
          <div className="bg-blue-50/40 p-5 rounded-xl border border-blue-100/50">
            <h3 className="text-sm font-bold text-blue-900 mb-3 flex items-center">
                <span className="mr-2">💰</span> Sales Info
            </h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Sales Price</label>
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400 text-sm font-bold">Rs.</span>
                    <input
                      type="number"
                      step="0.01"
                      name="salesPrice"
                      value={formData.salesPrice}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      placeholder="0.00"
                    />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Income Account</label>
                <select
                  name="incomeAccountId"
                  value={formData.incomeAccountId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                >
                  <option value="">Select Account</option>
                  {incomeAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.accountName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Purchase Information */}
          <div className="bg-orange-50/40 p-5 rounded-xl border border-orange-100/50">
            <h3 className="text-sm font-bold text-orange-900 mb-3 flex items-center">
                <span className="mr-2">🛒</span> Purchase Info
            </h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Purchase Price</label>
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400 text-sm font-bold">Rs.</span>
                    <input
                      type="number"
                      step="0.01"
                      name="purchasePrice"
                      value={formData.purchasePrice}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                      placeholder="0.00"
                    />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Expense Account</label>
                <select
                  name="expenseAccountId"
                  value={formData.expenseAccountId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white text-sm"
                >
                  <option value="">Select Account</option>
                  {expenseAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.accountName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-all flex items-center text-sm ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Processing..." : isModal ? "Add Item" : "Create Item"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateItem;
