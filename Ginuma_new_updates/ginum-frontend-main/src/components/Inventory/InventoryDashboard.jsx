import React, { useState, useEffect } from "react";
import { Pencil, Trash2, ArrowUpCircle, ArrowDownCircle, RefreshCw } from "lucide-react";
import api from "../../utils/api";
import Alert from "../Alert/Alert";

const InventoryDashboard = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'add' or 'reduce'
  const [currentItem, setCurrentItem] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const companyId = localStorage.getItem("companyId");

  // Fetch all stock levels from backend
  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      if (!companyId) {
        Alert.error("Company ID not found. Please log in again.");
        return;
      }
      const response = await api.get(`/api/companies/${companyId}/inventory/stock-levels`);
      const data = response.data || response || [];
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      Alert.error("Failed to load inventory data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Open modal and reset inputs
  const openModal = (type, item) => {
    setModalType(type);
    setCurrentItem(item);
    setQuantity("");
    setNotes("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalType(null);
    setCurrentItem(null);
    setQuantity("");
    setNotes("");
  };

  // Handle submit of Add or Reduce Stock via backend
  const handleSubmit = async () => {
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) {
      Alert.error("Please enter a valid quantity greater than zero.");
      return;
    }

    if (modalType === "reduce" && qty > parseFloat(currentItem.currentQuantity)) {
      Alert.error("Cannot reduce more than current stock.");
      return;
    }

    try {
      setIsSubmitting(true);
      const transactionType = modalType === "add" ? "PURCHASE" : "ADJUSTMENT";

      await api.post(`/api/companies/${companyId}/inventory/transactions`, {
        itemId: currentItem.itemId,
        transactionType: transactionType,
        quantity: modalType === "add" ? qty : -qty,
        notes: notes || `Stock ${modalType === "add" ? "added" : "reduced"} via Inventory Dashboard`,
        warehouse: currentItem.warehouse || null,
      });

      Alert.success(`Stock ${modalType === "add" ? "added" : "reduced"} successfully!`);
      closeModal();
      await fetchInventory(); // Refresh data
    } catch (error) {
      console.error("Error updating stock:", error);
      Alert.error(error.response?.data?.message || "Failed to update stock.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-500">Loading inventory...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Inventory Dashboard</h2>
          <button
            onClick={fetchInventory}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition"
            title="Refresh"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Total Items</p>
            <p className="text-3xl font-bold text-blue-600">{items.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Low Stock Items</p>
            <p className="text-3xl font-bold text-yellow-600">
              {items.filter(i => i.belowReorderLevel).length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Out of Stock</p>
            <p className="text-3xl font-bold text-red-600">
              {items.filter(i => parseFloat(i.currentQuantity) <= 0).length}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto bg-white shadow rounded-xl p-4">
          <table className="min-w-full text-sm text-left">
            <thead className="text-xs text-gray-600 uppercase border-b">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4">Unit</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Avg. Cost</th>
                <th className="py-3 px-4">Total Value</th>
                <th className="py-3 px-4">Reorder Level</th>
                <th className="py-3 px-4">Warehouse</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-b hover:bg-gray-100 transition"
                >
                  <td className="py-3 px-4 text-gray-500">{index + 1}</td>
                  <td className="py-3 px-4 font-medium">{item.itemName}</td>
                  <td className="py-3 px-4 text-gray-500">{item.itemUnit || '—'}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full font-semibold ${parseFloat(item.currentQuantity) <= 0
                          ? "bg-red-100 text-red-700"
                          : item.belowReorderLevel
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                    >
                      {parseFloat(item.currentQuantity)}{" "}
                      {parseFloat(item.currentQuantity) <= 0
                        ? "Out of Stock"
                        : item.belowReorderLevel
                          ? "Low Stock"
                          : "In Stock"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {item.averageCost != null ? `Rs. ${parseFloat(item.averageCost).toFixed(2)}` : '—'}
                  </td>
                  <td className="py-3 px-4 font-medium text-blue-700">
                    {item.totalValue != null ? `Rs. ${parseFloat(item.totalValue).toFixed(2)}` : '—'}
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {item.reorderLevel != null ? parseFloat(item.reorderLevel) : '—'}
                  </td>
                  <td className="py-3 px-4 text-gray-500">{item.warehouse || 'Default'}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="inline-flex items-center gap-2">
                      <div className="relative group">
                        <button
                          onClick={() => openModal("add", item)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg flex items-center gap-1"
                        >
                          <ArrowUpCircle size={16} /> Add Stock
                        </button>
                      </div>
                      <div className="relative group">
                        <button
                          onClick={() => openModal("reduce", item)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg flex items-center gap-1"
                          disabled={parseFloat(item.currentQuantity) <= 0}
                        >
                          <ArrowDownCircle size={16} /> Reduce Stock
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center py-10 text-gray-500">
                    No inventory items found. Add items first.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Modal */}
      {modalOpen && currentItem && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <h3 className="text-xl font-semibold mb-4">
              {modalType === "add" ? "Add Stock" : "Reduce Stock"}
            </h3>

            <div className="mb-3">
              <label className="block text-gray-700 font-medium mb-1">Item</label>
              <input
                type="text"
                value={currentItem.itemName}
                disabled
                className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div className="mb-3">
              <label className="block text-gray-700 font-medium mb-1">Current Stock</label>
              <input
                type="number"
                value={parseFloat(currentItem.currentQuantity)}
                disabled
                className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div className="mb-3">
              <label className="block text-gray-700 font-medium mb-1">
                Quantity to {modalType === "add" ? "Add" : "Reduce"}
              </label>
              <input
                type="number"
                min="1"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Enter quantity"
              />
            </div>

            <div className="mb-3">
              <label className="block text-gray-700 font-medium mb-1">
                {modalType === "reduce" ? "Reason" : "Notes"} (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder={modalType === "reduce" ? "Reason for stock reduction..." : "Additional notes..."}
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100 transition"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded text-white disabled:opacity-50 ${modalType === "add"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-yellow-600 hover:bg-yellow-700"
                  } transition`}
              >
                {isSubmitting ? "Saving..." : modalType === "add" ? "Add Stock" : "Reduce Stock"}
              </button>
            </div>

            <button
              onClick={closeModal}
              aria-label="Close modal"
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
              disabled={isSubmitting}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryDashboard;
