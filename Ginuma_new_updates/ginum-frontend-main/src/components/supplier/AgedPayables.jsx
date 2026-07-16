import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Alert from '../../components/Alert/Alert';

export default function AgedPayables() {
  const navigate = useNavigate();
  const [payables, setPayables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const [activeTab, setActiveTab] = useState('outstanding'); // 'outstanding' or 'history'
  const [historyData, setHistoryData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const companyId = localStorage.getItem("companyId");
  const token = localStorage.getItem("auth_token");

  useEffect(() => {
    const fetchPayables = async () => {
      try {
        if (!companyId || !token) return;
        setLoading(true);
        const data = await api.get(`/api/companies/${companyId}/aged-payables`);
        setPayables(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching aged payables:", err);
        Alert.error("Error fetching aged payables");
      } finally {
        setLoading(false);
      }
    };
    fetchPayables();
  }, [companyId, token]);

  useEffect(() => {
    if (activeTab === 'history') {
      const fetchHistory = async () => {
        try {
          if (!companyId) return;
          setLoadingHistory(true);
          const data = await api.get(`/api/${companyId}/purchase-orders/payment-history`);
          setHistoryData(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Error fetching payment history:", err);
          Alert.error("Error fetching payment history");
        } finally {
          setLoadingHistory(false);
        }
      };
      fetchHistory();
    }
  }, [activeTab, companyId]);

  const filterData = (data) => {
    let filteredData = data;

    if (searchQuery) {
      filteredData = filteredData.filter((row) => {
        if (activeTab === 'history') {
          return row.supplierName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 row.poNumber?.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return row.supplier?.supplierName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
               row.poNumber?.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    if (dateRange && activeTab !== 'history') {
      const today = new Date();
      filteredData = filteredData.filter((row) => {
        const dueDate = new Date(row.dueDate);
        switch (dateRange) {
          case 'last30':
            const last30Days = new Date(today.setDate(today.getDate() - 30));
            return dueDate >= last30Days;
          case 'thisMonth':
            return dueDate.getMonth() === today.getMonth() && dueDate.getFullYear() === today.getFullYear();
          case 'lastMonth':
            const lastMonth = new Date(today.setMonth(today.getMonth() - 1));
            return (
              dueDate.getMonth() === lastMonth.getMonth() && dueDate.getFullYear() === lastMonth.getFullYear()
            );
          default:
            return true;
        }
      });
    }

    return filteredData;
  };

  const filteredData = filterData(activeTab === 'outstanding' ? payables : historyData);
  const paginatedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleExport = () => {
    if (!filteredData || filteredData.length === 0) {
      Alert.warning("No data to export.");
      return;
    }

    let csvContent = "";
    const safeString = (str) => str ? `"${String(str).replace(/"/g, '""')}"` : '""';
    
    if (activeTab === 'outstanding') {
      csvContent += "Supplier,PO #,Due Date,Not Due Yet,1-30 Days,31-60 Days,61-90 Days,91+ Days,Total Balance\n";
      
      filteredData.forEach(row => {
        const notDueYet = row.balanceDue - (row.bucket0to30 + row.bucket31to60 + row.bucket61to90 + row.bucket91plus);
        
        const rowString = [
          safeString(row.supplier?.supplierName || "Unknown"),
          safeString(row.poNumber),
          safeString(row.dueDate),
          Math.max(0, notDueYet).toFixed(2),
          (row.bucket0to30 || 0).toFixed(2),
          (row.bucket31to60 || 0).toFixed(2),
          (row.bucket61to90 || 0).toFixed(2),
          (row.bucket91plus || 0).toFixed(2),
          (row.balanceDue || 0).toFixed(2)
        ].join(",");
        
        csvContent += rowString + "\n";
      });
    } else {
      csvContent += "Payment Date,PO # / Ref,Supplier,Description,Invoice Ref #,Amount Paid\n";
      
      filteredData.forEach(row => {
        const poOrRef = row.poNumber && row.poNumber !== 'N/A' ? row.poNumber : (row.referenceNo || 'N/A');
        
        const rowString = [
          safeString(row.date),
          safeString(poOrRef),
          safeString(row.supplierName || 'N/A'),
          safeString(row.description),
          safeString(row.referenceNo || 'N/A'),
          parseFloat(row.amount || 0).toFixed(2)
        ].join(",");
        
        csvContent += rowString + "\n";
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `aged_payables_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    Alert.success("Export successful!");
  };

  const handlePayBill = (row) => {
    if (!row) {
      Alert.info("Please select a specific bill from the list to pay.");
      return;
    }
    
    // Redirect to Spend Money with pre-filled details
    const params = new URLSearchParams({
      amount: row.balanceDue,
      payeeId: row.supplier?.id,
      payeeType: 'SUPPLIER',
      purchaseOrderId: row.purchaseOrderId, // Pass the actual purchase order database ID
      description: `Payment for PO: ${row.poNumber}`
    });
    
    navigate(`/app/bank/spend-money?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center flex-col items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-500">Loading aged payables...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 container mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800">Aged Payables (Outstanding Payments)</h1>

      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4 items-center bg-white p-4 rounded-lg shadow-sm">
        <input
          type="text"
          placeholder={activeTab === 'outstanding' ? "Search supplier or PO..." : "Search by Supplier or PO..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border rounded-md shadow-sm w-full md:w-1/3"
        />
        {activeTab === 'outstanding' && (
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border rounded-md shadow-sm w-full md:w-auto"
          >
            <option value="">All Due Dates</option>
            <option value="last30">Last 30 Days</option>
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
          </select>
        )}

        <button
          onClick={handleExport}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition-colors text-white rounded-md w-full md:w-auto"
        >
          Export
        </button>

        {activeTab === 'outstanding' && (
          <div className="flex space-x-2 md:ml-auto w-full md:w-auto justify-end">
            <button 
              onClick={() => handlePayBill(paginatedData[0])}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 transition-colors text-white rounded-md"
            >
              Pay Bill
            </button>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          className={`px-4 py-2 text-sm font-medium transition-all ${activeTab === 'outstanding' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
          onClick={() => { setActiveTab('outstanding'); setPage(1); setSearchQuery(''); }}
        >
          Outstanding Bills
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-all ${activeTab === 'history' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
          onClick={() => { setActiveTab('history'); setPage(1); setSearchQuery(''); }}
        >
          Payment History
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-x-auto border border-gray-100">
        {activeTab === 'outstanding' ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Supplier</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">PO #</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Due Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Not Due Yet</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">1–30 Days</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">31–60 Days</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">61–90 Days</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">91+ Days</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Total Balance</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-6 py-8 text-center text-gray-500">
                    {payables.length === 0 ? "No aged payables found." : "No payables match your filters."}
                  </td>
                </tr>
              ) : paginatedData.map((row) => {
                const notDueYet = row.balanceDue - (row.bucket0to30 + row.bucket31to60 + row.bucket61to90 + row.bucket91plus);
                return (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.supplier?.supplierName || "Unknown"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">{row.poNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{row.dueDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">Rs. {Math.max(0, notDueYet).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium">Rs. {row.bucket0to30?.toFixed(2) || '0.00'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-500 font-medium">Rs. {row.bucket31to60?.toFixed(2) || '0.00'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-medium">Rs. {row.bucket61to90?.toFixed(2) || '0.00'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-bold">Rs. {row.bucket91plus?.toFixed(2) || '0.00'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">Rs. {row.balanceDue?.toFixed(2) || '0.00'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        onClick={() => handlePayBill(row)}
                        className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors text-xs font-bold"
                      >
                        Pay
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Payment Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">PO # / Ref</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Supplier</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Invoice Ref #</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Amount Paid</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loadingHistory ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">Loading history...</td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No payment history found.</td>
                </tr>
              ) : paginatedData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{row.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                    {row.poNumber && row.poNumber !== 'N/A' ? row.poNumber : (row.referenceNo || 'N/A')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{row.supplierName || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{row.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.referenceNo || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-bold">Rs. {parseFloat(row.amount || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <div className="text-sm text-gray-600 block w-full text-center sm:text-left sm:w-auto">
          Showing page <span className="font-semibold">{page}</span> of {Math.max(1, Math.ceil(filteredData.length / itemsPerPage))}
        </div>
        <div className="flex justify-center w-full sm:w-auto mt-4 sm:mt-0 space-x-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 bg-gray-100 disabled:opacity-50 text-gray-700 rounded border hover:bg-gray-200 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page * itemsPerPage >= filteredData.length}
            className="px-3 py-1 bg-gray-100 disabled:opacity-50 text-gray-700 rounded border hover:bg-gray-200 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}