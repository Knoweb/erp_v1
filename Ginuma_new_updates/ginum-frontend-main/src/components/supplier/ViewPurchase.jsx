import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPrinter, FiAlertCircle, FiDownload } from 'react-icons/fi';
import html2pdf from 'html2pdf.js';
import api from '../../utils/api';
import { fetchCompanySuppliers } from '../../utils/supplierApi';

const ViewPurchase = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const companyId = localStorage.getItem("companyId");

  const [companyProfile, setCompanyProfile] = useState(null);
  const [supplierProfile, setSupplierProfile] = useState(null);

  const normalizeMoney = (value) => {
    const numericValue = Number(value || 0);
    return Math.abs(numericValue) <= 0.01 ? 0 : numericValue;
  };

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

  useEffect(() => {
    const fetchPurchase = async () => {
      try {
        if (!companyId) return;
        setLoading(true);
        const data = await api.get(`/api/${companyId}/purchase-orders/${id}`);
        setPurchase(data);
      } catch (err) {
        setError('Failed to fetch purchase order details.');
      } finally {
        setLoading(false);
      }
    };
    fetchPurchase();
  }, [id, companyId]);

  useEffect(() => {
    const fetchSupplierProfile = async () => {
      try {
        if (!companyId || !purchase) return;

        const token =
          localStorage.getItem('auth_token') ||
          localStorage.getItem('token') ||
          localStorage.getItem('ginuma_token') ||
          sessionStorage.getItem('auth_token') ||
          '';

        const suppliersList = await fetchCompanySuppliers(companyId, token);
        const purchaseSupplierId = purchase.supplierId || purchase.supplier?.id;
        const purchaseSupplierName = (purchase.supplierName || purchase.supplier?.name || '').trim().toLowerCase();

        const matched = suppliersList.find((s) => {
          const byId = purchaseSupplierId && String(s.id) === String(purchaseSupplierId);
          const byName = purchaseSupplierName && String(s.name || s.supplierName || '').trim().toLowerCase() === purchaseSupplierName;
          return byId || byName;
        });

        setSupplierProfile(matched || null);
      } catch (e) {
        setSupplierProfile(null);
      }
    };

    fetchSupplierProfile();
  }, [companyId, purchase]);

  const downloadPDF = () => {
    const element = document.getElementById('invoice-content');
    const filename = `${companyProfile?.companyName || 'PO'}_${purchase?.purchaseOrderNumber || 'PO'}.pdf`;
    
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

  const isTaxInvoice = (purchase?.total > purchase?.subtotal) || (purchase?.taxBreakdown && purchase.taxBreakdown.length > 0);

  const supplierVat =
    supplierProfile?.vat ||
    supplierProfile?.vatNumber ||
    supplierProfile?.tax ||
    purchase?.supplierVat ||
    purchase?.supplier?.vatNumber ||
    purchase?.supplier?.vatNo ||
    purchase?.supplier?.vat ||
    '';

  const supplierPhone =
    supplierProfile?.phoneNo ||
    supplierProfile?.phoneNumber ||
    supplierProfile?.mobileNo ||
    supplierProfile?.contactInfo?.phone ||
    purchase?.supplierPhone ||
    purchase?.supplier?.phoneNo ||
    purchase?.supplier?.phoneNumber ||
    '';

  const supplierAddress =
    supplierProfile?.billingAddress ||
    supplierProfile?.address ||
    supplierProfile?.deliveryAddress ||
    purchase?.supplierAddress ||
    purchase?.supplier?.billingAddress ||
    purchase?.supplier?.address ||
    '';

  const getItemLabel = (item) => {
    if (!item) return 'Unknown Item';
    const label = item.productName || item.itemName || item.description || item.name;
    if (label) return label;
    const idLabel = item.externalItemId ?? item.productId ?? item.itemId ?? item.id;
    return idLabel ? `Item #${idLabel}` : 'Unknown Item';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !purchase) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[50vh] bg-slate-50">
        <FiAlertCircle className="text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-bold text-slate-800 mb-2">{error || 'Purchase Order not found'}</h2>
        <p className="text-slate-500 mb-6">The purchase order you are looking for does not exist or an error occurred.</p>
        <button 
          onClick={() => navigate('/app/supplier/purchase/all')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 transition-all active:scale-95"
        >
          <FiArrowLeft /> Back to Purchases
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
            onClick={() => navigate('/app/supplier/purchase/all')}
            className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all active:scale-90"
            title="Go back"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">{isTaxInvoice ? 'Tax Invoice' : 'Purchase Order'}</h1>
            <p className="text-xs text-slate-500 font-medium tracking-tight">#{purchase?.purchaseOrderNumber}</p>
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
        <div id="invoice-content" className="max-w-[210mm] mx-auto bg-white shadow-[0_0_50px_rgba(0,0,0,0.05)] border border-slate-200 relative p-[15mm] flex flex-col justify-between" style={{ height: '297mm' }}>
          
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
              <div className="text-[9px] text-slate-600 leading-relaxed space-y-0.5">
                {companyProfile?.companyRegisteredAddress && <p>{companyProfile.companyRegisteredAddress}</p>}
                {companyProfile?.companyFactoryAddress && !companyProfile?.companyRegisteredAddress && <p>{companyProfile.companyFactoryAddress}</p>}
                {companyProfile?.vatNo && <p>VAT No: {companyProfile.vatNo}</p>}
                {companyProfile?.email && <p>{companyProfile.email}</p>}
                {companyProfile?.phoneNo && <p>Contact Number: {companyProfile.phoneNo}</p>}
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">{isTaxInvoice ? 'TAX INVOICE' : 'PURCHASE ORDER'}</h2>
              <div className="text-[10px] text-slate-700 space-y-1.5">
                <div className="flex justify-end gap-3">
                  <span className="text-slate-500 font-semibold">Date:</span>
                  <span className="font-bold">{purchase?.issueDate || '-'}</span>
                </div>
                <div className="flex justify-end gap-3">
                  <span className="text-slate-500 font-semibold">PO Number:</span>
                  <span className="font-bold">{purchase?.purchaseOrderNumber || '-'}</span>
                </div>
                {purchase?.supplierInvoiceNumber && (
                  <div className="flex justify-end gap-3">
                    <span className="text-slate-500 font-semibold">Supplier Invoice:</span>
                    <span className="font-bold">{purchase.supplierInvoiceNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Supplier Details */}
          <div className="mb-6 pb-4 border-b border-dashed border-slate-300 mt-4 pt-2">
            <p className="text-[10px] text-slate-500 font-semibold mb-1">Billed By / Supplier:</p>
            <p className="text-[11px] font-bold text-slate-900">{purchase.supplierName || (purchase.supplier && purchase.supplier.name) || 'Supplier'}</p>
            <p className="text-[9px] text-slate-600">{supplierAddress || '-'}</p>
            {supplierPhone && <p className="text-[9px] text-slate-600">Tel: {supplierPhone}</p>}
            {supplierVat && supplierVat !== 'Not Registered' && (
              <p className="text-[9px] text-slate-600">VAT: {supplierVat}</p>
            )}
          </div>

          {/* Items Table */}
          <div className="mb-6 flex-grow">
            <table className="w-full text-[10px] border-collapse">
              <thead>
                <tr
                  className="border-b-2 border-black text-white"
                  style={{
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact',
                  }}
                >
                  <th
                    className="px-2 py-2 text-center font-bold w-6 bg-black text-white"
                    style={{ backgroundColor: '#000000', color: '#ffffff' }}
                  >
                    No.
                  </th>
                  <th
                    className="px-2 py-2 text-left font-bold bg-black text-white"
                    style={{ backgroundColor: '#000000', color: '#ffffff' }}
                  >
                    DESCRIPTION
                  </th>
                  <th
                    className="px-2 py-2 text-center font-bold w-12 bg-black text-white"
                    style={{ backgroundColor: '#000000', color: '#ffffff' }}
                  >
                    UNIT
                  </th>
                  <th
                    className="px-2 py-2 text-center font-bold w-8 bg-black text-white"
                    style={{ backgroundColor: '#000000', color: '#ffffff' }}
                  >
                    QTY
                  </th>
                  <th
                    className="px-2 py-2 text-right font-bold w-20 bg-black text-white"
                    style={{ backgroundColor: '#000000', color: '#ffffff' }}
                  >
                    UNIT PRICE
                  </th>
                  {purchase?.items?.some(item => (item.discount || item.discountPercent) && Number(item.discount || item.discountPercent) > 0) && (
                    <th
                      className="px-2 py-2 text-right font-bold w-16 bg-black text-white"
                      style={{ backgroundColor: '#000000', color: '#ffffff' }}
                    >
                      DISC (%)
                    </th>
                  )}
                  <th
                    className="px-2 py-2 text-right font-bold w-24 bg-black text-white"
                    style={{ backgroundColor: '#000000', color: '#ffffff' }}
                  >
                    NET AMOUNT
                  </th>
                </tr>
              </thead>
              <tbody>
                {purchase?.items && purchase.items.length > 0 ? (
                  (() => {
                    const hasDiscount = purchase.items.some(item => (item.discount || item.discountPercent) && Number(item.discount || item.discountPercent) > 0);
                    return purchase.items.map((item, index) => (
                      <tr key={index} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="px-2 py-2 text-center text-slate-900 text-[9px]">{index + 1}</td>
                        <td className="px-2 py-2 text-slate-900">{getItemLabel(item)}</td>
                        <td className="px-2 py-2 text-center text-slate-900 text-[9px]">PCS</td>
                        <td className="px-2 py-2 text-center text-slate-900 tabular-nums">{item.quantity || 0}</td>
                        <td className="px-2 py-2 text-right text-slate-900 tabular-nums">{Number(item.unitPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        {hasDiscount && (
                          <td className="px-2 py-2 text-right text-slate-900 tabular-nums">
                            {(() => {
                              const disc = item.discountPercent ?? item.discount;
                              return disc && Number(disc) > 0 ? `${Number(disc)}%` : '-';
                            })()}
                          </td>
                        )}
                        <td className="px-2 py-2 text-right text-slate-900 font-semibold tabular-nums">{Number(item.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    ));
                  })()
                ) : (
                  <tr>
                    <td colSpan={purchase?.items?.some(item => (item.discount || item.discountPercent) && Number(item.discount || item.discountPercent) > 0) ? 7 : 6} className="px-2 py-4 text-center text-slate-400 text-[9px]">No items</td>
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
                <span className="text-[11px] font-semibold tabular-nums">{Number(purchase?.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              
              {purchase?.freight > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Freight</span>
                  <span className="text-[11px] font-semibold tabular-nums">{Number(purchase.freight).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}

              {purchase?.taxBreakdown && purchase.taxBreakdown.length > 0 && (
                purchase.taxBreakdown.map((tax, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{tax.taxType} ({tax.percentage}%)</span>
                    <span className="text-[11px] font-semibold tabular-nums">{Number(tax.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                ))
              )}
              
              <div className="border-t border-white/20 pt-2 mt-2 flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase tracking-wide">Grand Total</span>
                <span className="text-[16px] font-black tabular-nums">{Number(purchase?.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              
              <div className="flex justify-between items-center pt-1 text-green-400">
                <span className="text-[10px] font-semibold uppercase tracking-wide">Amount Paid</span>
                <span className="text-[11px] font-semibold tabular-nums">{Number(purchase?.amountPaid || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between items-center text-red-400">
                <span className="text-[10px] font-semibold uppercase tracking-wide">Balance Due</span>
                <span className="text-[11px] font-semibold tabular-nums">{Number(normalizeMoney(purchase?.balanceDue)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Bank Information - Minimal */}
          <div className="mb-6 pb-4 border-b border-dashed border-slate-300">
            <p className="text-[9px] text-slate-500 font-semibold mb-1">BANK DETAILS</p>
            <p className="text-[9px] font-semibold text-slate-900">{companyProfile?.bankName || 'Bank Name'}</p>
            <p className="text-[9px] text-slate-600">Account: {companyProfile?.accountNumber || '-'}</p>
          </div>

          {purchase?.notes && (
            <div className="mb-6 pb-4 border-b border-dashed border-slate-300">
              <p className="text-[9px] text-slate-500 font-semibold mb-1">MEMO / NOTES</p>
              <p className="text-[9px] text-slate-700 italic">{purchase.notes}</p>
            </div>
          )}

          {/* Signature Block */}
          <div className="mb-8 mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-center">
              <div className="flex flex-col items-center">
                <div className="h-16 w-40 border-b border-slate-400"></div>
                <p className="text-xs text-slate-600 mt-2">PREPARED BY</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-16 w-40 border-b border-slate-400"></div>
                <p className="text-xs text-slate-600 mt-2">CHECKED BY</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-16 w-40 border-b border-slate-400"></div>
                <p className="text-xs text-slate-600 mt-2">AUTHORIZED BY</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-16 w-40 border-b border-slate-400"></div>
                <p className="text-xs text-slate-600 mt-2">CUSTOMER'S SIGNATURE</p>
              </div>
            </div>
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
          .no-print {
            display: none !important;
          }
          .invoice-page,
          #invoice-content,
          #invoice-content * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .invoice-page {
            min-height: auto !important;
          }
          #invoice-content {
            margin: 0 auto !important;
          }

          /* Force table header to print as solid black with white text */
          #invoice-content table thead tr {
            background-color: #000000 !important;
            color: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            border-color: #000000 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ViewPurchase;
