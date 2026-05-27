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
        <div id="invoice-content" className="max-w-[210mm] mx-auto bg-white shadow-[0_0_50px_rgba(0,0,0,0.05)] border border-slate-200 print:shadow-none print:border-none relative p-[15mm] print:p-0 flex flex-col justify-between" style={{ height: '297mm' }}>
          
          {/* Header - Logo and Title */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-end gap-2 mb-4">
                {companyProfile?.logo ? (
                  <img src={companyProfile.logo} alt="Logo" className="max-h-8 grayscale" />
                ) : (
                  <div className="h-8 w-8 bg-slate-900 rounded flex items-center justify-center text-white font-black text-xs">
                    {companyProfile?.companyName?.substring(0, 1).toUpperCase()}
                  </div>
                )}
                <h1 className="text-lg font-bold text-slate-900">{companyProfile?.companyName?.substring(0, 25) || 'Company'}</h1>
              </div>
              <div className="text-[9px] text-slate-600 leading-relaxed space-y-1">
                {companyProfile?.address && <p>{companyProfile.address}</p>}
                {companyProfile?.email && <p className="text-blue-600 hover:underline">{companyProfile.email}</p>}
                {companyProfile?.phoneNo && <p>Contact Number: {companyProfile.phoneNo}</p>}
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">{isTaxInvoice ? 'TAX INVOICE' : 'INVOICE'}</h2>
              <div className="text-[10px] text-slate-700 space-y-1.5">
                <div className="flex justify-end gap-3">
                  <span className="text-slate-500 font-semibold">Date:</span>
                  <span className="font-bold">{sale?.issueDate || '-'}</span>
                </div>
                <div className="flex justify-end gap-3">
                  <span className="text-slate-500 font-semibold">Invoice Number:</span>
                  <span className="font-bold">{sale?.soNumber || '-'}</span>
                </div>
                <div className="flex justify-end gap-3">
                  <span className="text-slate-500 font-semibold">Payment Method:</span>
                  <span className="font-bold">{sale?.paymentTerms || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Billed To */}
          <div className="mb-6 pb-4 border-b border-dashed border-slate-300">
            <p className="text-[10px] text-slate-500 font-semibold mb-1">Billed To:</p>
            <p className="text-[11px] font-bold text-slate-900">{sale?.customerName || 'Customer'}</p>
            <p className="text-[9px] text-slate-600">{customerAddress || '-'}</p>
            {customerPhone && <p className="text-[9px] text-slate-600">Tel: {customerPhone}</p>}
            {customerVat && customerVat !== 'Not Registered' && (
              <p className="text-[9px] text-slate-600">VAT: {customerVat}</p>
            )}
          </div>

          {/* Items Table */}
          <div className="mb-6 flex-grow">
            <table className="w-full text-[10px] border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900 bg-slate-900 text-white">
                  <th className="px-2 py-2 text-center font-bold w-6">#</th>
                  <th className="px-2 py-2 text-left font-bold">DESCRIPTION</th>
                  <th className="px-2 py-2 text-center font-bold w-12">UNIT</th>
                  <th className="px-2 py-2 text-center font-bold w-8">QTY</th>
                  <th className="px-2 py-2 text-right font-bold w-20">UNIT PRICE</th>
                  <th className="px-2 py-2 text-right font-bold w-24">NET AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {sale?.items && sale.items.length > 0 ? (
                  sale.items.map((item, index) => (
                    <tr key={index} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-2 py-2 text-center text-slate-900 text-[9px]">{index + 1}</td>
                      <td className="px-2 py-2 text-slate-900">{getItemLabel(item)}</td>
                      <td className="px-2 py-2 text-center text-slate-900 text-[9px]">PCS</td>
                      <td className="px-2 py-2 text-center text-slate-900 tabular-nums">{item.quantity || 0}</td>
                      <td className="px-2 py-2 text-right text-slate-900 tabular-nums">{Number(item.unitPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-2 py-2 text-right text-slate-900 font-semibold tabular-nums">{Number(item.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-2 py-4 text-center text-slate-400 text-[9px]">No items</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="mb-6">
            <div className="bg-slate-900 text-white p-4 rounded-sm space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Subtotal</span>
                <span className="text-[11px] font-semibold tabular-nums">{Number(sale?.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              
              {sale?.taxBreakdown && sale.taxBreakdown.length > 0 && (
                sale.taxBreakdown.map((tax, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{tax.taxType} ({tax.percentage}%)</span>
                    <span className="text-[11px] font-semibold tabular-nums">{Number(tax.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                ))
              )}
              
              <div className="border-t border-white/20 pt-2 mt-2 flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase tracking-wide">Grand Total</span>
                <span className="text-[16px] font-black tabular-nums">{Number(sale?.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Bank Information - Minimal */}
          <div className="mb-6 pb-4 border-b border-dashed border-slate-300">
            <p className="text-[9px] text-slate-500 font-semibold mb-1">BANK DETAILS</p>
            <p className="text-[9px] font-semibold text-slate-900">{companyProfile?.bankName || 'Bank Name'}</p>
            <p className="text-[9px] text-slate-600">Account: {companyProfile?.accountNumber || '-'}</p>
          </div>

          {/* Footer */}
          <div className="text-center pt-3 border-t border-slate-200">
            <p className="text-[8px] font-semibold text-slate-600 tracking-wide mb-1">Thank you for your business</p>
            <div className="text-[8px] text-slate-500">
              <span>TEL: {companyProfile?.phoneNo || '-'}</span>
              <span className="mx-1">|</span>
              <span>EMAIL: {companyProfile?.email || '-'}</span>
            </div>
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
            padding: 15mm !important;
            width: 100% !important;
            max-width: 100% !important;
            height: 297mm !important;
          }
          table {
            width: 100% !important;
          }
          td, th {
            padding: 0.5rem 0.5rem !important;
          }
          tr {
            page-break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ViewSale;
