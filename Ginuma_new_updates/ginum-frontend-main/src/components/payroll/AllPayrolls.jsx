import React, { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiEye, FiCheckCircle, FiDollarSign, FiX, FiUser, FiCalendar, FiFileText, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import api from '../../utils/api';
import Alert from '../Alert/Alert';
import { useNavigate } from 'react-router-dom';

const AllPayrolls = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [processingId, setProcessingId] = useState(null);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [expandedEmployee, setExpandedEmployee] = useState(null);
  const navigate = useNavigate();

  const companyId = localStorage.getItem("companyId");

  const fetchPayrolls = async () => {
    try {
      if (!companyId) return;
      setLoading(true);
      const response = await api.get(`/api/companies/${companyId}/payroll`);
      setPayrolls(Array.isArray(response) ? response : []);
    } catch (e) {
      console.error(e);
      Alert.error("Error loading payrolls");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const handleViewDetails = async (payroll) => {
    try {
      // Re-fetch fresh data to ensure payrollItems are fully loaded
      const fresh = await api.get(`/api/companies/${companyId}/payroll/${payroll.id}`);
      setSelectedPayroll(fresh);
      setExpandedEmployee(null);
    } catch (e) {
      // Fallback to existing object if API fails
      console.warn('Fallback to cached payroll:', e);
      setSelectedPayroll(payroll);
      setExpandedEmployee(null);
    }
  };

  const handleApprove = async (payrollId) => {
    const result = await Alert.confirm(
      'Are you sure you want to approve this payroll?',
      'Yes, Approve',
      'Cancel'
    );
    if (!result.isConfirmed) return;
    try {
      setProcessingId(payrollId);
      await api.post(`/api/companies/${companyId}/payroll/${payrollId}/approve`);
      Alert.success("Payroll approved successfully");
      fetchPayrolls();
      if (selectedPayroll?.id === payrollId) handleViewDetails(payrollId);
    } catch (e) {
      console.error(e);
      Alert.error(e.response?.data?.error || "Error approving payroll");
    } finally {
      setProcessingId(null);
    }
  };

  const handlePay = async (payrollId) => {
    const result = await Alert.confirm(
      'Are you sure you want to mark this payroll as paid? This will create accounting entries.',
      'Yes, Mark as Paid',
      'Cancel'
    );
    if (!result.isConfirmed) return;
    try {
      setProcessingId(payrollId);
      await api.post(`/api/companies/${companyId}/payroll/${payrollId}/pay`);
      Alert.success("Payroll payment recorded successfully");
      fetchPayrolls();
      if (selectedPayroll?.id === payrollId) handleViewDetails(payrollId);
    } catch (e) {
      console.error(e);
      Alert.error(e.response?.data?.error || "Error paying payroll");
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (payrollId) => {
    const result = await Alert.confirm(
      'Are you sure you want to cancel this payroll?',
      'Yes, Cancel Payroll',
      'Keep'
    );
    if (!result.isConfirmed) return;
    try {
      setProcessingId(payrollId);
      await api.post(`/api/companies/${companyId}/payroll/${payrollId}/cancel`);
      Alert.success("Payroll cancelled successfully");
      fetchPayrolls();
      if (selectedPayroll?.id === payrollId) setSelectedPayroll(null);
    } catch (e) {
      console.error(e);
      Alert.error(e.response?.data?.error || "Error cancelling payroll");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      DRAFT: 'bg-gray-100 text-gray-800',
      APPROVED: 'bg-blue-100 text-blue-800',
      PAID: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const fmt = (val) => Number(val || 0).toFixed(2);

  const filteredPayrolls = payrolls.filter(payroll => {
    const matchesSearch = payroll.payrollNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || payroll.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center flex-col items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-500">Loading payrolls...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">

      {/* ── Header ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Payroll Management</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by payroll number..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="APPROVED">Approved</option>
            <option value="PAID">Paid</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
            onClick={() => navigate('/app/payroll/new')}
          >
            <FiPlus /> Create Payroll
          </button>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────── */}
      {filteredPayrolls.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 text-lg">
            {payrolls.length === 0 ? "No payrolls found." : "No matching payrolls found."}
          </p>
          <button
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
            onClick={() => navigate('/app/payroll/new')}
          >
            <FiPlus /> Create New Payroll
          </button>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Payroll Number', 'Pay Period', 'Payment Date', 'Employee(s)', 'Gross Pay', 'Net Pay', 'Status', 'Actions'].map(h => (
                    <th key={h} className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayrolls.map((payroll) => (
                  <tr key={payroll.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-700">
                      {payroll.payrollNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payroll.payPeriodStart} → {payroll.payPeriodEnd}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payroll.paymentDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {payroll.payrollItems?.length === 1
                        ? <span className="font-medium text-gray-800">
                          {payroll.payrollItems[0].employeeName || `Employee #${payroll.payrollItems[0].employeeId}`}
                          <span className="block text-xs text-gray-400">
                            NIC: {payroll.payrollItems[0].nic || 'N/A'}
                          </span>
                        </span>
                        : <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {payroll.payrollItems?.length || 0} employees
                        </span>
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ${fmt(payroll.totalGrossPay)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-700">
                      ${fmt(payroll.totalNetPay)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(payroll.status)}`}>
                        {payroll.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {payroll.status === 'DRAFT' && (
                          <>
                            <button className="text-green-600 hover:text-green-900 disabled:opacity-50" onClick={() => handleApprove(payroll.id)} disabled={processingId === payroll.id} title="Approve">
                              <FiCheckCircle size={18} />
                            </button>
                            <button className="text-red-600 hover:text-red-900 disabled:opacity-50" onClick={() => handleCancel(payroll.id)} disabled={processingId === payroll.id} title="Cancel">
                              <FiX size={18} />
                            </button>
                          </>
                        )}
                        {payroll.status === 'APPROVED' && (
                          <>
                            <button className="text-blue-600 hover:text-blue-900 disabled:opacity-50" onClick={() => handlePay(payroll.id)} disabled={processingId === payroll.id} title="Mark as Paid">
                              <FiDollarSign size={18} />
                            </button>
                            <button className="text-red-600 hover:text-red-900 disabled:opacity-50" onClick={() => handleCancel(payroll.id)} disabled={processingId === payroll.id} title="Cancel">
                              <FiX size={18} />
                            </button>
                          </>
                        )}
                        <button className="text-gray-600 hover:text-blue-600 transition-colors" title="View Details" onClick={() => handleViewDetails(payroll)}>
                          <FiEye size={18} />
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

      {/* ── Detail Modal ───────────────────────────── */}
      {selectedPayroll && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

            {selectedPayroll && (
              <>
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{selectedPayroll.payrollNumber}</h2>
                    <span className={`mt-1 px-2 py-0.5 inline-flex text-xs font-semibold rounded-full ${getStatusBadge(selectedPayroll.status)}`}>
                      {selectedPayroll.status}
                    </span>
                  </div>
                  <button onClick={() => setSelectedPayroll(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <FiX size={24} />
                  </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-b">
                  {[
                    { label: 'Pay Period', value: `${selectedPayroll.payPeriodStart} → ${selectedPayroll.payPeriodEnd}`, icon: <FiCalendar size={16} /> },
                    { label: 'Payment Date', value: selectedPayroll.paymentDate, icon: <FiCalendar size={16} /> },
                    { label: 'Total Gross', value: `$${fmt(selectedPayroll.totalGrossPay)}`, icon: <FiFileText size={16} />, highlight: 'text-gray-900 font-bold' },
                    { label: 'Total Net Pay', value: `$${fmt(selectedPayroll.totalNetPay)}`, icon: <FiFileText size={16} />, highlight: 'text-green-700 font-bold' },
                  ].map(card => (
                    <div key={card.label} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">{card.icon}{card.label}</div>
                      <div className={`text-sm ${card.highlight || 'text-gray-700'}`}>{card.value}</div>
                    </div>
                  ))}
                </div>

                {/* Notes */}
                {selectedPayroll.notes && (
                  <div className="px-6 pt-4">
                    <p className="text-xs text-gray-500 mb-1">Notes</p>
                    <p className="text-sm text-gray-700 bg-yellow-50 border border-yellow-200 rounded-lg p-3">{selectedPayroll.notes}</p>
                  </div>
                )}

                {/* Employee Breakdown */}
                <div className="p-6">
                  <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FiUser size={16} /> Employee Payroll Details ({selectedPayroll.payrollItems?.length || 0})
                  </h3>
                  <div className="space-y-2">
                    {(selectedPayroll.payrollItems || []).map((item, idx) => (
                      <div key={item.id || idx} className="border rounded-lg overflow-hidden">
                        {/* Employee Row */}
                        <button
                          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                          onClick={() => setExpandedEmployee(expandedEmployee === idx ? null : idx)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                              {idx + 1}
                            </div>
                            <div>
                              <p style={{ fontWeight: '700', fontSize: '15px', color: '#1e3a5f' }}>
                                {item.employeeName ? item.employeeName : `Employee #${item.employeeId}`}
                              </p>
                              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                                NIC: <span style={{ fontWeight: '600', color: '#374151' }}>{item.nic || 'N/A'}</span>
                                {' | '} ID: {item.employeeId}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 text-sm">
                            <span className="text-gray-500">Gross: <span className="font-semibold text-gray-800">${fmt(item.grossPay)}</span></span>
                            <span className="text-gray-500">Net: <span className="font-semibold text-green-700">${fmt(item.netPay)}</span></span>
                            {expandedEmployee === idx ? <FiChevronUp size={16} className="text-gray-400" /> : <FiChevronDown size={16} className="text-gray-400" />}
                          </div>
                        </button>

                        {/* Employee Detail */}
                        {expandedEmployee === idx && (
                          <div className="px-4 py-4 bg-white">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              {[
                                { label: 'Basic Salary', value: `$${fmt(item.basicSalary)}` },
                                { label: 'Allowances', value: `$${fmt(item.allowances)}` },
                                { label: 'Overtime Pay', value: `$${fmt(item.overtimePay)}` },
                                { label: 'Bonus', value: `$${fmt(item.bonus)}` },
                                { label: 'Worked Days', value: item.workedDays ?? '-' },
                                { label: 'Overtime Hours', value: item.overtimeHours ?? '-' },
                                { label: 'Total Deductions', value: `$${fmt(item.totalDeductions)}`, cls: 'text-red-600 font-semibold' },
                                { label: 'Net Pay', value: `$${fmt(item.netPay)}`, cls: 'text-green-700 font-bold' },
                              ].map(field => (
                                <div key={field.label} className="bg-gray-50 rounded p-2">
                                  <p className="text-xs text-gray-500">{field.label}</p>
                                  <p className={`text-sm font-medium ${field.cls || 'text-gray-800'}`}>{field.value}</p>
                                </div>
                              ))}
                            </div>

                            {/* Deductions */}
                            {item.deductions?.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Deductions</p>
                                <table className="w-full text-sm border rounded overflow-hidden">
                                  <thead className="bg-red-50">
                                    <tr>
                                      <th className="text-left px-3 py-2 text-xs text-gray-600">Type</th>
                                      <th className="text-left px-3 py-2 text-xs text-gray-600">Description</th>
                                      <th className="text-right px-3 py-2 text-xs text-gray-600">Amount</th>
                                      <th className="text-center px-3 py-2 text-xs text-gray-600">Mandatory</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {item.deductions.map((d, di) => (
                                      <tr key={di}>
                                        <td className="px-3 py-2 font-medium">{d.deductionType}</td>
                                        <td className="px-3 py-2 text-gray-500">{d.description || '-'}</td>
                                        <td className="px-3 py-2 text-right text-red-600">${fmt(d.amount)}</td>
                                        <td className="px-3 py-2 text-center">{d.mandatory ? '✅' : '-'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
                  <div className="text-sm text-gray-500">
                    {selectedPayroll.createdBy && <span>Created by: <strong>{selectedPayroll.createdBy}</strong></span>}
                    {selectedPayroll.approvedBy && <span className="ml-4">Approved by: <strong>{selectedPayroll.approvedBy}</strong></span>}
                  </div>
                  <div className="flex gap-2">
                    {selectedPayroll.status === 'DRAFT' && (
                      <>
                        <button onClick={() => handleApprove(selectedPayroll.id)} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center gap-1">
                          <FiCheckCircle size={15} /> Approve
                        </button>
                        <button onClick={() => handleCancel(selectedPayroll.id)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors">
                          Cancel
                        </button>
                      </>
                    )}
                    {selectedPayroll.status === 'APPROVED' && (
                      <button onClick={() => handlePay(selectedPayroll.id)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1">
                        <FiDollarSign size={15} /> Mark as Paid
                      </button>
                    )}
                    <button onClick={() => setSelectedPayroll(null)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors">
                      Close
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AllPayrolls;
