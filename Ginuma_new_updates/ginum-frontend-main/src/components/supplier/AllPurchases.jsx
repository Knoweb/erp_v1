import React, { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiFileText, FiDollarSign } from 'react-icons/fi';
import { apiUrl } from '../../utils/api';
import Alert from '../../components/Alert/Alert';
import { useNavigate } from 'react-router-dom';

const AllPurchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const companyId = localStorage.getItem("companyId");
  const token = localStorage.getItem("auth_token");

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        if (!companyId || !token) return;
        setLoading(true);
        const response = await fetch(`${apiUrl}/api/${companyId}/purchase-orders`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setPurchases(Array.isArray(data) ? data : []);
        } else {
          Alert.error("Failed to load purchases");
        }
      } catch (err) {
        console.error(err);
        Alert.error("Error loading purchases");
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, [companyId, token]);

  const filteredPurchases = purchases.filter(p =>
    (p.supplierName && p.supplierName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.supplierInvoiceNumber && p.supplierInvoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex justify-center flex-col items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-500">Loading purchase orders...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Purchase Orders</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search purchases..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
            onClick={() => navigate('/app/supplier/purchase/new')}
          >
            <FiPlus /> Create Purchase Order
          </button>
        </div>
      </div>

      {filteredPurchases.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 text-lg">
            {purchases.length === 0 ? "No purchases found." : "No matching purchases found."}
          </p>
          <button
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
            onClick={() => navigate('/app/supplier/purchase/new')}
          >
            <FiPlus /> Create New PO
          </button>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPurchases.map((po) => (
                  <tr key={po.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 text-gray-400">
                          <FiFileText size={18} />
                        </div>
                        <div className="ml-3 text-sm font-medium text-blue-600">{po.supplierInvoiceNumber}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{po.supplierName}</div>
                      <div className="text-xs text-gray-500">{po.purchaseType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {po.issueDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900 flex items-center">
                        <FiDollarSign className="text-gray-400 mr-1" />
                        {po.total?.toFixed(2) || '0.00'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {po.balanceDue <= 0 ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Paid</span>
                      ) : po.balanceDue < po.total ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Partially Paid</span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Unpaid</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllPurchases;