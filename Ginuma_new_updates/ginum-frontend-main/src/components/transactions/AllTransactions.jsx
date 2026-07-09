import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import Alert from "../Alert/Alert";
import { X } from "lucide-react";

const AllTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState(null);
  const navigate = useNavigate();
  const companyId = localStorage.getItem("companyId");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await api.get(`/api/companies/${companyId}/journal-entries`);
        // Expected data is an array of JournalEntry objects
        setTransactions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        Alert.error("Failed to load transactions.");
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchTransactions();
    }
  }, [companyId]);

  const calculateTotal = (lines) => {
    return lines
      .filter((line) => line.debit)
      .reduce((sum, line) => sum + line.amount, 0)
      .toFixed(2);
  };

  return (
    <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-6 my-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">All Transactions</h2>
        <button
          onClick={() => navigate("/app/transactions/new")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Create Transaction
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-500 italic">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 cursor-pointer transition duration-150" onClick={() => setSelectedTx(tx)}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tx.entryDate ? new Date(tx.entryDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {tx.referenceNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        tx.entryType === 'MANUAL' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {tx.entryType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                      {tx.description || tx.journalTitle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                      Rs. {calculateTotal(tx.journalEntryLines || [])}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">Transaction Details</h3>
              <button 
                onClick={() => setSelectedTx(null)}
                className="text-gray-400 hover:text-gray-600 transition duration-150"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4 mb-8 bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div>
                  <p className="text-xs text-blue-500 uppercase font-semibold mb-1">Reference</p>
                  <p className="text-lg font-bold text-blue-900">{selectedTx.referenceNo}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-500 uppercase font-semibold mb-1">Date</p>
                  <p className="text-lg font-bold text-blue-900">
                    {selectedTx.entryDate ? new Date(selectedTx.entryDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-500 uppercase font-semibold mb-1">Type</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    selectedTx.entryType === 'MANUAL' ? 'bg-purple-200 text-purple-800' : 'bg-white text-blue-800 border border-blue-200'
                  }`}>
                    {selectedTx.entryType}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-blue-500 uppercase font-semibold mb-1">Total Amount</p>
                  <p className="text-lg font-bold text-blue-900">Rs. {calculateTotal(selectedTx.journalEntryLines || [])}</p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-md font-bold text-gray-700 mb-3 border-b pb-2">Journal Entries</h4>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Account</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Debit (Rs)</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Credit (Rs)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedTx.journalEntryLines && selectedTx.journalEntryLines.length > 0 ? (
                        selectedTx.journalEntryLines.map((line, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {line.account?.name || 'Unknown Account'}
                              <span className="block text-xs text-gray-400 font-normal">{line.account?.accountCode}</span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">{line.description || '-'}</td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                              {line.debit ? line.amount?.toFixed(2) : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                              {!line.debit ? line.amount?.toFixed(2) : '-'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-4 py-6 text-center text-gray-500 text-sm">No entries found</td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-gray-50 font-bold border-t border-gray-200">
                      <tr>
                        <td colSpan="2" className="px-4 py-3 text-right text-sm text-gray-700">Total:</td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900">
                          {selectedTx.journalEntryLines?.filter(l => l.debit).reduce((sum, l) => sum + l.amount, 0).toFixed(2) || '0.00'}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900">
                          {selectedTx.journalEntryLines?.filter(l => !l.debit).reduce((sum, l) => sum + l.amount, 0).toFixed(2) || '0.00'}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {selectedTx.description && (
                <div className="mt-6">
                  <h4 className="text-sm font-bold text-gray-700 mb-2">Notes</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-100">{selectedTx.description}</p>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setSelectedTx(null)}
                className="px-5 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
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

export default AllTransactions;
