import React, { useState, useEffect } from 'react';
import { FiSearch, FiUser, FiPhone, FiMail, FiEye, FiX, FiShield, FiMapPin, FiUsers, FiRefreshCw, FiChevronDown, FiChevronUp, FiFileText } from 'react-icons/fi';
import { fetchCompanyCustomers } from '../../utils/customerApi';
import { syncCustomersFromMiddeniya } from '../../utils/syncApi';
import api from '../../utils/api';
import Alert from '../../components/Alert/Alert';

const CustomersList = () => {
  const [customers, setCustomers] = useState([]);
  const [productMap, setProductMap] = useState({});
  const [customerSOsMap, setCustomerSOsMap] = useState({});
  const [loadingSOsMap, setLoadingSOsMap] = useState({});
  const [expandedCustomers, setExpandedCustomers] = useState({});
  const [selectedSO, setSelectedSO] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const companyId = localStorage.getItem("companyId");
  const token = localStorage.getItem("auth_token");

  // Modal states
  const [viewCustomer, setViewCustomer] = useState(null);

  const fetchCustomers = async () => {
    try {
      if (!companyId || !token) throw new Error("Missing credentials");
      setLoading(true);
      
      const [customersData, productsData] = await Promise.all([
        fetchCompanyCustomers(companyId, token),
        api.get(`/api/finance/external/inventory-products/${companyId}`).catch(() => [])
      ]);

      setCustomers(Array.isArray(customersData) ? customersData : []);

      const pMap = {};
      if (Array.isArray(productsData)) {
        productsData.forEach(p => {
          pMap[p.id] = p.name;
        });
      }
      setProductMap(pMap);
    } catch (e) {
      console.error(e);
      Alert.error("Error loading customers");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = async (customer) => {
    const customerId = customer.id;
    const displayName = customer.name || customer.customerName || '';
    const isExpanded = !expandedCustomers[customerId];
    setExpandedCustomers(prev => ({
      ...prev,
      [customerId]: isExpanded
    }));

    if (isExpanded && !customerSOsMap[customerId]) {
      try {
        setLoadingSOsMap(prev => ({ ...prev, [customerId]: true }));
        const data = await api.get(`/api/finance/external/inventory-sos/${customerId}?name=${encodeURIComponent(displayName)}`);
        setCustomerSOsMap(prev => ({
          ...prev,
          [customerId]: Array.isArray(data) ? data : []
        }));
      } catch (err) {
        console.error("Error loading external SOs:", err);
        setCustomerSOsMap(prev => ({
          ...prev,
          [customerId]: []
        }));
      } finally {
        setLoadingSOsMap(prev => ({ ...prev, [customerId]: false }));
      }
    }
  };

  const handleSyncCustomers = async () => {
    try {
      setSyncing(true);
      const result = await syncCustomersFromMiddeniya(parseInt(companyId), parseInt(companyId));
      Alert.success(`✅ Sync completed: ${result.created} created, ${result.updated} updated`);
      // Refresh the customer list after sync
      await fetchCustomers();
    } catch (e) {
      console.error(e);
      Alert.error("Sync failed: " + (e.response?.data?.message || e.message));
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

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
    <div className="container mx-auto px-4 py-8 space-y-6 max-w-7xl">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 z-0 opacity-50"></div>
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-indigo-700 border border-indigo-100 mb-2">
              <FiShield size={12} /> Master Data Repository
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Customer Directory</h1>
            <p className="text-sm text-slate-500 max-w-xl">
              Access and manage your integrated customer database. Synchronize records from the central inventory system and view comprehensive contact profiles.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm border border-slate-100">
                  <FiUsers size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-tight">Total count</p>
                  <p className="text-lg font-black text-slate-900 leading-tight">{customers.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 relative z-10 border-t border-slate-100 pt-6">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <FiSearch className="text-slate-400" size={18} />
            </div>
            <input
              type="text"
              placeholder="Search by name, contact number, email or VAT ID..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-12 py-3.5 text-sm text-slate-700 transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-100 text-cyan-700">
            <FiUser size={24} />
          </div>
          <p className="text-lg font-semibold text-slate-900">
            {customers.length === 0 ? "No customers available" : "No matching customers"}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {customers.length === 0
              ? "Customer records will appear here once they are added in the master data service."
              : "Try a different search term or clear the search box to see the full list."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden bg-white shadow-sm border border-slate-200 rounded-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-[#f8fafc]">
                <tr>
                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">Customer Details</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">Contact Information</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">Tax Status</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">Sales Orders</th>
                  <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">                 {filteredCustomers.map((customer) => {
                  const displayName = customer.name || customer.customerName || 'Unnamed customer';
                  const contactAddress = customer.billingAddress || customer.address || customer.deliveryAddress || '-';
                  const customerType = customer.customerType || 'Customer';
                  const phone = customer.phoneNo || customer.phoneNumber || customer.phone || customer.mobileNo || '-';
                  const email = customer.email || '-';
                  
                  // Get clean VAT number, filtering out enum values
                  let displayVat = customer.vat || customer.vatNumber || customer.vatNo || "";
                  if (['EXCLUSIVE', 'INCLUSIVE', 'VAT', 'SST', 'GST'].includes(String(displayVat).toUpperCase())) {
                    displayVat = "";
                  }

                  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                  const isExpanded = !!expandedCustomers[customer.id];

                  return (
                    <React.Fragment key={customer.id}>
                      <tr className="group transition-all duration-200 hover:bg-slate-50/80">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 font-bold text-sm ring-1 ring-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200">
                              {initials}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-slate-900 leading-none">{displayName}</span>
                              {contactAddress && contactAddress !== '-' && (
                                <span className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400 max-w-[200px] truncate" title={contactAddress}>
                                  <FiMapPin size={12} className="shrink-0" />
                                  {contactAddress}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5">
                            {phone && phone !== '-' && (
                              <div className="flex items-center gap-2 text-[13px] text-slate-600">
                                <div className="h-6 w-6 rounded flex items-center justify-center bg-slate-100 text-slate-500">
                                  <FiPhone size={12} />
                                </div>
                                <span className="font-medium">{phone}</span>
                              </div>
                            )}
                            {email && email !== '-' && (
                              <div className="flex items-center gap-2 text-[13px] text-slate-500">
                                <div className="h-6 w-6 rounded flex items-center justify-center bg-slate-100 text-slate-400">
                                  <FiMail size={12} />
                                </div>
                                <span className="truncate max-w-[180px]">{email}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                              customerType === 'INDIVIDUAL' 
                                ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                                : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                            }`}>
                              {customerType}
                            </span>
                            {displayVat ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] font-bold uppercase tracking-wider">
                                VAT: {displayVat}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-500 border border-slate-200 text-[11px] font-medium uppercase tracking-wider">
                                No Tax ID
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleExpand(customer)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors"
                          >
                            <span>Sales Orders</span>
                            {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => setViewCustomer(customer)}
                            className="inline-flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 hover:text-indigo-600 active:scale-95"
                          >
                            <FiEye className="text-slate-400 group-hover:text-indigo-500" />
                            View Details
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={5} className="px-8 py-4 bg-gray-50/50">
                            {loadingSOsMap[customer.id] ? (
                              <div className="flex justify-center items-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                              </div>
                            ) : !customerSOsMap[customer.id] || customerSOsMap[customer.id].length === 0 ? (
                              <div className="text-center py-4 text-gray-500 text-sm italic">
                                No sales orders found for this customer in inventory.
                              </div>
                            ) : (
                              <div className="border border-gray-100 rounded-lg overflow-hidden bg-white shadow-sm">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SO Number</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created Date</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {customerSOsMap[customer.id].map(so => (
                                      <tr key={so.id} className="hover:bg-gray-50/80">
                                        <td className="px-4 py-2.5 whitespace-nowrap text-sm font-medium text-blue-600 flex items-center gap-1.5">
                                          <FiFileText className="text-gray-400" />
                                          <span>{`SO-${String(so.id).padStart(3, '0')}`}</span>
                                        </td>
                                        <td className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-500">
                                          {so.createdAt ? new Date(so.createdAt).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-4 py-2.5 whitespace-nowrap text-sm font-bold text-gray-900">
                                          Rs. {Number(so.projectedTotal || so.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-4 py-2.5 whitespace-nowrap">
                                          <span className={`px-2 inline-flex text-[10px] leading-4 font-semibold rounded-full ${
                                            so.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                          }`}>
                                            {so.status}
                                          </span>
                                        </td>
                                        <td className="px-4 py-2.5 whitespace-nowrap text-right text-xs">
                                          <button
                                            onClick={() => setSelectedSO(so)}
                                            className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1 font-semibold"
                                          >
                                            <FiEye /> View Detail
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== VIEW MODAL ===== */}
      {viewCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 backdrop-blur-sm transition-all duration-300">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
            <div className="bg-slate-900 px-8 py-7 text-white relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16"></div>
              <div className="flex items-start justify-between gap-4 relative z-10">
                <div className="flex items-center gap-5">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-md">
                    <FiUser size={30} className="text-indigo-300" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-400 opacity-80">Profile Records</p>
                    <h3 className="mt-1 text-2xl font-black tracking-tight">{viewCustomer.name || viewCustomer.customerName || 'Unnamed customer'}</h3>
                    <p className="mt-1 text-sm text-slate-400">Detailed overview of the selected master data record.</p>
                  </div>
                </div>
                <button onClick={() => setViewCustomer(null)} className="rounded-xl bg-white/5 p-2.5 text-slate-400 transition-all hover:bg-white/10 hover:text-white" aria-label="Close">
                  <FiX size={20} />
                </button>
              </div>
            </div>

            <div className="p-8">
              <div className="mb-8 flex flex-wrap gap-3">
                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                  (viewCustomer.customerType || 'Customer') === 'INDIVIDUAL' 
                    ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                }`}>
                  {viewCustomer.customerType || 'Customer'}
                </span>
                <span className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-slate-500 border border-slate-200">
                  <FiShield size={14} className="mr-2" /> Master File
                </span>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 text-sm">
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Primary Email</p>
                  <p className="font-bold text-slate-900 break-all">{viewCustomer.email || '—'}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Phone Number</p>
                  <p className="font-bold text-slate-900">{viewCustomer.phoneNo || viewCustomer.phoneNumber || viewCustomer.phone || viewCustomer.mobileNo || '—'}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5 sm:col-span-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Registered Address</p>
                  <p className="font-bold text-slate-900 leading-relaxed">{viewCustomer.billingAddress || viewCustomer.address || viewCustomer.deliveryAddress || '—'}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Tax Registration (VAT)</p>
                  <p className="font-bold text-emerald-700">
                    {(() => {
                      const vat = viewCustomer.vat || viewCustomer.vatNumber || viewCustomer.vatNo || '';
                      const isEnum = ['EXCLUSIVE', 'INCLUSIVE', 'VAT', 'SST', 'GST'].includes(String(vat).toUpperCase());
                      if (vat && !isEnum) {
                        return vat;
                      }
                      return viewCustomer.taxNumber && !['EXCLUSIVE', 'INCLUSIVE'].includes(String(viewCustomer.taxNumber).toUpperCase()) ? viewCustomer.taxNumber : 'Not Registered';
                    })()}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Identity Number (NIC)</p>
                  <p className="font-bold text-slate-900">{viewCustomer.nicNo || '—'}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">TIN No</p>
                  <p className="mt-2 font-semibold text-slate-900">{viewCustomer.tinNo || '—'}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Discount %</p>
                  <p className="mt-2 font-semibold text-slate-900">{viewCustomer.discountPercentage != null ? `${viewCustomer.discountPercentage}%` : '—'}</p>
                </div>
                {viewCustomer.contactInfo && Object.keys(viewCustomer.contactInfo).length > 0 && (
                  <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Contact Info</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {Object.entries(viewCustomer.contactInfo).map(([key, value]) => (
                        <div key={key} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{key}</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900 break-words">{String(value)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button onClick={() => setViewCustomer(null)} className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-300">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Sales Order Details Modal */}
      {selectedSO && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Sales Order Details</h2>
              <button 
                className="text-slate-400 hover:text-slate-600 text-2xl" 
                onClick={() => setSelectedSO(null)}
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 block">SO Number</span>
                  <span className="font-bold text-slate-800">{`SO-${String(selectedSO.id).padStart(3, '0')}`}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Status</span>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                    selectedSO.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedSO.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Created At</span>
                  <span className="font-semibold text-slate-700">
                    {selectedSO.createdAt ? new Date(selectedSO.createdAt).toLocaleDateString() : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Total Amount</span>
                  <span className="font-bold text-indigo-600">
                    Rs. {Number(selectedSO.projectedTotal || selectedSO.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Items</h3>
                <div className="max-h-60 overflow-y-auto border border-slate-100 rounded-lg">
                  <table className="min-w-full divide-y divide-slate-100 text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-bold text-slate-500">Product</th>
                        <th className="px-4 py-2 text-center text-xs font-bold text-slate-500">Qty</th>
                        <th className="px-4 py-2 text-right text-xs font-bold text-slate-500">Unit Price</th>
                        <th className="px-4 py-2 text-right text-xs font-bold text-slate-500">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedSO.items?.map((item, idx) => {
                        const productName = productMap[item.productId] || `Product #${item.productId}`;
                        const totalAmount = (item.quantity || 0) * (item.unitPrice || 0);
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="px-4 py-2 text-slate-700">{productName}</td>
                            <td className="px-4 py-2 text-center text-slate-700">{item.quantity}</td>
                            <td className="px-4 py-2 text-right text-slate-700">Rs. {Number(item.unitPrice || 0).toFixed(2)}</td>
                            <td className="px-4 py-2 text-right font-semibold text-slate-900">Rs. {totalAmount.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setSelectedSO(null)}
                className="px-4 py-2 bg-slate-950 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors"
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

export default CustomersList;