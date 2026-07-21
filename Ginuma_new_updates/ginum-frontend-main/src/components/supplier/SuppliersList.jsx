import React, { useState, useEffect } from 'react';
import { FiSearch, FiUser, FiPhone, FiMail, FiChevronDown, FiChevronUp, FiFileText, FiEye, FiX, FiShield } from 'react-icons/fi';
import { fetchCompanySuppliers } from '../../utils/supplierApi';
import api from '../../utils/api';
import Alert from '../../components/Alert/Alert';
import { useNavigate } from 'react-router-dom';

const SuppliersList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [productMap, setProductMap] = useState({});
  const [supplierPOsMap, setSupplierPOsMap] = useState({});
  const [loadingPOsMap, setLoadingPOsMap] = useState({});
  const [expandedSuppliers, setExpandedSuppliers] = useState({});
  const [selectedPO, setSelectedPO] = useState(null);
  const [viewSupplier, setViewSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const companyId = localStorage.getItem("companyId");
  const token = localStorage.getItem("auth_token");

  const getPOTotal = (po) => {
    if (po.items && po.items.length > 0) {
      return po.items.reduce((sum, item) => {
        const receivedQty = item.receivedQuantity !== undefined ? item.receivedQuantity : (item.received_quantity !== undefined ? item.received_quantity : undefined);
        const hasReceived = receivedQty !== undefined;
        const returnedQty = item.returnedQuantity !== undefined ? item.returnedQuantity : (item.returned_quantity !== undefined ? item.returned_quantity : 0);
        const netQty = hasReceived ? (receivedQty - returnedQty) : item.quantity;
        const unitPrice = item.unitPrice !== undefined ? item.unitPrice : (item.price !== undefined ? item.price : 0);
        return sum + (netQty * unitPrice);
      }, 0);
    }
    return po.projectedTotal !== undefined ? po.projectedTotal : (po.totalAmount !== undefined ? po.totalAmount : 0);
  };

  const fetchSuppliers = async () => {
    try {
      if (!companyId || !token) {
        throw new Error("Missing company ID or auth token");
      }
      setLoading(true);
      
      const [suppliersData, productsData] = await Promise.all([
        fetchCompanySuppliers(companyId, token),
        api.get(`/api/finance/external/inventory-products/${companyId}`).catch(() => [])
      ]);

      setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);

      const pMap = {};
      if (Array.isArray(productsData)) {
        productsData.forEach(p => {
          pMap[p.id] = p.name;
        });
      }
      setProductMap(pMap);
    } catch (e) {
      console.error(e);
      Alert.error("Error loading suppliers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const toggleExpand = async (supplierId) => {
    const isExpanded = !expandedSuppliers[supplierId];
    setExpandedSuppliers(prev => ({
      ...prev,
      [supplierId]: isExpanded
    }));

    if (isExpanded && !supplierPOsMap[supplierId]) {
      try {
        setLoadingPOsMap(prev => ({ ...prev, [supplierId]: true }));
        const data = await api.get(`/api/finance/external/inventory-pos/${supplierId}`);
        setSupplierPOsMap(prev => ({
          ...prev,
          [supplierId]: Array.isArray(data) ? data : []
        }));
      } catch (err) {
        console.error("Error loading external POs:", err);
        setSupplierPOsMap(prev => ({
          ...prev,
          [supplierId]: []
        }));
      } finally {
        setLoadingPOsMap(prev => ({ ...prev, [supplierId]: false }));
      }
    }
  };

  const filteredSuppliers = suppliers.filter(s =>
    (s.supplierName && s.supplierName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.mobileNo && s.mobileNo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex justify-center flex-col items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-500">Loading suppliers...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Suppliers</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search suppliers..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {filteredSuppliers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 text-lg">
            {suppliers.length === 0 ? "No suppliers found." : "No matching suppliers found."}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Orders</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSuppliers.map((supplier) => {
                  const isExpanded = !!expandedSuppliers[supplier.id];

                  return (
                    <React.Fragment key={supplier.id}>
                      <tr className="hover:bg-gray-50 group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                              <FiUser size={20} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{supplier.supplierName || '-'}</div>
                              {supplier.address ? (
                                <div className="text-sm text-gray-500">{supplier.address}</div>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="text-sm text-gray-900 flex items-center gap-2">
                              <FiPhone className="text-gray-400" />
                              <span>{supplier.mobileNo || '-'}</span>
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                              <FiMail className="text-gray-400" />
                              <span>{supplier.email || '-'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleExpand(supplier.id)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-semibold transition-colors"
                          >
                            <span>Purchase Orders</span>
                            {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => setViewSupplier(supplier)}
                            className="inline-flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 hover:text-indigo-600 active:scale-95"
                          >
                            <FiEye className="text-slate-400 group-hover:text-indigo-500" />
                            View Details
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={4} className="px-8 py-4 bg-gray-50/50">
                            {loadingPOsMap[supplier.id] ? (
                              <div className="flex justify-center items-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                              </div>
                            ) : !supplierPOsMap[supplier.id] || supplierPOsMap[supplier.id].length === 0 ? (
                              <div className="text-center py-4 text-gray-500 text-sm italic">
                                No purchase orders found for this supplier in inventory.
                              </div>
                            ) : (
                              <div className="border border-gray-100 rounded-lg overflow-hidden bg-white shadow-sm">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">PO Number</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created Date</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {supplierPOsMap[supplier.id].map(po => (
                                      <tr key={po.id} className="hover:bg-gray-50/80">
                                        <td className="px-4 py-2.5 whitespace-nowrap text-sm font-medium text-blue-600 flex items-center gap-1.5">
                                          <FiFileText className="text-gray-400" />
                                          <span>{`PO-${String(po.id).padStart(3, '0')}`}</span>
                                        </td>
                                        <td className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-500">
                                          {po.createdAt ? new Date(po.createdAt).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-4 py-2.5 whitespace-nowrap text-sm font-bold text-gray-900">
                                          Rs. {Number(getPOTotal(po)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-4 py-2.5 whitespace-nowrap">
                                          <span className={`px-2 inline-flex text-[10px] leading-4 font-semibold rounded-full ${
                                            po.status === 'APPROVED' || po.status === 'RECEIVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                          }`}>
                                            {po.status}
                                          </span>
                                        </td>
                                        <td className="px-4 py-2.5 whitespace-nowrap text-right text-xs">
                                          <button
                                            onClick={() => setSelectedPO(po)}
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
      {/* Supplier Profile Modal */}
      {viewSupplier && (
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
                    <h3 className="mt-1 text-2xl font-black tracking-tight">{viewSupplier.supplierName || 'Unnamed supplier'}</h3>
                    <p className="mt-1 text-sm text-slate-400">Detailed overview of the selected master data record.</p>
                  </div>
                </div>
                <button onClick={() => setViewSupplier(null)} className="rounded-xl bg-white/5 p-2.5 text-slate-400 transition-all hover:bg-white/10 hover:text-white" aria-label="Close">
                  <FiX size={20} />
                </button>
              </div>
            </div>

            <div className="p-8">
              <div className="mb-8 flex flex-wrap gap-3">
                <span className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-slate-500 border border-slate-200">
                  <FiShield size={14} className="mr-2" /> Master File
                </span>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 text-sm">
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Primary Email</p>
                  <p className="font-bold text-slate-900 break-all">{viewSupplier.email || '—'}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Phone Number</p>
                  <p className="font-bold text-slate-900">{viewSupplier.mobileNo || viewSupplier.phoneNumber || viewSupplier.phone || '—'}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5 sm:col-span-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Registered Address</p>
                  <p className="font-bold text-slate-900 leading-relaxed">{viewSupplier.address || '—'}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Tax Registration (VAT)</p>
                  <p className="font-bold text-emerald-700">
                    {viewSupplier.vatNumber || viewSupplier.vat || 'Not Registered'}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Identity Number / TIN</p>
                  <p className="font-bold text-slate-900">{viewSupplier.tinNo || viewSupplier.tin || viewSupplier.nicNo || '—'}</p>
                </div>
                {viewSupplier.contactInfo && Object.keys(viewSupplier.contactInfo).length > 0 && (
                  <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Contact Info</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {Object.entries(viewSupplier.contactInfo).map(([key, value]) => (
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
                <button onClick={() => setViewSupplier(null)} className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-300">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedPO && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Purchase Order Details</h2>
              <button 
                className="text-slate-400 hover:text-slate-600 text-2xl" 
                onClick={() => setSelectedPO(null)}
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 block">PO Number</span>
                  <span className="font-bold text-slate-800">{`PO-${String(selectedPO.id).padStart(3, '0')}`}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Status</span>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                    selectedPO.status === 'APPROVED' || selectedPO.status === 'RECEIVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedPO.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Created At</span>
                  <span className="font-semibold text-slate-700">
                    {selectedPO.createdAt ? new Date(selectedPO.createdAt).toLocaleDateString() : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Total Amount</span>
                  <span className="font-bold text-indigo-600">
                    Rs. {Number(getPOTotal(selectedPO)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
                        <th className="px-4 py-2 text-center text-xs font-bold text-slate-500">Ordered</th>
                        <th className="px-4 py-2 text-center text-xs font-bold text-slate-500">Received</th>
                        <th className="px-4 py-2 text-center text-xs font-bold text-slate-500">Returned</th>
                        <th className="px-4 py-2 text-center text-xs font-bold text-slate-500">Net Qty</th>
                        <th className="px-4 py-2 text-right text-xs font-bold text-slate-500">Unit Price</th>
                        <th className="px-4 py-2 text-right text-xs font-bold text-slate-500">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedPO.items?.map((item, idx) => {
                        const productName = productMap[item.productId] || `Product #${item.productId}`;
                        const hasReceived = item.receivedQuantity !== undefined;
                        const netQty = hasReceived ? (item.receivedQuantity - (item.returnedQuantity || 0)) : item.quantity;
                        const total = netQty * (item.unitPrice || 0);
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="px-4 py-2 text-slate-700 font-medium">{productName}</td>
                            <td className="px-4 py-2 text-center text-slate-700">{item.quantity}</td>
                            <td className="px-4 py-2 text-center text-emerald-600">{hasReceived ? item.receivedQuantity : '-'}</td>
                            <td className="px-4 py-2 text-center text-rose-600">{item.returnedQuantity || 0}</td>
                            <td className="px-4 py-2 text-center text-blue-600">{hasReceived ? netQty : item.quantity}</td>
                            <td className="px-4 py-2 text-right text-slate-700">Rs. {Number(item.unitPrice || 0).toFixed(2)}</td>
                            <td className="px-4 py-2 text-right font-semibold text-slate-900">Rs. {total.toFixed(2)}</td>
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
                onClick={() => setSelectedPO(null)}
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

export default SuppliersList;
