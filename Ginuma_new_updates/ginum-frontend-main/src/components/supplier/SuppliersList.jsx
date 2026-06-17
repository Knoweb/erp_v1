import React, { useState, useEffect } from 'react';
import { FiSearch, FiUser, FiPhone, FiMail, FiChevronDown, FiChevronUp, FiFileText, FiEye } from 'react-icons/fi';
import { fetchCompanySuppliers } from '../../utils/supplierApi';
import api from '../../utils/api';
import Alert from '../../components/Alert/Alert';
import { useNavigate } from 'react-router-dom';

const SuppliersList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [expandedSuppliers, setExpandedSuppliers] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const companyId = localStorage.getItem("companyId");
  const token = localStorage.getItem("auth_token");

  const fetchSuppliers = async () => {
    try {
      if (!companyId || !token) {
        throw new Error("Missing company ID or auth token");
      }
      setLoading(true);
      const [suppliersData, posData] = await Promise.all([
        fetchCompanySuppliers(companyId, token),
        api.get(`/api/${companyId}/purchase-orders`).catch(() => [])
      ]);
      setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);
      setPurchaseOrders(Array.isArray(posData) ? posData : []);
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

  const toggleExpand = (supplierId) => {
    setExpandedSuppliers(prev => ({
      ...prev,
      [supplierId]: !prev[supplierId]
    }));
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSuppliers.map((supplier) => {
                  const supplierPOs = purchaseOrders.filter(po => po.supplierId === supplier.id);
                  const isExpanded = !!expandedSuppliers[supplier.id];

                  return (
                    <React.Fragment key={supplier.id}>
                      <tr className="hover:bg-gray-50">
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
                          {supplierPOs.length > 0 ? (
                            <button
                              onClick={() => toggleExpand(supplier.id)}
                              className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-semibold transition-colors"
                            >
                              <span>{supplierPOs.length} POs</span>
                              {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                            </button>
                          ) : (
                            <span className="text-gray-400 text-sm italic">No POs found</span>
                          )}
                        </td>
                      </tr>
                      {isExpanded && supplierPOs.length > 0 && (
                        <tr>
                          <td colSpan={3} className="px-8 py-4 bg-gray-50/50">
                            <div className="border border-gray-100 rounded-lg overflow-hidden bg-white shadow-sm">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">PO / Invoice #</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Issue Date</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {supplierPOs.map(po => (
                                    <tr key={po.id} className="hover:bg-gray-50/80">
                                      <td className="px-4 py-2.5 whitespace-nowrap text-sm font-medium text-blue-600 flex items-center gap-1.5">
                                        <FiFileText className="text-gray-400" />
                                        <span>{po.supplierInvoiceNumber}</span>
                                      </td>
                                      <td className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-500">
                                        {po.issueDate}
                                      </td>
                                      <td className="px-4 py-2.5 whitespace-nowrap text-sm font-bold text-gray-900">
                                        Rs. {po.total?.toFixed(2) || '0.00'}
                                      </td>
                                      <td className="px-4 py-2.5 whitespace-nowrap">
                                        {po.balanceDue <= 0 ? (
                                          <span className="px-2 inline-flex text-[10px] leading-4 font-semibold rounded-full bg-green-100 text-green-800">Paid</span>
                                        ) : po.balanceDue < po.total ? (
                                          <span className="px-2 inline-flex text-[10px] leading-4 font-semibold rounded-full bg-yellow-100 text-yellow-800">Partially Paid</span>
                                        ) : (
                                          <span className="px-2 inline-flex text-[10px] leading-4 font-semibold rounded-full bg-red-100 text-red-800">Unpaid</span>
                                        )}
                                      </td>
                                      <td className="px-4 py-2.5 whitespace-nowrap text-right text-xs">
                                        <button
                                          onClick={() => navigate(`/app/supplier/purchase/${po.id}`)}
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
    </div>
  );
};

export default SuppliersList;
