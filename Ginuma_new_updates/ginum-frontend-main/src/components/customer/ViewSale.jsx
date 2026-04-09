import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPrinter } from 'react-icons/fi';
import api from '../../utils/api';
import Alert from '../../components/Alert/Alert';

const ViewSale = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const companyId = localStorage.getItem("companyId");

  useEffect(() => {
    const fetchSale = async () => {
      try {
        if (!companyId) return;
        setLoading(true);
        const data = await api.get(`/api/${companyId}/sales-orders/${id}`);
        setSale(data);
      } catch (err) {
        setError('Failed to fetch sales order details.');
      } finally {
        setLoading(false);
      }
    };
    fetchSale();
  }, [id, companyId]);

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading sales order details...</div>;
  }

  if (error || !sale) {
    return (
      <div className="p-6">
        <Alert type="error" message={error || 'Sales Order not found'} />
        <button 
          onClick={() => navigate('/app/customer/sales/all')}
          className="mt-4 text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          <FiArrowLeft /> Back to Sales
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/app/customer/sales/all')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold border-b-4 border-indigo-500 inline-block pb-1">
              Sales Order #{sale.soNumber}
            </h1>
            <p className="text-sm text-gray-500 mt-1">View details for this sales transaction</p>
          </div>
        </div>
        <button 
          onClick={() => window.print()}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors border border-gray-300"
        >
          <FiPrinter /> Print SO
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Customer Information</h3>
              <p className="mt-2 text-lg font-medium text-gray-900">{sale.customerName || (sale.customer && sale.customer.name) || 'N/A'}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Dates</h3>
              <p className="mt-1 text-gray-900"><span className="font-medium">Issue Date:</span> {sale.issueDate || 'N/A'}</p>
              <p className="mt-1 text-gray-900"><span className="font-medium">Due Date:</span> {sale.dueDate || 'N/A'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Order References</h3>
              <p className="mt-1 text-gray-900"><span className="font-medium">SO Number:</span> {sale.soNumber || 'N/A'}</p>
              <p className="mt-1 text-gray-900"><span className="font-medium">Sales Type:</span> {sale.salesType || 'N/A'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Notes</h3>
              <p className="mt-2 text-gray-700 whitespace-pre-wrap text-sm border-l-2 border-gray-200 pl-3">
                {sale.notes || 'No notes provided.'}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b-2 border-indigo-400 inline-block">Item Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600">Item</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600 text-right">Quantity</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600 text-right">Unit Price</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600 text-right">Discount</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sale.items && sale.items.length > 0 ? (
                  sale.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900">{item.itemName || (item.item && item.item.name) || 'Unknown Item'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{Number(item.unitPrice).toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{Number(item.discountPercent || 0).toFixed(2)}%</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{Number(item.total).toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-4 text-center text-gray-500 italic">No items found for this order.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-6 bg-gray-50 flex flex-col md:flex-row justify-end">
          <div className="w-full md:w-1/3 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 font-medium">Subtotal</span>
              <span className="text-gray-900 font-semibold">{Number(sale.subtotal).toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 font-medium">Freight</span>
              <span className="text-gray-900 font-semibold">{Number(sale.freight).toFixed(2)}</span>
            </div>

            {sale.taxBreakdown && sale.taxBreakdown.length > 0 && (
              <div className="border-t border-b border-gray-200 py-2 my-2 space-y-2">
                <span className="text-gray-600 font-medium text-xs uppercase tracking-wider block">Taxes Collected:</span>
                {sale.taxBreakdown.map((tax, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-500 italic">{tax.taxName} ({tax.taxRate}%)</span>
                    <span className="text-gray-900">{Number(tax.taxAmount).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
              <span className="text-gray-600 font-medium">Total Tax</span>
              <span className="text-gray-900 font-semibold">{Number(sale.taxAmount || 0).toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-lg border-t border-gray-300 pt-3 mt-1">
              <span className="text-gray-800 font-bold">Grand Total</span>
              <span className="text-indigo-700 font-bold">{Number(sale.total).toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between text-sm border-t border-gray-200 pt-2 mt-2">
              <span className="text-green-600 font-medium">Amount Paid</span>
              <span className="text-green-700 font-semibold">{Number(sale.amountPaid || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
              <span className="text-red-600 font-medium">Balance Due</span>
              <span className="text-red-700 font-semibold">{Number(sale.balanceDue || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSale;
