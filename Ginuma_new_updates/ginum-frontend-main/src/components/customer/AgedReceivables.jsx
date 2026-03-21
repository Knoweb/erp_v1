import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Alert from '../../components/Alert/Alert';

export default function AgedReceivables() {
  const [receivableDetailData, setReceivableDetailData] = useState([]);
  const [receivableSummaryData, setReceivableSummaryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('summary');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchAgedReceivables = async () => {
      try {
        const companyId = localStorage.getItem("companyId");
        if (!companyId) return;

        setLoading(true);
        const response = await api.get(`/api/aged-receivables/companies/${companyId}`);
        const details = Array.isArray(response) ? response : [];
        setReceivableDetailData(details);

        // Group into summary data by customer
        const summaryMap = {};
        details.forEach(item => {
          if (!summaryMap[item.customer]) {
            summaryMap[item.customer] = {
              customer: item.customer,
              notDueYet: 0,
              age1: 0,
              age2: 0,
              age3: 0,
              total: 0
            };
          }
          summaryMap[item.customer].notDueYet += parseFloat(item.notDueYet) || 0;
          summaryMap[item.customer].age1 += parseFloat(item.age1) || 0;
          summaryMap[item.customer].age2 += parseFloat(item.age2) || 0;
          summaryMap[item.customer].age3 += parseFloat(item.age3) || 0;
          summaryMap[item.customer].total += parseFloat(item.total) || 0;
        });

        // Format numbers back to strings or keep as numbers (changing rendering below if needed)
        // Here we format them as numbers
        setReceivableSummaryData(Object.values(summaryMap));
      } catch (err) {
        console.error("Error fetching aged receivables:", err);
        setError("Failed to load aged receivables data.");
        Alert.error("Failed to load aged receivables data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAgedReceivables();
  }, []);

  // Filter data based on search query and date range
  const filterData = (data) => {
    let filteredData = data;

    // Search by customer
    if (searchQuery) {
      filteredData = filteredData.filter((row) =>
        row.customer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Date range filtering
    if (dateRange) {
      const today = new Date();
      filteredData = filteredData.filter((row) => {
        const invoiceDate = new Date(row.invoiceDate);
        switch (dateRange) {
          case 'last30':
            const last30Days = new Date(today.setDate(today.getDate() - 30));
            return invoiceDate >= last30Days;
          case 'thisMonth':
            return invoiceDate.getMonth() === today.getMonth() && invoiceDate.getFullYear() === today.getFullYear();
          case 'lastMonth':
            const lastMonth = new Date(today.setMonth(today.getMonth() - 1));
            return (
              invoiceDate.getMonth() === lastMonth.getMonth() && invoiceDate.getFullYear() === lastMonth.getFullYear()
            );
          default:
            return true;
        }
      });
    }

    return filteredData;
  };

  const handleExport = () => {
    const dataToExport = activeTab === 'summary' ? receivableSummaryData : receivableDetailData;
    if (!dataToExport || dataToExport.length === 0) {
      Alert.error("No data to export");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    // headers
    const headers = Object.keys(dataToExport[0]).join(",");
    csvContent += headers + "\r\n";
    // rows
    dataToExport.forEach(row => {
      const values = Object.values(row).map(val => `"${val}"`).join(",");
      csvContent += values + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `aged_receivables_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDateRangeChange = (e) => {
    setDateRange(e.target.value);
  };

  const handlePaginationChange = (newPage) => {
    setPage(newPage);
  };

  // Paginate the filtered data
  const paginatedData = filterData(activeTab === 'summary' ? receivableSummaryData : receivableDetailData)
    .slice((page - 1) * itemsPerPage, page * itemsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center flex-col items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-500">Loading aged receivables...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Aged Receivables</h1>

      {/* Filters and Buttons */}
      <div className="flex space-x-4 items-center mb-4">
        <input
          type="text"
          placeholder="Search by Customer"
          value={searchQuery}
          onChange={handleSearch}
          className="px-4 py-2 border rounded-md shadow-sm w-1/3"
        />
        <select
          value={dateRange}
          onChange={handleDateRangeChange}
          className="px-4 py-2 border rounded-md shadow-sm"
        >
          <option value="">All Dates</option>
          <option value="last30">Last 30 Days</option>
          <option value="thisMonth">This Month</option>
          <option value="lastMonth">Last Month</option>
        </select>

        <button
          onClick={handleExport}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Export
        </button>

        <div className="flex space-x-2 ml-auto">
          <button
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition"
            onClick={() => navigate('/app/customer/sales/new')}

          >
            Create Invoice
          </button>
          <button
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition"
            onClick={() => navigate('/app/bank/receive-money')}
          >
            Add Payment
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b">
        <button
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'summary' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('summary')}
        >
          Summary
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'detail' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('detail')}
        >
          Detail
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'summary' ? (
        <div className="mt-6 bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Not Due Yet</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">1–30</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">31–60</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">61–90+</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{row.customer}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">Rs. {parseFloat(row.notDueYet).toFixed(2)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">Rs. {parseFloat(row.age1).toFixed(2)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">Rs. {parseFloat(row.age2).toFixed(2)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">Rs. {parseFloat(row.age3).toFixed(2)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 font-semibold">Rs. {parseFloat(row.total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-6 bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Invoice</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Invoice Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Due Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Not Due Yet</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">1–30</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">31–60</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">61–90+</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Total</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Balance</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{row.customer}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{row.invoice}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{row.invoiceDate}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{row.dueDate}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">Rs. {parseFloat(row.notDueYet).toFixed(2)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">Rs. {parseFloat(row.age1).toFixed(2)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">Rs. {parseFloat(row.age2).toFixed(2)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">Rs. {parseFloat(row.age3).toFixed(2)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 font-semibold">Rs. {parseFloat(row.total).toFixed(2)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 font-bold">Rs. {parseFloat(row.balance).toFixed(2)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                    <button
                      className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition"
                      onClick={() => navigate(`/app/bank/receive-money?salesOrderId=${row.id}&salesOrderNumber=${row.invoice}&payeeType=CUSTOMER&payeeId=${row.customerId}&amount=${row.balance}&description=Payment for SO: ${row.invoice}`)}
                    >
                      Get Payment
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">Page {page}</div>
        <div className="flex space-x-2">
          <button
            onClick={() => handlePaginationChange(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
          >
            Previous
          </button>
          <button
            onClick={() => handlePaginationChange(page + 1)}
            disabled={page * itemsPerPage >= (activeTab === 'summary' ? receivableSummaryData.length : receivableDetailData.length)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}