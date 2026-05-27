import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPrinter, FiAlertCircle, FiDownload } from 'react-icons/fi';
import html2pdf from 'html2pdf.js';
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

  const downloadPDF = () => {
    const element = document.getElementById('invoice-content');
    const filename = `${companyProfile?.companyName || 'Invoice'}_${sale?.soNumber || 'SO'}.pdf`;
    
    const options = {
      margin: 0,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, logging: false, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: 'avoid-all', before: '.page-break-before' }
    };

    html2pdf().set(options).from(element).save();
  };

  const isTaxInvoice = (sale?.total > sale?.subtotal) || (sale?.taxBreakdown && sale.taxBreakdown.length > 0);

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
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[50vh] bg-slate-50">
        <FiAlertCircle className="text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-bold text-slate-800 mb-2">{error || 'Sales Order not found'}</h2>
        <p className="text-slate-500 mb-6">The sales order you are looking for does not exist or an error occurred.</p>
        <button 
          onClick={() => navigate('/app/customer/sales/all')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 transition-all active:scale-95"
        >
          <FiArrowLeft /> Back to Sales
        </button>
      </div>
    );
  }

  return (
    <div className="invoice-page min-h-screen bg-slate-100 flex flex-col">
      {/* Screen Navigation (hidden when printing) */}
      <div className="no-print sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/app/customer/sales/all')}
            className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all active:scale-90"
            title="Go back"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">{isTaxInvoice ? 'Tax Invoice' : 'Invoice'}</h1>
            <p className="text-xs text-slate-500 font-medium tracking-tight">#{sale?.soNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={downloadPDF}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold shadow-md shadow-green-200 transition-all active:scale-95"
          >
            <FiDownload size={16} /> PDF
          </button>
          <button 
            onClick={() => window.print()}
            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold shadow-md shadow-slate-200 transition-all active:scale-95"
          >
            <FiPrinter size={16} /> Print
          </button>
        </div>
      </div>

      {/* Professional Invoice Container */}
      <div className="flex-1 overflow-y-auto py-4 px-4 sm:px-6">
        <div id="invoice-content" className="max-w-[210mm] mx-auto bg-white relative p-[10mm] print:p-0 flex flex-col justify-between" style={{ height: '297mm', fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
          
          {/* HEADER SECTION - Modern & Clean */}
          <div className="mb-6">
            {/* Company Logo & Name */}
            <div className="flex justify-between items-start mb-6 pb-6 border-b-2 border-slate-200">
              <div className="flex items-center gap-3">
                {companyProfile?.logo ? (
                  <img src={companyProfile.logo} alt="Logo" className="h-12 w-auto" />
                ) : (
                  <div className="h-12 w-12 bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl flex items-center justify-center">
                    <span className="text-white font-black text-lg">{companyProfile?.companyName?.substring(0, 1).toUpperCase() || 'C'}</span>
                  </div>
                )}
                <div>
                  <h1 className="text-lg font-bold text-slate-900 leading-tight">{companyProfile?.companyName || 'Company Name'}</h1>
                  <p className="text-[10px] text-slate-500 font-medium">{companyProfile?.businessType || 'Business'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Invoice</p>
                <p className="text-2xl font-black text-slate-900">{isTaxInvoice ? 'TAX' : 'INVOICE'}</p>
              </div>
            </div>

            {/* Company Contact Info */}
            <div className="grid grid-cols-3 gap-8 mb-6 pb-6 border-b border-slate-200">
              <div>
                <p className="text-[8px] font-bold uppercase text-slate-400 tracking-wider mb-1">From:</p>
                <p className="text-[11px] font-semibold text-slate-900">{companyProfile?.address || 'Address'}</p>
                <p className="text-[10px] text-slate-600 mt-1">{companyProfile?.phoneNo || '-'}</p>
                <p className="text-[10px] text-slate-600">{companyProfile?.email || '-'}</p>
              </div>
              <div>
                <p className="text-[8px] font-bold uppercase text-slate-400 tracking-wider mb-1">VAT Registration:</p>
                <p className="text-[11px] font-semibold text-slate-900">{companyProfile?.vatNo || companyProfile?.vatNumber || '-'}</p>
              </div>
              <div>
                <p className="text-[8px] font-bold uppercase text-slate-400 tracking-wider mb-1">Bank Details:</p>
                <p className="text-[11px] font-semibold text-slate-900">{companyProfile?.bankName || 'Bank Name'}</p>
                <p className="text-[10px] text-slate-600">ACC: {companyProfile?.accountNumber || '-'}</p>
              </div>
            </div>
          </div>

          {/* INVOICE DETAILS - Key Information */}
          <div className="mb-6 grid grid-cols-4 gap-4 pb-6 border-b border-slate-200">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-[8px] font-bold uppercase text-slate-400 tracking-wider mb-1">Invoice No:</p>
              <p className="text-[12px] font-black text-slate-900">{sale?.soNumber || '-'}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-[8px] font-bold uppercase text-slate-400 tracking-wider mb-1">Issue Date:</p>
              <p className="text-[12px] font-black text-slate-900">{sale?.issueDate || '-'}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-[8px] font-bold uppercase text-slate-400 tracking-wider mb-1">Payment Terms:</p>
              <p className="text-[12px] font-black text-slate-900">{sale?.paymentTerms || 'N/A'}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-[8px] font-bold uppercase text-slate-400 tracking-wider mb-1">Ref No:</p>
              <p className="text-[12px] font-black text-slate-900">{sale?.customerId || '-'}</p>
            </div>
          </div>

          {/* BILL TO SECTION - Premium Card Design */}
          <div className="mb-6 pb-6 border-b border-slate-200">
            <p className="text-[8px] font-bold uppercase text-slate-400 tracking-wider mb-3">Bill To:</p>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
              <p className="text-[12px] font-black text-slate-900 uppercase mb-1">{sale?.customerName || 'Customer'}</p>
              <p className="text-[10px] text-slate-700 mb-2">{customerAddress || 'Address not provided'}</p>
              <div className="flex gap-4 text-[9px]">
                {customerPhone && <p className="text-slate-600"><span className="font-semibold">Tel:</span> {customerPhone}</p>}
                {customerVat && <p className="text-slate-600"><span className="font-semibold">VAT:</span> {customerVat}</p>}
              </div>
            </div>
          </div>

          {/* LINE ITEMS TABLE - Modern & Clean */}
          <div className="mb-6 flex-grow">
            <table className="w-full text-[9px] border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900 bg-white">
                  <th className="px-2 py-2 text-left font-bold text-slate-900 w-8">#</th>
                  <th className="px-2 py-2 text-left font-bold text-slate-900">Description</th>
                  <th className="px-2 py-2 text-center font-bold text-slate-900 w-12">Unit</th>
                  <th className="px-2 py-2 text-center font-bold text-slate-900 w-12">Qty</th>
                  <th className="px-2 py-2 text-right font-bold text-slate-900 w-16">Unit Price</th>
                  <th className="px-2 py-2 text-right font-bold text-slate-900 w-16">Amount</th>
                </tr>
              </thead>
              <tbody className="text-slate-900">
                {sale?.items && sale.items.length > 0 ? (
                  sale.items.map((item, index) => (
                    <tr key={index} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-2 py-2 text-center text-slate-500 font-medium">{index + 1}</td>
                      <td className="px-2 py-2 font-medium text-slate-900 uppercase text-[10px]">{getItemLabel(item)}</td>
                      <td className="px-2 py-2 text-center text-slate-600 text-[9px]">PCS</td>
                      <td className="px-2 py-2 text-center font-bold text-slate-900">{item.quantity || 0}</td>
                      <td className="px-2 py-2 text-right text-slate-600 font-medium tabular-nums">{Number(item.unitPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-2 py-2 text-right font-bold text-slate-900 tabular-nums">{Number(item.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-2 py-4 text-center text-slate-400 text-[10px] italic">No line items</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* TOTALS SECTION - Right Aligned Summary */}
          <div className="mb-6 pb-6 border-b border-slate-200 flex justify-end">
            <div className="w-56 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-semibold text-slate-600">Subtotal:</span>
                <span className="text-[11px] font-bold text-slate-900 tabular-nums">{Number(sale?.subtotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              {sale?.taxBreakdown && sale.taxBreakdown.length > 0 && (
                <>
                  {sale.taxBreakdown.map((tax, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-[10px] font-semibold text-slate-600">{tax.taxType} ({tax.percentage}%):</span>
                      <span className="text-[11px] font-bold text-slate-900 tabular-nums">{Number(tax.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </>
              )}

              <div className="flex justify-between items-center pt-2 border-t-2 border-slate-900 mt-3">
                <span className="text-[11px] font-black text-slate-900 uppercase">Total (LKR):</span>
                <span className="text-xl font-black text-slate-900 tabular-nums">{Number(sale?.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* SIGNATURE LINES - Professional */}
          <div className="mb-4 grid grid-cols-4 gap-3 text-center">
            <div className="flex flex-col h-10 justify-end">
              <div className="border-t-2 border-slate-400 pt-1">
                <p className="text-[7px] font-bold uppercase text-slate-500 tracking-wide">Prepared</p>
              </div>
            </div>
            <div className="flex flex-col h-10 justify-end">
              <div className="border-t-2 border-slate-400 pt-1">
                <p className="text-[7px] font-bold uppercase text-slate-500 tracking-wide">Checked</p>
              </div>
            </div>
            <div className="flex flex-col h-10 justify-end">
              <div className="border-t-2 border-slate-400 pt-1">
                <p className="text-[7px] font-bold uppercase text-slate-500 tracking-wide">Authorized</p>
              </div>
            </div>
            <div className="flex flex-col h-10 justify-end">
              <div className="border-t-2 border-slate-400 pt-1">
                <p className="text-[7px] font-bold uppercase text-slate-500 tracking-wide">Customer</p>
              </div>
            </div>
          </div>

          {/* FOOTER - Professional Thank You */}
          <div className="text-center border-t border-slate-200 pt-3">
            <p className="text-[8px] font-bold uppercase text-slate-900 tracking-widest mb-2">Thank you for your business</p>
            <p className="text-[9px] text-slate-500 leading-tight">
              For queries, contact us at {companyProfile?.phoneNo || '-'} or {companyProfile?.email || '-'}
            </p>
          </div>
        </div>
      </div>
      
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            background-color: white !important;
          }
          .invoice-page {
            background-color: white !important;
            padding: 0 !important;
            min-height: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          div[class*="max-w-[210mm]"] {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 10mm !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          thead tr {
            background-color: #0f172a !important;
            -webkit-print-color-adjust: exact !important;
            color: white !important;
          }
          div[class*="bg-slate-900"] {
            background-color: #0f172a !important;
            -webkit-print-color-adjust: exact !important;
            color: white !important;
          }
          div[class*="bg-slate-50"] {
            background-color: #f8fafc !important;
            -webkit-print-color-adjust: exact !important;
          }
          .tabular-nums {
            font-variant-numeric: tabular-nums;
          }
        }
      `}</style>
    </div>
  );
};

export default ViewSale;
