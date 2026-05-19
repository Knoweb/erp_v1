import React, { useState, useEffect } from 'react';
import { FiSearch, FiUser, FiPhone, FiMail, FiEye, FiX, FiShield, FiMapPin, FiUsers } from 'react-icons/fi';
import { fetchCompanyCustomers } from '../../utils/customerApi';
import Alert from '../../components/Alert/Alert';

const CustomersList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const companyId = localStorage.getItem("companyId");
  const token = localStorage.getItem("auth_token");

  // Modal states
  const [viewCustomer, setViewCustomer] = useState(null);

  const fetchCustomers = async () => {
    try {
      if (!companyId || !token) throw new Error("Missing credentials");
      setLoading(true);
      const data = await fetchCompanyCustomers(companyId, token);
      setCustomers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      Alert.error("Error loading customers");
    } finally {
      setLoading(false);
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
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-slate-50 to-cyan-50 p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700">
              <FiShield /> Master data synced
            </div>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">Customers</h1>
            <p className="mt-2 text-sm text-slate-600">
              Browse the shared customer directory, check contact details, and open a record when you need more context.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700">
                  <FiUsers />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total customers</p>
                  <p className="text-lg font-semibold text-slate-900">{customers.length}</p>
                </div>
              </div>
            </div>

            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FiSearch className="text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search customers, phone, or email"
                className="w-full rounded-2xl border border-slate-200 bg-white px-10 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
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
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Profile</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredCustomers.map((customer) => {
                  const displayName = customer.name || customer.customerName || 'Unnamed customer';
                  const contactAddress = customer.billingAddress || customer.address || customer.deliveryAddress || '-';
                  const customerType = customer.customerType || 'Customer';
                  const phone = customer.phoneNo || customer.phoneNumber || '-';
                  const email = customer.email || '-';

                  return (
                    <tr key={customer.id} className="transition hover:bg-slate-50/80">
                      <td className="px-6 py-5 align-top">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
                            <FiUser size={20} />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{displayName}</div>
                            <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                              <FiMapPin className="text-slate-400" />
                              <span>{contactAddress}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 align-top">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-slate-700">
                            <FiPhone className="text-slate-400" />
                            <span>{phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <FiMail className="text-slate-400" />
                            <span>{email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 align-top">
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                            {customerType}
                          </span>
                          {customer.vat || customer.vatNumber ? (
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                              VAT {customer.vat || customer.vatNumber}
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                              No tax info
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 align-top text-center">
                        <button
                          onClick={() => setViewCustomer(customer)}
                          className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-cyan-700"
                          title="View customer details"
                        >
                          <FiEye size={12} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== VIEW MODAL ===== */}
      {viewCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                    <FiUser size={26} />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-100">Customer profile</p>
                    <h3 className="mt-1 text-2xl font-bold">{viewCustomer.name || viewCustomer.customerName || 'Unnamed customer'}</h3>
                    <p className="mt-1 text-sm text-cyan-100">Detailed view of the selected customer record.</p>
                  </div>
                </div>
                <button onClick={() => setViewCustomer(null)} className="rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25" aria-label="Close">
                  <FiX size={20} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {viewCustomer.customerType || 'Customer'}
                </span>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  <FiShield className="mr-1" /> Master data read-only
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 text-sm">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Email</p>
                  <p className="mt-2 font-semibold text-slate-900">{viewCustomer.email || '—'}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Phone</p>
                  <p className="mt-2 font-semibold text-slate-900">{viewCustomer.phoneNo || viewCustomer.phoneNumber || '—'}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Address</p>
                  <p className="mt-2 font-semibold text-slate-900">{viewCustomer.billingAddress || viewCustomer.address || viewCustomer.deliveryAddress || '—'}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">VAT No</p>
                  <p className="mt-2 font-semibold text-slate-900">{viewCustomer.vat || viewCustomer.vatNumber || '—'}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">NIC No</p>
                  <p className="mt-2 font-semibold text-slate-900">{viewCustomer.nicNo || '—'}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">TIN No</p>
                  <p className="mt-2 font-semibold text-slate-900">{viewCustomer.tinNo || '—'}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Discount %</p>
                  <p className="mt-2 font-semibold text-slate-900">{viewCustomer.discountPercentage != null ? `${viewCustomer.discountPercentage}%` : '—'}</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button onClick={() => setViewCustomer(null)} className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-300">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersList;