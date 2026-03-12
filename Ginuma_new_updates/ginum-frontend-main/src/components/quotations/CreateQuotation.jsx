import React, { useState, useEffect } from "react";
import { MdDelete, MdAdd } from "react-icons/md";
import { FaTimes } from "react-icons/fa";
import api from "../../utils/api";
import Alert from "../Alert/Alert";
import AddCustomer from "../customer/AddCustomer";

const CreateQuotation = () => {
  const [formData, setFormData] = useState({
    customerId: "",
    issueDate: new Date().toISOString().substring(0, 10),
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10), // 30 days from now
    taxPercent: 0,
    status: "DRAFT",
    notes: "",
    termsAndConditions: ""
  });

  const [lineItems, setLineItems] = useState([
    { description: "", quantity: 1, unitPrice: 0, discountPercent: 0 }
  ]);

  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [modalTransition, setModalTransition] = useState("");

  const companyId = localStorage.getItem("companyId");

  useEffect(() => {
    if (showCustomerModal) {
      setModalTransition("opacity-0");
      setTimeout(() => setModalTransition("opacity-100"), 10);
    } else {
      setModalTransition("opacity-0");
    }
  }, [showCustomerModal]);

  const handleModalClick = (e) => {
    if (e.target === e.currentTarget) {
      setModalTransition("opacity-0");
      setTimeout(() => setShowCustomerModal(false), 300);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/api/customers/companies/${companyId}`);
      setCustomers(response.data || response || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
      Alert.error("Failed to load customers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLineItemChange = (index, field, value) => {
    const updatedItems = [...lineItems];
    updatedItems[index][field] = value;
    setLineItems(updatedItems);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: 1, unitPrice: 0, discountPercent: 0 }]);
  };

  const removeLineItem = (index) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice * (1 - item.discountPercent / 100);
      return sum + itemTotal;
    }, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * (formData.taxPercent / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customerId) {
      Alert.error("Please select a customer");
      return;
    }

    const validItems = lineItems.filter(item => item.description && item.quantity > 0 && item.unitPrice > 0);
    if (validItems.length === 0) {
      Alert.error("Please add at least one valid line item");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        customerId: parseInt(formData.customerId),
        taxPercent: parseFloat(formData.taxPercent),
        lineItems: validItems.map(item => ({
          description: item.description,
          quantity: parseInt(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          discountPercent: parseFloat(item.discountPercent || 0)
        }))
      };

      await api.post(`/api/companies/${companyId}/quotations`, payload);
      Alert.success("Quotation created successfully!");

      // Reset form
      setFormData({
        customerId: "",
        issueDate: new Date().toISOString().substring(0, 10),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
        taxPercent: 0,
        status: "DRAFT",
        notes: "",
        termsAndConditions: ""
      });
      setLineItems([{ description: "", quantity: 1, unitPrice: 0, discountPercent: 0 }]);
    } catch (err) {
      console.error("Failed to create quotation:", err);
      Alert.error(err.response?.data?.message || "Failed to create quotation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-4 sm:p-6 mt-4 sm:mt-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Create Quotation</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer and Dates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Customer <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <select
                name="customerId"
                value={formData.customerId}
                onChange={handleInputChange}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowCustomerModal(true)}
                className="p-2 text-blue-600 hover:text-blue-700 border border-blue-600 rounded-lg"
                title="Add New Customer"
              >
                <MdAdd className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Issue Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="issueDate"
              value={formData.issueDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Expiry Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Line Items Table */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-gray-700 font-medium">Line Items</label>
            <button
              type="button"
              onClick={addLineItem}
              className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <MdAdd className="h-4 w-4" /> Add Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left text-sm">Description</th>
                  <th className="p-2 text-left text-sm">Quantity</th>
                  <th className="p-2 text-left text-sm">Unit Price</th>
                  <th className="p-2 text-left text-sm">Discount %</th>
                  <th className="p-2 text-right text-sm">Total</th>
                  <th className="p-2 text-center text-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, index) => {
                  const itemTotal = item.quantity * item.unitPrice * (1 - item.discountPercent / 100);
                  return (
                    <tr key={index} className="border-b">
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleLineItemChange(index, "description", e.target.value)}
                          className="w-full px-2 py-1 border rounded"
                          placeholder="Item description"
                          required
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleLineItemChange(index, "quantity", e.target.value)}
                          className="w-full px-2 py-1 border rounded"
                          required
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => handleLineItemChange(index, "unitPrice", e.target.value)}
                          className="w-full px-2 py-1 border rounded"
                          required
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={item.discountPercent}
                          onChange={(e) => handleLineItemChange(index, "discountPercent", e.target.value)}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="p-2 text-right font-medium">${itemTotal.toFixed(2)}</td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeLineItem(index)}
                          className="text-red-600 hover:text-red-800"
                          disabled={lineItems.length === 1}
                        >
                          <MdDelete className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals and Additional Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Tax and Status */}
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Tax Percent (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="taxPercent"
                value={formData.taxPercent}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="DRAFT">Draft</option>
                <option value="SENT">Sent</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Internal notes..."
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Terms & Conditions</label>
              <textarea
                name="termsAndConditions"
                value={formData.termsAndConditions}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Terms and conditions..."
              />
            </div>
          </div>

          {/* Right: Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Quotation Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax ({formData.taxPercent}%):</span>
                <span className="font-medium">${calculateTax().toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-lg font-bold text-blue-600">${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating..." : "Create Quotation"}
          </button>
        </div>
      </form>

      {/* Add Customer Modal */}
      {showCustomerModal && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-500 ${modalTransition}`}
          onClick={handleModalClick}
        >
          <div className="w-11/12 sm:w-3/4 md:w-1/2 lg:w-2/5 xl:w-1/3 p-2 rounded-lg max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-2 right-2 text-xl z-10"
              onClick={() => {
                setShowCustomerModal(false);
                fetchCustomers();
              }}
            >
              <FaTimes />
            </button>
            <AddCustomer />
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateQuotation;
