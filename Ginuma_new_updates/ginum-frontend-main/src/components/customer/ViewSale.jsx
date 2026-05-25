import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPrinter, FiAlertCircle } from 'react-icons/fi';
import api from '../../utils/api';
import { fetchCompanyCustomers, normalizeCustomer } from '../../utils/customerApi';

const ViewSale = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const companyId = localStorage.getItem("companyId");

  const [companyProfile, setCompanyProfile] = useState(null);
  const [customerProfile, setCustomerProfile] = useState(null);
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        if (!companyId) return;
        const data = await api.get(`/api/companies/${companyId}`);
        setCompanyProfile(data);
      } catch (e) {
        // ignore
      }
    };
    fetchCompany();
  }, [companyId]);

  const getItemLabel = (item) => {
    if (!item) return 'Unknown Item';

    const label = item.itemName || item.productName || item.description || item.name;
    if (label) return label;

    const idLabel = item.externalItemId ?? item.productId ?? item.itemId ?? item.id;
    return idLabel ? `Item #${idLabel}` : 'Unknown Item';
  };

  useEffect(() => {
    const fetchSale = async () => {
      try {
        if (!companyId) return;
        setLoading(true);
        const data = await api.get(`/api/sales-orders/company/${companyId}/${id}`);
        setSale(data);
      } catch (err) {
        setError('Failed to fetch sales order details.');
      } finally {
        setLoading(false);
      }
    };
    fetchSale();
  }, [id, companyId]);

  useEffect(() => {
    const fetchCustomerProfile = async () => {
      try {
        if (!companyId || !sale) return;

        let customers = [];
        try {
          const direct = await api.get(`/api/customers/companies/${companyId}`);
          customers = Array.isArray(direct) ? direct.map(normalizeCustomer) : [];
        } catch (e) {
          customers = [];
        }

        if (!customers.length) {
          const token =
            localStorage.getItem('auth_token') ||
            localStorage.getItem('token') ||
            localStorage.getItem('ginuma_token') ||
            sessionStorage.getItem('auth_token') ||
            '';
          customers = await fetchCompanyCustomers(companyId, token);
        }

        const saleCustomerId = sale.customerId || sale.customer?.id || sale.customer?.customerId;
        const saleCustomerName = (sale.customerName || sale.customer?.name || '').trim().toLowerCase();

        const matched = customers.find((c) => {
          const customerId = c?.id || c?.customerId;
          const customerName = String(c?.name || c?.customerName || '').trim().toLowerCase();
          const byId = saleCustomerId && customerId && String(customerId) === String(saleCustomerId);
          const byName =
            saleCustomerName &&
            customerName &&
            (customerName === saleCustomerName || customerName.includes(saleCustomerName) || saleCustomerName.includes(customerName));
          return byId || byName;
        });

        setCustomerProfile(matched || null);
      } catch (e) {
        setCustomerProfile(null);
      }
    };

    fetchCustomerProfile();
  }, [companyId, sale]);

  const customerVat =
    customerProfile?.vat ||
    customerProfile?.vatNumber ||
    customerProfile?.tax ||
    sale?.customerVat ||
    sale?.customer?.vatNumber ||
    sale?.customer?.vatNo ||
    sale?.customer?.vat ||
    '';

  const customerPhone =
    customerProfile?.phoneNo ||
    customerProfile?.phoneNumber ||
    customerProfile?.phone ||
    customerProfile?.mobileNo ||
    customerProfile?.mobile ||
    customerProfile?.contactInfo?.phone ||
    sale?.customerPhone ||
    sale?.customer?.phoneNo ||
    sale?.customer?.phone ||
    sale?.customer?.phoneNumber ||
    '';

  const customerAddress =
    customerProfile?.billingAddress ||
    customerProfile?.address ||
    customerProfile?.deliveryAddress ||
    sale?.customerAddress ||
    sale?.customer?.billingAddress ||
    sale?.customer?.deliveryAddress ||
    sale?.customer?.address ||
    '';

  const invoiceNo = sale.invoiceNo || sale.soNumber || sale.id || '';
  const customerRef = sale.customerRef || sale.customerReference || sale.reference || sale.soNumber || '';
  const paymentTerms = sale.paymentTerms || sale.terms || (sale.dueDate ? 'N/A' : 'N/A');
  const grossTotal = Number(sale.subtotal || sale.grossTotal || sale.netTotal || 0);
  const taxLine = sale.taxBreakdown && sale.taxBreakdown.length > 0 ? sale.taxBreakdown[0] : null;
  const taxLabel = taxLine?.taxType || 'VAT';
  const taxPercent = taxLine?.percentage != null && taxLine?.percentage !== '' ? `${taxLine.percentage}%` : '';
  const taxAmount = Number(sale.taxAmount || sale.totalTax || taxLine?.amount || 0);
  const grandTotal = Number(sale.total || grossTotal + taxAmount);
  const companyPhone = companyProfile?.phoneNo || companyProfile?.phone || companyProfile?.mobileNo || companyProfile?.mobile || companyProfile?.contactNumber || '';
  const companyVat = companyProfile?.vatNo || companyProfile?.vatNumber || companyProfile?.vatRegNo || companyProfile?.vat || '';

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading sales order details...</div>;
  }

  if (error || !sale) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <FiAlertCircle className="text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-bold text-gray-800 mb-2">{error || 'Sales Order not found'}</h2>
        <p className="text-gray-500 mb-6">The sales order you are looking for does not exist or an error occurred.</p>
        <button 
          onClick={() => navigate('/app/customer/sales/all')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <FiArrowLeft /> Back to Sales
        </button>
      </div>
    );
  }

  return (
    <div className="invoice-page max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="hidden print:block invoice-print-sheet">
        <div className="invoice-paper">
          <div className="invoice-top-row">
            <div className="invoice-company-title">
              <div className="invoice-company-name">{companyProfile?.companyName || companyProfile?.name || 'Company Name'}</div>
              {companyProfile?.address && <div className="invoice-company-address">{companyProfile.address}</div>}
            </div>
            <div className="invoice-logo-wrap">
              <img
                src={companyProfile?.logo || localStorage.getItem('companyLogo') || '/logo-print.png'}
                alt="Company Logo"
                className="invoice-logo"
              />
            </div>
          </div>

          <div className="invoice-title">TAX INVOICE</div>

          <div className="invoice-info-grid">
            <div className="invoice-info-left">
              <div className="invoice-field-row"><span className="label">INVOICE NO</span><span className="sep">:</span><span className="value">{invoiceNo || 'N/A'}</span></div>
              <div className="invoice-field-row"><span className="label">CUSTOMER REF.</span><span className="sep">:</span><span className="value">{customerRef || 'N/A'}</span></div>
              <div className="invoice-field-row"><span className="label">PAYMENT TERMS</span><span className="sep">:</span><span className="value">{paymentTerms || 'N/A'}</span></div>
              <div className="invoice-ship-block">
                <div className="invoice-field-title">NAME</div>
                <div className="invoice-field-value">{sale.customerName || sale.customer?.name || 'N/A'}</div>
                <div className="invoice-field-title">ADDRESS</div>
                <div className="invoice-field-value">{customerAddress || 'N/A'}</div>
              </div>
            </div>

            <div className="invoice-info-right">
              <div className="invoice-field-row"><span className="label">DATE</span><span className="sep">:</span><span className="value">{sale.issueDate || 'N/A'}</span></div>
              <div className="invoice-field-row"><span className="label">VAT REG. NO.</span><span className="sep">:</span><span className="value">{companyVat || 'N/A'}</span></div>
              <div className="invoice-field-row"><span className="label">CUST. VAT NO.</span><span className="sep">:</span><span className="value">{customerVat || 'N/A'}</span></div>
            </div>
          </div>

          <div className="invoice-items-title">ITEM DETAILS</div>
          <table className="invoice-table">
            <thead>
              <tr>
                <th style={{ width: '6%' }}>NO.</th>
                <th style={{ width: '14%' }}>ITEM CODE</th>
                <th>DESCRIPTION</th>
                <th style={{ width: '8%' }}>UNIT</th>
                <th style={{ width: '8%' }}>QTY</th>
                <th style={{ width: '12%' }}>UNIT PRICE</th>
                <th style={{ width: '14%' }}>NET AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {(sale.items && sale.items.length > 0 ? sale.items : []).map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.externalItemId || item.productId || item.itemId || item.id || '-'}</td>
                  <td>{getItemLabel(item)}</td>
                  <td>{item.unit || item.uom || item.uomName || 'PCS'}</td>
                  <td>{item.quantity || 0}</td>
                  <td>{Number(item.unitPrice || 0).toFixed(2)}</td>
                  <td>{Number(item.amount || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="invoice-total-wrap">
            <div className="invoice-total-box">
              <div className="total-row"><span>GROSS TOTAL</span><span className="currency">LKR.</span><span className="amount">{grossTotal.toFixed(2)}</span></div>
              <div className="total-row"><span>{taxLabel} {taxPercent}</span><span className="currency">LKR.</span><span className="amount">{taxAmount.toFixed(2)}</span></div>
              <div className="total-row total-row-final"><span>TOTAL</span><span className="currency">LKR.</span><span className="amount">{grandTotal.toFixed(2)}</span></div>
            </div>
          </div>

          <div className="invoice-signatures">
            <div>PREPARED BY: ____________________</div>
            <div>CHECKED BY: ______________________</div>
            <div>AUTHORIZED BY: __________________</div>
            <div>CUSTOMER'S SIGNATURE: ____________</div>
          </div>

          <div className="invoice-footer">
            <div className="invoice-footer-company">{companyProfile?.companyName || companyProfile?.name || 'Company Name'}</div>
            <div>{companyProfile?.address || ''}</div>
            <div>Tel: {companyPhone || 'N/A'}  |  VAT: {companyVat || 'N/A'}</div>
          </div>
        </div>
      </div>

      <div className="no-print mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
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

      <div className="no-print invoice-card bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="invoice-meta p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Customer Information</h3>
              <p className="mt-2 text-lg font-medium text-gray-900">{sale.customerName || (sale.customer && sale.customer.name) || 'N/A'}</p>
              <p className="mt-1 text-sm text-gray-700"><span className="font-medium">Phone:</span> {customerPhone || 'N/A'}</p>
              <p className="mt-1 text-sm text-gray-700"><span className="font-medium">VAT:</span> {customerVat || 'N/A'}</p>
              <p className="mt-1 text-sm text-gray-700"><span className="font-medium">Address:</span> {customerAddress || 'N/A'}</p>
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

          {/* Notes removed per request */}
        </div>

        <div className="invoice-items border-t border-gray-200 px-6 py-6">
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
                      <td className="px-4 py-3 text-sm text-gray-900">{getItemLabel(item)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity || 0}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{Number(item.unitPrice || 0).toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{Number(item.discountPercent || 0).toFixed(2)}%</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{Number(item.amount || 0).toFixed(2)}</td>
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

        <div className="invoice-totals border-t border-gray-200 px-6 py-6 bg-gray-50 flex flex-col md:flex-row justify-end">
          <div className="invoice-summary w-full md:w-1/3 space-y-3">
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
                    <span className="text-gray-500 italic">{tax.taxType} ({tax.percentage}%)</span>
                    <span className="text-gray-900">{Number(tax.amount || 0).toFixed(2)}</span>
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
