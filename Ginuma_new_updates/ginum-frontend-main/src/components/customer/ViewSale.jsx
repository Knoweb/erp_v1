import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPrinter, FiAlertCircle } from 'react-icons/fi';
import api from '../../utils/api';
import { fetchCompanyCustomers } from '../../utils/customerApi';

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

        const token =
          localStorage.getItem('auth_token') ||
          localStorage.getItem('token') ||
          localStorage.getItem('ginuma_token') ||
          sessionStorage.getItem('auth_token') ||
          '';

        const customers = await fetchCompanyCustomers(companyId, token);
        const saleCustomerId = sale.customerId || sale.customer?.id || sale.customer?.customerId;
        const saleCustomerName = (sale.customerName || sale.customer?.name || '').trim().toLowerCase();

        const matched = customers.find((c) => {
          const byId = saleCustomerId && String(c.id) === String(saleCustomerId);
          const byName = saleCustomerName && String(c.name || c.customerName || '').trim().toLowerCase() === saleCustomerName;
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
    customerProfile?.mobileNo ||
    customerProfile?.contactInfo?.phone ||
    sale?.customerPhone ||
    sale?.customer?.phoneNo ||
    sale?.customer?.phoneNumber ||
    '';

  const customerAddress =
    customerProfile?.billingAddress ||
    customerProfile?.address ||
    customerProfile?.deliveryAddress ||
    sale?.customerAddress ||
    sale?.customer?.billingAddress ||
    sale?.customer?.address ||
    '';

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
    <div className="invoice-page bg-white">
      {/* Screen Navigation (hidden when printing) */}
      <div className="no-print sticky top-0 z-50 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/app/customer/sales/all')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold">Tax Invoice #{sale?.soNumber}</h1>
        </div>
        <button 
          onClick={() => window.print()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FiPrinter size={18} /> Print Invoice
        </button>
      </div>

      {/* Professional Invoice */}
      <div className="max-w-none w-full p-0 bg-white print-invoice">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-6 border-b-2 border-gray-300 pb-4 px-8 pt-8">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900">{companyProfile?.companyName || 'Company'}</h1>
            <p className="text-xs text-gray-600 mt-2">
              {companyProfile?.address}<br/>
              Tel: {companyProfile?.phoneNo || companyProfile?.phone || '-'}<br/>
              Email: {companyProfile?.email || '-'}
            </p>
          </div>
          <div className="text-right">
            {companyProfile?.logo && (
              <img
                src={companyProfile.logo}
                alt="Company Logo"
                style={{ maxWidth: 150, maxHeight: 120 }}
                className="mb-3"
              />
            )}
            <h2 className="text-3xl font-bold text-gray-800">TAX INVOICE</h2>
          </div>
        </div>

        {/* Invoice Metadata */}
        <div className="grid grid-cols-2 gap-12 mb-6 px-8">
          <div className="text-xs space-y-1">
            <p><strong>INVOICE NO.:</strong> {sale?.soNumber || '-'}</p>
            <p><strong>CUSTOMER REF.:</strong> {sale?.customerId || '-'}</p>
            <p><strong>PAYMENT TERMS:</strong> {sale?.paymentTerms || 'N/A'}</p>
          </div>
          <div className="text-xs space-y-1 text-right">
            <p><strong>DATE:</strong> {sale?.issueDate || '-'}</p>
            <p><strong>VAT REG. NO.:</strong> {companyProfile?.vatNo || companyProfile?.vatNumber || '-'}</p>
            <p><strong>CUST. VAT NO.:</strong> {customerVat || 'N/A'}</p>
          </div>
        </div>

        {/* Customer Details */}
        <div className="mb-6 px-8">
          <h3 className="text-xs font-bold uppercase text-gray-700 mb-2">BILL TO:</h3>
          <p className="font-semibold text-sm text-gray-900">{sale?.customerName || 'N/A'}</p>
          <p className="text-xs text-gray-600">{customerAddress || '-'}</p>
          {customerPhone && <p className="text-xs text-gray-600">Tel: {customerPhone}</p>}
        </div>

        {/* Items Table */}
        <div className="mb-6 px-8">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-200 border border-gray-400">
                <th className="border border-gray-400 px-3 py-2 text-left font-semibold">NO.</th>
                <th className="border border-gray-400 px-3 py-2 text-left font-semibold">DESCRIPTION</th>
                <th className="border border-gray-400 px-3 py-2 text-center font-semibold">UNIT</th>
                <th className="border border-gray-400 px-3 py-2 text-center font-semibold">QTY</th>
                <th className="border border-gray-400 px-3 py-2 text-right font-semibold">UNIT PRICE</th>
                <th className="border border-gray-400 px-3 py-2 text-right font-semibold">NET AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {sale?.items && sale.items.length > 0 ? (
                sale.items.map((item, index) => (
                  <tr key={index} className="border border-gray-400">
                    <td className="border border-gray-400 px-3 py-1 text-center">{index + 1}</td>
                    <td className="border border-gray-400 px-3 py-1">{getItemLabel(item)}</td>
                    <td className="border border-gray-400 px-3 py-1 text-center">PCS</td>
                    <td className="border border-gray-400 px-3 py-1 text-center">{item.quantity || 0}</td>
                    <td className="border border-gray-400 px-3 py-1 text-right">{Number(item.unitPrice || 0).toFixed(2)}</td>
                    <td className="border border-gray-400 px-3 py-1 text-right font-medium">{Number(item.amount || 0).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="border border-gray-400 px-3 py-2 text-center text-gray-500">No items</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-2 gap-12 mb-6 px-8">
          <div></div>
          <div className="text-xs space-y-1 border-l border-gray-300 pl-4">
            <div className="flex justify-between">
              <span>GROSS TOTAL</span>
              <span className="font-medium">{Number(sale?.subtotal || 0).toFixed(2)}</span>
            </div>
            {sale?.taxBreakdown && sale.taxBreakdown.length > 0 && (
              sale.taxBreakdown.map((tax, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{tax.taxType} ({tax.percentage}%)</span>
                  <span className="font-medium">{Number(tax.amount || 0).toFixed(2)}</span>
                </div>
              ))
            )}
            <div className="flex justify-between border-t border-gray-300 pt-1 font-bold text-sm">
              <span>TOTAL</span>
              <span>{Number(sale?.total || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Signatures and Bank Details */}
        <div className="grid grid-cols-2 gap-12 mb-4 px-8">
          {/* Signatures */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-center text-xs">
              <div className="border-t border-gray-400 pt-12">
                <p className="font-semibold">PREPARED BY</p>
              </div>
              <div className="border-t border-gray-400 pt-12">
                <p className="font-semibold">CHECKED BY</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center text-xs">
              <div className="border-t border-gray-400 pt-12">
                <p className="font-semibold">AUTHORIZED BY</p>
              </div>
              <div className="border-t border-gray-400 pt-12">
                <p className="font-semibold">CUSTOMER'S SIGNATURE</p>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="bg-gray-50 p-3 text-xs border border-gray-300">
            <p className="font-semibold mb-1">BENEFICIARY BANK:</p>
            <p>{companyProfile?.bankName || 'Bank Details Not Available'}</p>
            {companyProfile?.accountNumber && <p>Account Number: {companyProfile.accountNumber}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-600 border-t border-gray-300 pt-4 px-8 pb-8">
          <p className="font-semibold">{companyProfile?.companyName}</p>
          <p className="text-xs">{companyProfile?.address}</p>
          <p className="text-xs">
            Tel: {companyProfile?.phoneNo || '-'} | 
            Email: {companyProfile?.email || '-'} | 
            Web: {companyProfile?.website || '-'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ViewSale;
