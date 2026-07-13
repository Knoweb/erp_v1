import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import Alert from "../Alert/Alert";
import { FaHistory, FaEye, FaSearch, FaTimes, FaPrint, FaUniversity } from "react-icons/fa";

function BankReconciliationHistory() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const companyId = localStorage.getItem("companyId");
      if (!companyId) return;

      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get(`/api/companies/${companyId}/reports/bank-reconciliation/history`, { params });
      const data = response.data || response;
      setHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching reconciliation history:", error);
      Alert.error("Failed to load bank reconciliation history");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [startDate, endDate]);

  const handleView = async (id) => {
    try {
      setIsModalOpen(true);
      setIsModalLoading(true);
      const companyId = localStorage.getItem("companyId");
      const response = await api.get(`/api/companies/${companyId}/reports/bank-reconciliation/history/${id}`);
      setModalData(response.data || response);
    } catch (error) {
      console.error("Error fetching reconciliation details:", error);
      Alert.error("Failed to load details");
      setIsModalOpen(false);
    } finally {
      setIsModalLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
    <div className="max-w-6xl mx-auto p-4 sm:p-6 my-4 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <FaHistory className="text-blue-600 mr-3" />
          Reconciliation History
        </h2>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600 font-medium">From:</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600 font-medium">To:</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button 
            onClick={fetchHistory}
            className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 text-gray-700 transition flex items-center">
            <FaSearch className="mr-2 text-xs" /> Filter
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reconciliation Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Account Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statement Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Statement Balance</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3">Loading history...</span>
                    </div>
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <FaHistory className="text-4xl text-gray-300 mb-3" />
                      <p className="text-lg font-medium text-gray-600">No reconciliation history found</p>
                      <p className="text-sm text-gray-400 mt-1">Completed reconciliations will appear here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                history.map((record) => (
                  <tr key={record.historyId} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.reconciliationDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {record.accountName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {record.statementDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      Rs. {record.statementBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button 
                        onClick={() => handleView(record.historyId)}
                        className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition inline-flex items-center justify-center group"
                        title="View Details"
                      >
                        <FaEye className="group-hover:scale-110 transition-transform" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
      
      {/* Detail Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 print:p-0 print:bg-white print:absolute print:inset-0">
          {/* Inject print styles */}
          <style>
            {`
              @media print {
                body * {
                  visibility: hidden;
                }
                #reconciliation-print-area, #reconciliation-print-area * {
                  visibility: visible;
                }
                #reconciliation-print-area {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                }
                .no-print {
                  display: none !important;
                }
              }
            `}
          </style>

          <div id="reconciliation-print-area" className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden print:shadow-none print:w-full print:max-w-full print:h-auto print:overflow-visible">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 print:bg-white">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <FaUniversity className="text-blue-600 mr-2" />
                Reconciliation Details
              </h3>
              <div className="flex items-center space-x-2 no-print">
                <button 
                  onClick={handlePrint}
                  disabled={isModalLoading}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-50"
                  title="Print Report"
                >
                  <FaPrint />
                </button>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 print:overflow-visible">
              {isModalLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                  <span className="text-gray-500 font-medium">Loading details...</span>
                </div>
              ) : modalData ? (
                <div className="space-y-8">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Account</span>
                      <span className="text-lg font-bold text-gray-900">{modalData.accountName}</span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Statement Date</span>
                      <span className="text-lg font-bold text-gray-900">{modalData.statementDate}</span>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                      <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1 block">Statement Balance</span>
                      <span className="text-xl font-bold text-blue-800">
                        Rs. {modalData.statementBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Transactions Table */}
                  <div>
                    <h4 className="text-base font-bold text-gray-800 mb-4 border-b pb-2">Reconciled Transactions</h4>
                    <div className="overflow-x-auto border border-gray-200 rounded-xl">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-xs font-semibold text-gray-600">Date</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-600">Description / Ref</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-600 text-right">Withdrawal</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-600 text-right">Deposit</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {modalData.transactions?.map(tx => (
                            <tr key={tx.transactionId} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-700">{tx.date}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                {tx.description} 
                                {tx.referenceNo && <span className="text-gray-500 text-xs ml-1">({tx.referenceNo})</span>}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700 text-right">
                                {tx.type === 'withdrawal' ? `Rs. ${tx.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700 text-right">
                                {tx.type === 'deposit' ? `Rs. ${tx.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-'}
                              </td>
                            </tr>
                          ))}
                          {(!modalData.transactions || modalData.transactions.length === 0) && (
                            <tr>
                              <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                                No transactions found for this reconciliation.
                              </td>
                            </tr>
                          )}
                        </tbody>
                        <tfoot className="bg-gray-50 font-bold border-t border-gray-200">
                          <tr>
                            <td colSpan="2" className="px-4 py-3 text-right text-gray-800">Cleared Totals:</td>
                            <td className="px-4 py-3 text-right text-gray-800">
                              Rs. {modalData.transactions?.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + t.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-800">
                              Rs. {modalData.transactions?.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-red-500 py-8">Failed to load data</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default BankReconciliationHistory;
