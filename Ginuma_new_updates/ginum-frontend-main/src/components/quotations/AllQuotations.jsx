import React, { useState, useEffect } from "react";
import { MdDelete, MdEdit, MdVisibility, MdRefresh } from "react-icons/md";
import { FaCheck, FaTimes, FaClock, FaPaperPlane, FaFileDownload, FaEnvelope } from "react-icons/fa";
import api from "../../utils/api";
import Alert from "../Alert/Alert";

const AllQuotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [filteredQuotations, setFilteredQuotations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const companyId = localStorage.getItem("companyId");

  useEffect(() => {
    fetchQuotations();
  }, []);

  useEffect(() => {
    filterQuotations();
  }, [selectedStatus, searchTerm, quotations]);

  const fetchQuotations = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/api/companies/${companyId}/quotations`);
      setQuotations(response.data || response || []);
    } catch (error) {
      console.error("Error fetching quotations:", error);
      Alert.error("Failed to load quotations");
    } finally {
      setIsLoading(false);
    }
  };

  const filterQuotations = () => {
    let filtered = quotations;

    if (selectedStatus !== "ALL") {
      filtered = filtered.filter(q => q.status === selectedStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(q =>
        q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredQuotations(filtered);
  };

  const handleStatusChange = async (quotationId, newStatus) => {
    try {
      await api.patch(`/api/companies/${companyId}/quotations/${quotationId}/status?status=${newStatus}`);
      Alert.success(`Quotation status updated to ${newStatus}`);
      await fetchQuotations();
    } catch (error) {
      console.error("Error updating status:", error);
      Alert.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async (quotationId) => {
    const result = await Alert.confirm(
      "Are you sure you want to delete this quotation? This action cannot be undone.",
      "Yes, Delete",
      "Cancel"
    );
    if (!result.isConfirmed) return;

    try {
      await api.delete(`/api/companies/${companyId}/quotations/${quotationId}`);
      Alert.success("Quotation deleted successfully");
      await fetchQuotations();
    } catch (error) {
      console.error("Error deleting quotation:", error);
      Alert.error(error.response?.data?.message || "Failed to delete quotation");
    }
  };

  const viewDetails = async (quotationId) => {
    try {
      const response = await api.get(`/api/companies/${companyId}/quotations/${quotationId}`);
      setSelectedQuotation(response.data || response);
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Error fetching quotation details:", error);
      Alert.error("Failed to load quotation details");
    }
  };

  const downloadPDF = async (quotationId, quotationNumber) => {
    try {
      const response = await fetch(`${api.defaults.baseURL}/api/companies/${companyId}/quotations/${quotationId}/pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${quotationNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      Alert.success("PDF downloaded successfully");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      Alert.error("Failed to download PDF");
    }
  };

  const sendEmail = async (quotationId, customerName) => {
    try {
      const response = await api.post(`/api/companies/${companyId}/quotations/${quotationId}/send-email`);
      Alert.success(`Email sent successfully to ${customerName}`);
    } catch (error) {
      console.error("Error sending email:", error);
      Alert.error(error.response?.data || "Failed to send email");
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded text-xs font-medium";
    switch (status) {
      case "DRAFT":
        return <span className={`${baseClasses} bg-gray-100 text-gray-700`}>Draft</span>;
      case "SENT":
        return <span className={`${baseClasses} bg-blue-100 text-blue-700`}>Sent</span>;
      case "ACCEPTED":
        return <span className={`${baseClasses} bg-green-100 text-green-700`}>Accepted</span>;
      case "REJECTED":
        return <span className={`${baseClasses} bg-red-100 text-red-700`}>Rejected</span>;
      case "EXPIRED":
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-700`}>Expired</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-700`}>{status}</span>;
    }
  };

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-6 mt-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-600">Loading quotations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-4 sm:p-6 mt-4 sm:mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">All Quotations</h2>
        <button
          onClick={fetchQuotations}
          className="p-2 text-blue-600 hover:text-blue-700"
          title="Refresh"
        >
          <MdRefresh className="h-6 w-6" />
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Filter by Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SENT">Sent</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Search</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Search by quotation # or customer..."
          />
        </div>
      </div>

      {/* Quotations Table */}
      {filteredQuotations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No quotations found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left text-sm font-semibold">Quotation #</th>
                <th className="p-3 text-left text-sm font-semibold">Customer</th>
                <th className="p-3 text-left text-sm font-semibold">Issue Date</th>
                <th className="p-3 text-left text-sm font-semibold">Expiry Date</th>
                <th className="p-3 text-right text-sm font-semibold">Total</th>
                <th className="p-3 text-center text-sm font-semibold">Status</th>
                <th className="p-3 text-center text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotations.map((quotation) => {
                const expired = isExpired(quotation.expiryDate);
                return (
                  <tr key={quotation.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-sm font-mono">{quotation.quotationNumber}</td>
                    <td className="p-3 text-sm">{quotation.customerName}</td>
                    <td className="p-3 text-sm">{new Date(quotation.issueDate).toLocaleDateString()}</td>
                    <td className="p-3 text-sm">
                      <span className={expired && quotation.status !== "ACCEPTED" ? "text-red-600 font-medium" : ""}>
                        {new Date(quotation.expiryDate).toLocaleDateString()}
                        {expired && quotation.status !== "ACCEPTED" && " (Expired)"}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-right font-medium">Rs. {quotation.total.toFixed(2)}</td>
                    <td className="p-3 text-center">{getStatusBadge(quotation.status)}</td>
                    <td className="p-3">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => viewDetails(quotation.id)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <MdVisibility className="h-5 w-5" />
                        </button>

                        <button
                          onClick={() => downloadPDF(quotation.id, quotation.quotationNumber)}
                          className="text-purple-600 hover:text-purple-800"
                          title="Download PDF"
                        >
                          <FaFileDownload className="h-5 w-5" />
                        </button>

                        <button
                          onClick={() => sendEmail(quotation.id, quotation.customerName)}
                          className="text-orange-600 hover:text-orange-800"
                          title="Send Email to Customer"
                        >
                          <FaEnvelope className="h-5 w-5" />
                        </button>

                        {quotation.status === "DRAFT" && (
                          <button
                            onClick={() => handleStatusChange(quotation.id, "SENT")}
                            className="text-green-600 hover:text-green-800"
                            title="Mark as Sent"
                          >
                            <FaPaperPlane className="h-4 w-4" />
                          </button>
                        )}

                        {quotation.status === "SENT" && (
                          <>
                            <button
                              onClick={() => handleStatusChange(quotation.id, "ACCEPTED")}
                              className="text-green-600 hover:text-green-800"
                              title="Mark as Accepted"
                            >
                              <FaCheck className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(quotation.id, "REJECTED")}
                              className="text-red-600 hover:text-red-800"
                              title="Mark as Rejected"
                            >
                              <FaTimes className="h-5 w-5" />
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => handleDelete(quotation.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <MdDelete className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedQuotation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-11/12 md:w-3/4 lg:w-1/2 bg-white rounded-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Quotation Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Quotation Number</p>
                  <p className="font-medium">{selectedQuotation.quotationNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  {getStatusBadge(selectedQuotation.status)}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-medium">{selectedQuotation.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Issue Date</p>
                  <p className="font-medium">{new Date(selectedQuotation.issueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Expiry Date</p>
                  <p className="font-medium">{new Date(selectedQuotation.expiryDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Line Items</h4>
                <table className="w-full text-sm border">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2 text-left">Description</th>
                      <th className="p-2 text-right">Qty</th>
                      <th className="p-2 text-right">Unit Price</th>
                      <th className="p-2 text-right">Discount %</th>
                      <th className="p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedQuotation.lineItems.map((item, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="p-2">{item.description}</td>
                        <td className="p-2 text-right">{item.quantity}</td>
                        <td className="p-2 text-right">Rs. {item.unitPrice.toFixed(2)}</td>
                        <td className="p-2 text-right">{item.discountPercent}%</td>
                        <td className="p-2 text-right font-medium">Rs. {item.totalPrice.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">Rs. {selectedQuotation.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Tax ({selectedQuotation.taxPercent}%):</span>
                  <span className="font-medium">Rs. {selectedQuotation.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-blue-600">Rs. {selectedQuotation.total.toFixed(2)}</span>
                </div>
              </div>

              {selectedQuotation.notes && (
                <div>
                  <p className="text-sm text-gray-600">Notes</p>
                  <p className="text-sm">{selectedQuotation.notes}</p>
                </div>
              )}

              {selectedQuotation.termsAndConditions && (
                <div>
                  <p className="text-sm text-gray-600">Terms & Conditions</p>
                  <p className="text-sm">{selectedQuotation.termsAndConditions}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllQuotations;
