import React, { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiEdit, FiTrash2, FiUser, FiPhone, FiMail, FiEye, FiX, FiSave } from 'react-icons/fi';
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
  const [editCustomer, setEditCustomer] = useState(null);
  const [deleteCustomer, setDeleteCustomer] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit form fields
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBillingAddress, setEditBillingAddress] = useState('');
  const [editDeliveryAddress, setEditDeliveryAddress] = useState('');
  const [editNicNo, setEditNicNo] = useState('');
  const [editTinNo, setEditTinNo] = useState('');
  const [editVat, setEditVat] = useState('');
  const [editSwiftNo, setEditSwiftNo] = useState('');
  const [editDiscount, setEditDiscount] = useState('');
  const [editCustomerType, setEditCustomerType] = useState('');

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

  // ===== OPEN EDIT MODAL =====
  const openEdit = (customer) => {
    setEditCustomer(customer);
    setEditName(customer.name || '');
    setEditEmail(customer.email || '');
    setEditPhone(customer.phoneNo || '');
    setEditBillingAddress(customer.billingAddress || '');
    setEditDeliveryAddress(customer.deliveryAddress || '');
    setEditNicNo(customer.nicNo || '');
    setEditTinNo(customer.tinNo || '');
    setEditVat(customer.vat || '');
    setEditSwiftNo(customer.swiftNo || '');
    setEditDiscount(customer.discountPercentage != null ? String(customer.discountPercentage) : '');
    setEditCustomerType(customer.customerType || '');
  };

  // ===== SAVE EDIT =====
  const handleSaveEdit = async () => {
    if (!editName.trim()) { Alert.error("Customer name is required."); return; }
    try {
      setIsSaving(true);
      const response = await fetch(`${apiUrl}/api/customers/${editCustomer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: editName.trim(),
          email: editEmail.trim(),
          phoneNo: editPhone.trim(),
          billingAddress: editBillingAddress.trim(),
          deliveryAddress: editDeliveryAddress.trim(),
          nicNo: editNicNo.trim(),
          tinNo: editTinNo.trim(),
          vat: editVat.trim(),
          swiftNo: editSwiftNo.trim(),
          discountPercentage: editDiscount ? parseFloat(editDiscount) : null,
          customerType: editCustomerType || null,
        })
      });
      if (response.ok) {
        Alert.success("Customer updated successfully!");
        setEditCustomer(null);
        fetchCustomers();
      } else {
        const err = await response.json();
        Alert.error(err.message || "Failed to update customer.");
      }
    } catch (e) {
      console.error(e);
      Alert.error("Error updating customer.");
    } finally {
      setIsSaving(false);
    }
  };

  // ===== CONFIRM DELETE =====
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`${apiUrl}/api/customers/${deleteCustomer.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        Alert.success("Customer deleted successfully!");
        setDeleteCustomer(null);
        fetchCustomers();
      } else {
        Alert.error("Failed to delete customer.");
      }
    } catch (e) {
      console.error(e);
      Alert.error("Error deleting customer.");
    } finally {
      setIsDeleting(false);
    }
  };

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
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
            onClick={() => navigate('/app/customer/new')}
          >
            <FiPlus /> Add Customer
          </button>
        </div>
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 text-lg">
            {customers.length === 0 ? "No customers found." : "No matching customers found."}
          </p>
          <button
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
            onClick={() => navigate('/app/customer/new')}
          >
            <FiPlus /> Add New Customer
          </button>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex justify-center items-center gap-2">
                        {/* VIEW */}
                        <button
                          onClick={() => setViewCustomer(customer)}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition"
                          title="View"
                        >
                          <FiEye size={12} /> View
                        </button>
                        {/* EDIT */}
                        <button
                          onClick={() => openEdit(customer)}
                          className="flex items-center gap-1 px-2 py-1 bg-yellow-400 hover:bg-yellow-500 text-white text-xs rounded transition"
                          title="Edit"
                        >
                          <FiEdit size={12} /> Edit
                        </button>
                        {/* DELETE */}
                        <button
                          onClick={() => setDeleteCustomer(customer)}
                          className="flex items-center gap-1 px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition"
                          title="Delete"
                        >
                          <FiTrash2 size={12} /> Delete
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

      {/* ===== EDIT MODAL ===== */}
      {editCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setEditCustomer(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><FiX size={20} /></button>
            <h3 className="text-xl font-bold text-gray-800 mb-5 border-b pb-3">Edit Customer</h3>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-gray-700 font-medium mb-1">Name <span className="text-red-500">*</span></label>
                  <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Email</label>
                  <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Phone</label>
                  <input value={editPhone} onChange={e => setEditPhone(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Customer Type</label>
                  <select value={editCustomerType} onChange={e => setEditCustomerType(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400">
                    <option value="">Select type</option>
                    <option value="INDIVIDUAL">Individual</option>
                    <option value="BUSINESS">Business</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Discount %</label>
                  <input type="number" min="0" max="100" step="0.1" value={editDiscount} onChange={e => setEditDiscount(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400" placeholder="0" />
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-700 font-medium mb-1">Billing Address</label>
                  <input value={editBillingAddress} onChange={e => setEditBillingAddress(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400" />
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-700 font-medium mb-1">Delivery Address</label>
                  <input value={editDeliveryAddress} onChange={e => setEditDeliveryAddress(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">NIC No</label>
                  <input value={editNicNo} onChange={e => setEditNicNo(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">TIN No</label>
                  <input value={editTinNo} onChange={e => setEditTinNo(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">VAT No</label>
                  <input value={editVat} onChange={e => setEditVat(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Swift No</label>
                  <input value={editSwiftNo} onChange={e => setEditSwiftNo(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400" />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEditCustomer(null)} disabled={isSaving} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm">Cancel</button>
              <button onClick={handleSaveEdit} disabled={isSaving} className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm disabled:opacity-50 transition">
                <FiSave size={14} /> {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== DELETE CONFIRM MODAL ===== */}
      {deleteCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 relative">
            <button onClick={() => setDeleteCustomer(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><FiX size={18} /></button>
            <div className="text-center">
              <div className="mx-auto mb-4 flex items-center justify-center w-14 h-14 rounded-full bg-red-100">
                <FiTrash2 className="text-red-500" size={22} />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Customer?</h3>
              <p className="text-gray-600 text-sm mb-1">You are about to delete:</p>
              <p className="font-semibold text-gray-800 mb-1">{deleteCustomer.name}</p>
              <p className="text-gray-500 text-sm mb-4">{deleteCustomer.email}</p>
              <p className="text-red-500 text-sm mb-6">⚠️ This action cannot be undone.</p>
              <div className="flex justify-center gap-3">
                <button onClick={() => setDeleteCustomer(null)} disabled={isDeleting} className="px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm">Cancel</button>
                <button onClick={handleDelete} disabled={isDeleting} className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm disabled:opacity-50 transition">
                  {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersList;