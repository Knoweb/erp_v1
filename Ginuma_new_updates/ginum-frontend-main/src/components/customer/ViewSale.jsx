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
        <div id="invoice-content" className="max-w-[210mm] mx-auto bg-white shadow-[0_0_50px_rgba(0,0,0,0.05)] border border-slate-200 print:shadow-none print:border-none relative p-[10mm] print:p-0 flex flex-col" style={{ minHeight: '297mm' }}>
          
          {/* Header Section */}
          <div className="flex justify-between items-start gap-8 mb-4 border-b-2 border-slate-900 pb-4">
            <div className="flex-1">
              <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase mb-1.5">
                {companyProfile?.companyName || 'Company'}
              </h1>
              <div className="text-[10px] text-slate-600 leading-relaxed font-medium">
                <p className="max-w-md">{companyProfile?.address}</p>
                <div className="mt-0.5 flex flex-col">
                  {companyProfile?.phoneNo && <span>Tel: {companyProfile.phoneNo}</span>}
                  {companyProfile?.email && <span>Email: {companyProfile.email}</span>}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end text-right">
              {companyProfile?.logo ? (
                <img
                  src={companyProfile.logo}
                  alt="Logo"
                  className="max-h-10 mb-2 grayscale"
                />
              ) : (
                <div className="h-9 w-9 bg-slate-900 rounded-lg mb-2 flex items-center justify-center text-white font-black text-sm">
                  {companyProfile?.companyName?.substring(0, 2).toUpperCase()}
                </div>
              )}
              <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">{isTaxInvoice ? 'TAX INVOICE' : 'INVOICE'}</h2>
            </div>
          </div>

          {/* Details Bar */}
          <div className="grid grid-cols-2 gap-x-8 mb-3 text-[10px]">
            <div className="grid grid-cols-[120px,1fr] gap-y-0.5">
              <span className="font-bold uppercase text-slate-400 tracking-wider">Invoice No</span>
              <span className="font-bold text-slate-900 text-[11px]">{sale?.soNumber || '-'}</span>
              
              <span className="font-bold uppercase text-slate-400 tracking-wider">Customer Reference</span>
              <span className="font-bold text-slate-900 text-[11px]">{sale?.customerId || '-'}</span>
              
              <span className="font-bold uppercase text-slate-400 tracking-wider">Payment Terms</span>
              <span className="font-bold text-slate-900 text-[11px]">{sale?.paymentTerms || 'N/A'}</span>
            </div>
            <div className="grid grid-cols-[120px,1fr] gap-y-0.5 text-right">
              <span className="font-bold uppercase text-slate-400 tracking-wider">Issue Date</span>
              <span className="font-bold text-slate-900 text-[11px]">{sale?.issueDate || '-'}</span>
              
              <span className="font-bold uppercase text-slate-400 tracking-wider">VAT Reg No</span>
              <span className="font-bold text-slate-900 text-[11px]">{companyProfile?.vatNo || companyProfile?.vatNumber || '-'}</span>
              
              <span className="font-bold uppercase text-slate-400 tracking-wider">Customer VAT No</span>
              <span className="font-bold text-slate-900 text-[11px]">{customerVat || 'Not Registered'}</span>
            </div>
          </div>

          {/* Client Details */}
          <div className="mb-3 bg-slate-50 border-l-[3px] border-slate-900 p-2.5 flex flex-col gap-0">
            <h3 className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Bill To:</h3>
            <p className="text-sm font-black text-slate-900 leading-tight uppercase underline underline-offset-3">{sale?.customerName || 'N/A'}</p>
            <p className="text-[10px] text-slate-600 font-medium max-w-sm">{customerAddress || '-'}</p>
            {customerPhone && (
              <p className="text-[10px] text-slate-700 font-bold">Tel: {customerPhone}</p>
            )}
          </div>

          {/* Table Container */}
          <div className="mb-4 min-h-[70px]">
            <table className="w-full text-[9px] border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-bold h-6">
                  <th className="px-2 py-0.5 text-center w-8 border border-slate-900">#</th>
                  <th className="px-2 py-0.5 text-left border border-slate-900">DESCRIPTION</th>
                  <th className="px-2 py-0.5 text-center w-12 border border-slate-900">UNIT</th>
                  <th className="px-2 py-0.5 text-center w-12 border border-slate-900">QTY</th>
                  <th className="px-2 py-0.5 text-right w-20 border border-slate-900">UNIT PRICE</th>
                  <th className="px-2 py-0.5 text-right w-20 border border-slate-900">NET AMOUNT</th>
                </tr>
              </thead>
              <tbody className="text-slate-900 font-medium">
                {sale?.items && sale.items.length > 0 ? (
                  sale.items.map((item, index) => (
                    <tr key={index} className="h-6 border-x border-slate-300">
                      <td className="px-2 py-0.5 text-center border-b border-slate-300 text-[8px]">{index + 1}</td>
                      <td className="px-2 py-0.5 border-b border-slate-300 uppercase text-[9px]">{getItemLabel(item)}</td>
                      <td className="px-2 py-0.5 text-center border-b border-slate-300 tabular-nums text-[8px]">PCS</td>
                      <td className="px-2 py-0.5 text-center border-b border-slate-300 tabular-nums text-[9px]">{item.quantity || 0}</td>
                      <td className="px-2 py-0.5 text-right border-b border-slate-300 tabular-nums text-[9px]">{Number(item.unitPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-2 py-0.5 text-right border-b border-slate-300 font-black tabular-nums text-[9px]">{Number(item.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="border border-slate-300">
                    <td colSpan="6" className="px-2 py-3 text-center text-slate-400 italic font-medium uppercase tracking-widest text-[8px]">No transaction items found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Financial Summary */}
          <div className="flex justify-between items-start gap-6 mb-3 flex-col">
            <div className="flex justify-between w-full gap-6">
              <div className="flex-1">
                <div className="text-[8px] text-slate-500 uppercase tracking-widest font-black mb-0.5">Bank Information:</div>
                <div className="text-[10px] text-slate-800 bg-slate-50 border border-slate-200 p-2 rounded-lg leading-relaxed">
                  <p className="font-black underline mb-0.5 uppercase tracking-tight text-[9px]">{companyProfile?.bankName || 'BENEFICIARY BANK DETAILS'}</p>
                  <p className="font-bold text-[9px]">ACC NO: {companyProfile?.accountNumber || '—'}</p>
                  <p className="text-[8px] font-medium text-slate-500 mt-0.5 uppercase">Please quote the invoice number as reference.</p>
                </div>
              </div>
              <div className="w-56 bg-slate-900 p-3 rounded-lg text-white shadow-lg shadow-slate-200">
                <div className="flex justify-between items-center text-[9px] text-slate-400 uppercase font-black mb-1.5">
                  <span>Subtotal</span>
                  <span className="text-white tracking-tight text-[10px]">{Number(sale?.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                
                {sale?.taxBreakdown && sale.taxBreakdown.length > 0 && (
                  <div className="space-y-1 mb-2 pt-1.5 border-t border-white/10">
                    {sale.taxBreakdown.map((tax, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[9px] text-slate-400 uppercase font-bold">
                        <span>{tax.taxType} ({tax.percentage}%)</span>
                        <span className="text-white tracking-tight text-[10px]">{Number(tax.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-1.5 border-t border-white/20">
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#fbbf24]">Grand Total</span>
                  <div className="text-right">
                    <span className="text-[7px] block opacity-50 uppercase font-bold leading-none mb-0.5">LKR</span>
                    <span className="text-base font-black tracking-tighter leading-none">{Number(sale?.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Authorization Section */}
          <div className="grid grid-cols-4 gap-x-2 mt-auto mb-2 text-center pt-1.5">
            <div className="flex flex-col h-12 justify-end">
              <div className="border-t-2 border-slate-400 pt-0.5">
                <p className="text-[7px] font-black uppercase tracking-[0.2em] text-slate-500">Prepared By</p>
              </div>
            </div>
            <div className="flex flex-col h-12 justify-end">
              <div className="border-t-2 border-slate-400 pt-0.5">
                <p className="text-[7px] font-black uppercase tracking-[0.2em] text-slate-500">Checked By</p>
              </div>
            </div>
            <div className="flex flex-col h-12 justify-end">
              <div className="border-t-2 border-slate-400 pt-0.5">
                <p className="text-[7px] font-black uppercase tracking-[0.2em] text-slate-500">Authorized By</p>
              </div>
            </div>
            <div className="flex flex-col h-12 justify-end">
              <div className="border-t-2 border-slate-400 pt-0.5">
                <p className="text-[7px] font-black uppercase tracking-[0.2em] text-slate-500">Customer Sig</p>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="text-center pt-1.5 border-t border-slate-100">
            <p className="text-[7px] font-black uppercase tracking-[0.4em] text-slate-400 mb-0.5">Thank you for your business</p>
            <div className="text-[8px] font-bold text-slate-600 space-x-1.5">
              <span>TEL: {companyProfile?.phoneNo || '-'}</span>
              <span className="opacity-30">|</span>
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
