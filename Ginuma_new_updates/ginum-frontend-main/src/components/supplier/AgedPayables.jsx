import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import Alert from '../../components/Alert/Alert';

export default function AgedPayables() {
  const [payables, setPayables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

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

  const filterData = (data) => {
    let filteredData = data;

    if (searchQuery) {
      filteredData = filteredData.filter((row) =>
        row.supplier?.supplierName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.poNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (dateRange) {
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

  const filteredData = filterData(payables);
  const paginatedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleExport = () => {
    Alert.info('Export functionality coming soon!');
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
          placeholder="Search supplier or PO..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border rounded-md shadow-sm w-full md:w-1/3"
        />
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

        <button
          onClick={handleExport}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition-colors text-white rounded-md w-full md:w-auto"
        >
          Export
        </button>

        <div className="flex space-x-2 md:ml-auto w-full md:w-auto justify-end">
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 transition-colors text-white rounded-md">Pay Bill</button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-x-auto border border-gray-100">
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
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">${Math.max(0, notDueYet).toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium">${row.bucket0to30?.toFixed(2) || '0.00'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-500 font-medium">${row.bucket31to60?.toFixed(2) || '0.00'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-medium">${row.bucket61to90?.toFixed(2) || '0.00'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-bold">${row.bucket91plus?.toFixed(2) || '0.00'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">${row.balanceDue?.toFixed(2) || '0.00'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
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