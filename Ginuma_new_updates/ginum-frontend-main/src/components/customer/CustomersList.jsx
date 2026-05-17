import React, { useState, useEffect } from 'react';
import { FiSearch, FiUser, FiPhone, FiMail, FiEye, FiX } from 'react-icons/fi';
import { apiUrl } from '../../utils/api';
import Alert from '../../components/Alert/Alert';
import { useNavigate } from 'react-router-dom';

const CustomersList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const companyId = localStorage.getItem("companyId");
  const token = localStorage.getItem("auth_token");

  // Modal states
  const [viewCustomer, setViewCustomer] = useState(null);

  const fetchCustomers = async () => {
    try {
      if (!companyId || !token) throw new Error("Missing credentials");
      setLoading(true);
      const response = await fetch(`${apiUrl}/api/customers/companies/${companyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCustomers(Array.isArray(data) ? data : []);
      } else {
        Alert.error("Failed to load customers");
      }
    } catch (e) {
      console.error(e);
      Alert.error("Error loading customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  // Editing and deletion are disabled in the Finance service; master data is read-only.

  const filteredCustomers = customers.filter(c =>
    (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.phoneNo && c.phoneNo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex justify-center flex-col items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-500">Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Customers</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search customers..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Creation disabled: master data creation handled by separate microservice */}
        </div>
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 text-lg">
            {customers.length === 0 ? "No customers found." : "No matching customers found."}
          </p>
          {/* Creation disabled: master data creation handled by separate microservice */}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                          <FiUser size={20} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500">{customer.billingAddress}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-2"><FiPhone className="text-gray-400" /> {customer.phoneNo || '-'}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2 mt-1"><FiMail className="text-gray-400" /> {customer.email || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {customer.customerType || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center items-center">
                        <button
                          onClick={() => setViewCustomer(customer)}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition"
                          title="View"
                        >
                          <FiEye size={12} /> View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== VIEW MODAL ===== */}
      {viewCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setViewCustomer(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><FiX size={20} /></button>
            <div className="flex items-center gap-3 mb-5 border-b pb-3">
              <div className="h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <FiUser size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{viewCustomer.name}</h3>
                <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full font-semibold">{viewCustomer.customerType || 'N/A'}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-400 text-xs mb-1">Email</p><p className="font-medium">{viewCustomer.email || '—'}</p></div>
              <div><p className="text-gray-400 text-xs mb-1">Phone</p><p className="font-medium">{viewCustomer.phoneNo || '—'}</p></div>
              <div><p className="text-gray-400 text-xs mb-1">Billing Address</p><p>{viewCustomer.billingAddress || '—'}</p></div>
              <div><p className="text-gray-400 text-xs mb-1">Delivery Address</p><p>{viewCustomer.deliveryAddress || '—'}</p></div>
              <div><p className="text-gray-400 text-xs mb-1">NIC No</p><p>{viewCustomer.nicNo || '—'}</p></div>
              <div><p className="text-gray-400 text-xs mb-1">TIN No</p><p>{viewCustomer.tinNo || '—'}</p></div>
              <div><p className="text-gray-400 text-xs mb-1">VAT No</p><p>{viewCustomer.vat || '—'}</p></div>
              <div><p className="text-gray-400 text-xs mb-1">Swift No</p><p>{viewCustomer.swiftNo || '—'}</p></div>
              <div><p className="text-gray-400 text-xs mb-1">Discount %</p><p>{viewCustomer.discountPercentage != null ? `${viewCustomer.discountPercentage}%` : '—'}</p></div>
              <div><p className="text-gray-400 text-xs mb-1">Tax Type</p><p>{viewCustomer.tax || '—'}</p></div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setViewCustomer(null)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm">Close</button>
            </div>
          </div>
        </div>
      )}
      {/* Edit and Delete actions removed — master data is read-only in this service */}
    </div>
  );
};

export default CustomersList;