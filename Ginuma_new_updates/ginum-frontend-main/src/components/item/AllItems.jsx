import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import Alert from "../Alert/Alert";
import { FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa";

const AllItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Get companyId from localStorage
  const companyId = localStorage.getItem("companyId");

  useEffect(() => {
    if (companyId) {
      fetchItems();
    } else {
      setLoading(false);
      setError("Company ID not found. Please log in again.");
    }
  }, [companyId]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/companies/${companyId}/items`);
      
      // Handle the response data robustly
      let itemsData = [];
      if (Array.isArray(response)) {
        itemsData = response;
      } else if (response && Array.isArray(response.data)) {
        itemsData = response.data;
      } else if (response && response.items && Array.isArray(response.items)) {
        itemsData = response.items;
      }
      
      setItems(itemsData);
    } catch (err) {
      console.error("Error fetching items:", err);
      setError("Failed to load items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await api.delete(`/api/companies/${companyId}/items/${id}`);
        setItems(items.filter((item) => item.id !== id));
      } catch (err) {
        console.error("Error deleting item:", err);
        alert("Failed to delete item.");
      }
    }
  };

  const filteredItems = items.filter((item) => {
    const name = item.name || "";
    const itemCode = item.itemCode || "";
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      itemCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Item Master</h1>
          <p className="text-sm text-gray-500">Manage your products and services</p>
        </div>
        <button
          onClick={() => navigate("/app/inventory/items/new")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <FaPlus size={14} />
          Add New Item
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <FaSearch size={14} />
            </span>
            <input
              type="text"
              placeholder="Search by code or name..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-gray-500">
            Showing {filteredItems.length} of {items.length} items
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Item Code</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4 text-right">Sales Price</th>
                <th className="px-6 py-4 text-right">Purchase Price</th>
                <th className="px-6 py-4">Accounts (Income/Exp)</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center text-xs">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-gray-400">
                    <div className="flex justify-center flex-col items-center gap-2">
                       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                       <span>Loading items...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">{item.itemCode}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-800">{item.name}</div>
                      {item.description && <div className="text-xs text-gray-400 truncate max-w-[200px]">{item.description}</div>}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">
                      Rs. {parseFloat(item.salesPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-orange-600">
                      Rs. {parseFloat(item.purchasePrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                       <div className="text-[10px] space-y-1">
                          <div className="flex items-center gap-1">
                             <span className="bg-green-100 text-green-700 px-1 rounded">I</span>
                             <span className="text-gray-500">{item.incomeAccount?.name || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                             <span className="bg-orange-100 text-orange-700 px-1 rounded">E</span>
                             <span className="text-gray-500">{item.expenseAccount?.name || 'N/A'}</span>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {(() => {
                        const isActive = item.active !== undefined ? item.active : item.isActive;
                        return (
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                            {isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => navigate(`/app/inventory/items/edit/${item.id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors shadow-sm bg-white border border-blue-100"
                          title="Edit Item"
                        >
                          <FaEdit size={12} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors shadow-sm bg-white border border-red-100"
                          title="Delete Item"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-gray-500 italic">
                    {searchTerm ? "No items match your search." : "No items found. Create your first item to get started."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllItems;
