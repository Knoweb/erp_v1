import { useState, useEffect } from 'react';
import { Check, X, Download, Eye, Mail, Building2, CreditCard, AlertTriangle, Info, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface PaymentReceipt {
  id: string;
  companyId: string;
  companyName: string;
  email: string;
  logoPath?: string;
  packageType: 'ginum' | 'pirisahr' | 'inventory' | 'all';
  amount: number;
  paymentMethod: string;
  transactionId: string;
  paymentDate: string;
  receiptUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  subscriptionMonths: number;
}

interface CompanySubscription {
  companyId: string;
  companyName: string;
  email: string;
  trialStartDate: string;
  trialEndDate: string;
  subscriptionStatus: 'trial' | 'active' | 'expired';
  subscriptionEndDate?: string;
  ginum: boolean;
  pirisahr: boolean;
  inventory: boolean;
}

const SubscriptionManager = () => {
  const [pendingReceipts, setPendingReceipts] = useState<PaymentReceipt[]>([]);
  const [companies, setCompanies] = useState<CompanySubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activationMonths, setActivationMonths] = useState<number | "">(1);
  const [activeTab, setActiveTab] = useState<'pending' | 'companies'>('pending');
  const [viewingReceipt, setViewingReceipt] = useState<PaymentReceipt | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [actionCompany, setActionCompany] = useState<any | null>(null);
  const [actionType, setActionType] = useState<'block' | 'unblock' | 'delete' | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPendingReceipts();
    fetchCompanies();
  }, []);

  const fetchPendingReceipts = async () => {
    try {
      const host = window.location.hostname;
      const protocol = window.location.protocol;
      // Use subscription-service port 8091 for subscription-related calls
      const API_BASE_URL = import.meta.env.VITE_SUBSCRIPTION_BASE_URL || `${protocol}//${host}:8091`;
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/superadmin/subscriptions/payments/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        setLoading(false);
        return;
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        setPendingReceipts(data);
      }
    } catch (error) {
      console.error('Error fetching receipts:', error);
      setPendingReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const host = window.location.hostname;
      const protocol = window.location.protocol;
      const API_BASE_URL = import.meta.env.VITE_SUBSCRIPTION_BASE_URL || `${protocol}//${host}:8091`;

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/superadmin/subscriptions/companies`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        setCompanies(data);
      }
    } catch (error) {
      console.warn('Error fetching companies, using empty list:', error);
      setCompanies([]);
    }
  };

  const handleApprovePayment = async (receipt: PaymentReceipt) => {
    setSelectedReceipt(receipt);
    setActivationMonths(receipt.subscriptionMonths);
    setShowModal(true);
  };

  const confirmApproval = async () => {
    if (!selectedReceipt) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/superadmin/payments/approve', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiptId: selectedReceipt.id,
          companyId: selectedReceipt.companyId,
          packageType: selectedReceipt.packageType,
          months: activationMonths,
        }),
      });

      if (!response.ok) {
        alert('Backend API not yet implemented. Please check the backend server.');
        return;
      }

      const data = await response.json();
      if (data.success) {
        alert('Subscription activated successfully!');
        fetchPendingReceipts();
        fetchCompanies();
        setShowModal(false);
        setSelectedReceipt(null);
      } else {
        alert('Failed to activate subscription: ' + data.message);
      }
    } catch (error) {
      console.error('Error approving payment:', error);
      alert('Error: Backend API is not available yet');
    }
  };

  const handleRejectPayment = async (receiptId: string) => {
    if (!confirm('Are you sure you want to reject this payment?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/superadmin/payments/reject', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ receiptId }),
      });

      if (!response.ok) {
        alert('Backend API not yet implemented. Please check the backend server.');
        return;
      }

      const data = await response.json();
      if (data.success) {
        alert('Payment rejected');
        fetchPendingReceipts();
      } else {
        alert('Failed to reject payment: ' + data.message);
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      alert('Error: Backend API is not available yet');
    }
  };

  const generateReceiptPDF = (receipt: PaymentReceipt) => {
    const doc = new jsPDF();

    // Set document properties
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Header background
    doc.setFillColor(30, 64, 175); // Blue color
    doc.rect(0, 0, pageWidth, 35, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", 'bold');
    doc.text('PAYMENT RECEIPT', pageWidth / 2, 22, { align: 'center' });

    // Company name
    doc.setFontSize(12);
    doc.setFont("helvetica", 'normal');
    doc.text('KNOWEB SYSTEMS', pageWidth / 2, 30, { align: 'center' });

    yPosition = 45;

    // Reset text color to black
    doc.setTextColor(0, 0, 0);

    // Separator line
    doc.setDrawColor(200, 200, 200);
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 8;

    // Section 1: Transaction Info
    doc.setFontSize(12);
    doc.setFont("helvetica", 'bold');
    doc.text('TRANSACTION INFORMATION', 15, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", 'normal');
    doc.text(`Transaction ID: ${receipt.transactionId}`, 15, yPosition);
    yPosition += 6;
    doc.text(`Date: ${new Date(receipt.paymentDate).toLocaleString()}`, 15, yPosition);
    yPosition += 10;

    // Separator line
    doc.setDrawColor(200, 200, 200);
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 8;

    // Section 2: Company Information
    doc.setFontSize(12);
    doc.setFont("helvetica", 'bold');
    doc.text('COMPANY INFORMATION', 15, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", 'normal');
    doc.text(`Company Name: ${receipt.companyName}`, 15, yPosition);
    yPosition += 6;
    doc.text(`Email: ${receipt.email}`, 15, yPosition);
    yPosition += 10;

    // Separator line
    doc.setDrawColor(200, 200, 200);
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 8;

    // Section 3: Payment Details
    doc.setFontSize(12);
    doc.setFont("helvetica", 'bold');
    doc.text('PAYMENT DETAILS', 15, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", 'normal');
    doc.text(`System: ${getPackageName(receipt.packageType)}`, 15, yPosition);
    yPosition += 6;
    doc.text(`Amount Paid: $${receipt.amount}.00 USD`, 15, yPosition);
    yPosition += 6;
    doc.text(`Payment Method: ${receipt.paymentMethod}`, 15, yPosition);
    yPosition += 6;
    doc.text(`Subscription Period: ${receipt.subscriptionMonths} Month(s)`, 15, yPosition);
    yPosition += 10;

    // Separator line
    doc.setDrawColor(200, 200, 200);
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 8;

    // Section 4: Status
    doc.setFontSize(12);
    doc.setFont("helvetica", 'bold');
    doc.text('PAYMENT STATUS', 15, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", 'normal');
    const statusColors = {
      pending: { r: 230, g: 126, b: 34 },
      approved: { r: 39, g: 174, b: 96 },
      rejected: { r: 231, g: 76, b: 60 }
    };
    const color = statusColors[receipt.status] || statusColors.pending;
    doc.setTextColor(color.r, color.g, color.b);
    const statusText = receipt.status.charAt(0).toUpperCase() + receipt.status.slice(1);
    doc.text(`Status: ${statusText}`, 15, yPosition);
    yPosition += 10;

    // Footer message
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    const footerText = 'This receipt has been generated for record-keeping purposes. Thank you for your business!';
    doc.text(footerText, 15, yPosition, { maxWidth: pageWidth - 30, align: 'justify' });

    // Final separator line at bottom
    yPosition = pageHeight - 15;
    doc.setDrawColor(200, 200, 200);
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 5;

    // Copyright
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('© KNOWEB SYSTEMS - All Rights Reserved', pageWidth / 2, pageHeight - 8, { align: 'center' });

    return doc;
  };

  const handleViewReceipt = (receipt: PaymentReceipt) => {
    setViewingReceipt(receipt);
    setShowReceiptModal(true);
  };

  const handleDownloadReceipt = (receipt: PaymentReceipt) => {
    const doc = generateReceiptPDF(receipt);
    doc.save(`Payment_Receipt_${receipt.transactionId}.pdf`);
  };

  const openActionModal = (company: any, type: 'block' | 'unblock' | 'delete') => {
    setActionCompany(company);
    setActionType(type);
    setIsActionModalOpen(true);
  };

  const handleCompanyAction = async () => {
    if (!actionCompany || !actionType) return;
    setActionLoading(true);
    
    try {
      const host = window.location.hostname;
      const protocol = window.location.protocol;
      const API_BASE_URL = import.meta.env.VITE_SUBSCRIPTION_BASE_URL || `${protocol}//${host}:8091`;
      const token = localStorage.getItem('token');
      
      let url = '';
      let method = '';
      
      if (actionType === 'block') {
        url = `${API_BASE_URL}/api/superadmin/subscriptions/companies/${actionCompany.orgId}/block`;
        method = 'PUT';
      } else if (actionType === 'unblock') {
        url = `${API_BASE_URL}/api/superadmin/subscriptions/companies/${actionCompany.orgId}/unblock`;
        method = 'PUT';
      } else if (actionType === 'delete') {
        url = `${API_BASE_URL}/api/superadmin/subscriptions/companies/${actionCompany.orgId}`;
        method = 'DELETE';
      }

      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setIsActionModalOpen(false);
        setActionCompany(null);
        setActionType(null);
        fetchCompanies();
      } else {
        alert('Action failed. Please try again.');
      }
    } catch (error) {
      console.error(`Error performing ${actionType}:`, error);
      alert('An error occurred while performing the action.');
    } finally {
      setActionLoading(false);
    }
  };



  const getPackageName = (packageType: string) => {
    const packages: Record<string, string> = {
      ginum: 'Ginum System',
      pirisahr: 'PirisaHR',
      inventory: 'Inventory System',
      all: 'All Systems Package',
    };
    return packages[packageType] || packageType;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'pending'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span>Pending Payments</span>
              {pendingReceipts.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {pendingReceipts.length}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('companies')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'companies'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Building2 className="w-4 h-4" />
              <span>Company Subscriptions</span>
            </div>
          </button>
        </div>
      </div>

      {/* Pending Payments Tab */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Pending Payment Approvals</h2>

            {pendingReceipts.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No pending payments</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingReceipts.map((receipt) => (
                  <div
                    key={receipt.id}
                    className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        {receipt.logoPath ? (
                          <img
                            src={receipt.logoPath ? (receipt.logoPath.startsWith('http') ? receipt.logoPath : `http://68.183.239.249:8082/uploads/logos/${receipt.logoPath}`) : ''}
                            alt={receipt.companyName}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{receipt.companyName}</h3>
                          <p className="text-sm text-gray-500">{receipt.email}</p>
                          <div className="mt-3 grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500">Package</p>
                              <p className="text-sm font-medium text-gray-900">{getPackageName(receipt.packageType)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Amount</p>
                              <p className="text-sm font-medium text-gray-900">${receipt.amount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Payment Method</p>
                              <p className="text-sm font-medium text-gray-900">{receipt.paymentMethod}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Transaction ID</p>
                              <p className="text-sm font-medium text-gray-900">{receipt.transactionId}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Date</p>
                              <p className="text-sm font-medium text-gray-900">
                                {new Date(receipt.paymentDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Duration</p>
                              <p className="text-sm font-medium text-gray-900">{receipt.subscriptionMonths} Month(s)</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => handleViewReceipt(receipt)}
                          className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Receipt
                        </button>
                        <button
                          onClick={() => handleDownloadReceipt(receipt)}
                          className="inline-flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </button>
                        <button
                          onClick={() => handleApprovePayment(receipt)}
                          className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectPayment(receipt.id)}
                          className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Companies Tab */}
      {activeTab === 'companies' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Company Subscriptions</h2>

            {companies.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No companies registered</p>
              </div>
            ) : (
              <div className="space-y-4">
                {companies.map((company: any) => (
                  <div
                    key={company.orgId}
                    className={`border rounded-lg p-6 transition-all ${
                      company.status === 'BLOCKED' ? 'bg-red-50 border-red-200' : 'hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">{company.companyName}</h3>
                          {company.status === 'BLOCKED' ? (
                            <span className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-bold animate-pulse">
                              BLOCKED
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                              ACTIVE
                            </span>
                          )}
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            Org ID: {company.orgId}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-500 mb-4 flex items-center">
                          <Mail className="w-4 h-4 mr-2" />
                          {company.contactEmail}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-500">Registered On</p>
                            <p className="text-sm font-medium text-gray-900">
                              {company.createdAt ? new Date(company.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Industry</p>
                            <p className="text-sm font-medium text-gray-900 uppercase">
                              {company.industryType || 'GENERAL'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 mb-4">
                          <p className="text-sm font-medium text-gray-600">Subscribed Systems:</p>
                          {Array.isArray(company.subscribedSystems) && company.subscribedSystems.length > 0 ? (
                            company.subscribedSystems.map((sys: string) => (
                              <span key={sys} className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-bold uppercase">
                                {sys}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400 italic">No specific systems listed</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        {company.status === 'BLOCKED' ? (
                          <button
                            onClick={() => openActionModal(company, 'unblock')}
                            className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Unblock
                          </button>
                        ) : (
                          <button
                            onClick={() => openActionModal(company, 'block')}
                            className="inline-flex items-center justify-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Block
                          </button>
                        )}
                        
                        <button
                          onClick={() => openActionModal(company, 'delete')}
                          className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                          <Download className="w-4 h-4 mr-2 rotate-180" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Approval Confirmation Modal */}
      {showModal && selectedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Subscription Activation</h3>

            <div className="space-y-3 mb-6">
              <div>
                <p className="text-sm text-gray-600">Company</p>
                <p className="font-semibold text-gray-900">{selectedReceipt.companyName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Package</p>
                <p className="font-semibold text-gray-900">{getPackageName(selectedReceipt.packageType)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Amount Paid</p>
                <p className="font-semibold text-gray-900">${selectedReceipt.amount.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Subscription Duration (Months)
                </label>
                <input
                  type="number"
                  min="1"
                  max="36"
                  value={activationMonths || ""}
                  onChange={(e) =>
                    setActivationMonths(e.target.value ? parseInt(e.target.value) : "")
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                            text-black bg-white
                            focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

            </div>

            <div className="flex space-x-3">
              <button
                onClick={confirmApproval}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Confirm & Activate
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedReceipt(null);
                }}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Viewing Modal */}
      {showReceiptModal && viewingReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Payment Receipt</h3>
              <button
                onClick={() => {
                  setShowReceiptModal(false);
                  setViewingReceipt(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Body - PDF Preview */}
            <div className="flex-1 overflow-y-auto">
              <iframe
                srcDoc={`
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <style>
                      body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                      .receipt { max-width: 8.5in; margin: 0 auto; }
                    </style>
                  </head>
                  <body>
                    <div class="receipt">
                      <div style="background: linear-gradient(135deg, #1e40af 0%, #06b6d4 100%); color: white; padding: 30px; text-align: center; border-radius: 8px; margin-bottom: 30px;">
                        <h1 style="margin: 0; font-size: 32px;">PAYMENT RECEIPT</h1>
                        <p style="margin: 5px 0 0 0;">KNOWEB SYSTEMS</p>
                      </div>

                      <div style="border-bottom: 2px solid #ddd; padding-bottom: 15px; margin-bottom: 15px;">
                        <h2 style="margin: 0 0 10px 0; color: #1e40af;">TRANSACTION INFORMATION</h2>
                        <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${viewingReceipt.transactionId}</p>
                        <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(viewingReceipt.paymentDate).toLocaleString()}</p>
                      </div>

                      <div style="border-bottom: 2px solid #ddd; padding-bottom: 15px; margin-bottom: 15px;">
                        <h2 style="margin: 0 0 10px 0; color: #1e40af;">COMPANY INFORMATION</h2>
                        <p style="margin: 5px 0;"><strong>Company Name:</strong> ${viewingReceipt.companyName}</p>
                        <p style="margin: 5px 0;"><strong>Email:</strong> ${viewingReceipt.email}</p>
                      </div>

                      <div style="border-bottom: 2px solid #ddd; padding-bottom: 15px; margin-bottom: 15px;">
                        <h2 style="margin: 0 0 10px 0; color: #1e40af;">PAYMENT DETAILS</h2>
                        <p style="margin: 5px 0;"><strong>System:</strong> ${getPackageName(viewingReceipt.packageType)}</p>
                        <p style="margin: 5px 0;"><strong>Amount Paid:</strong> $${viewingReceipt.amount}.00 USD</p>
                        <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${viewingReceipt.paymentMethod}</p>
                        <p style="margin: 5px 0;"><strong>Subscription Period:</strong> ${viewingReceipt.subscriptionMonths} Month(s)</p>
                      </div>

                      <div style="border-bottom: 2px solid #ddd; padding-bottom: 15px; margin-bottom: 15px;">
                        <h2 style="margin: 0 0 10px 0; color: #1e40af;">PAYMENT STATUS</h2>
                        <p style="margin: 5px 0;" id="statusP"><strong>Status:</strong> <span style="color: ${viewingReceipt.status === 'approved' ? '#22c55e' : viewingReceipt.status === 'rejected' ? '#ef4444' : '#e67e22'}">${viewingReceipt.status.charAt(0).toUpperCase() + viewingReceipt.status.slice(1)}</span></p>
                      </div>

                      <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px;">
                        This receipt has been generated for record-keeping purposes. Thank you for your business!
                      </p>
                      <p style="color: #999; font-size: 10px; text-align: center; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px;">
                        © KNOWEB SYSTEMS - All Rights Reserved
                      </p>
                    </div>
                  </body>
                  </html>
                `}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
              />
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 space-x-3">
              <button
                onClick={() => handleDownloadReceipt(viewingReceipt)}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </button>
              <button
                onClick={() => {
                  setShowReceiptModal(false);
                  setViewingReceipt(null);
                }}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Action Confirmation Modal */}
      {isActionModalOpen && actionCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              {actionType === 'delete' ? (
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle size={32} />
                </div>
              ) : actionType === 'block' ? (
                <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle size={32} />
                </div>
              ) : (
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <Info size={32} />
                </div>
              )}
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {actionType === 'delete' && 'Delete Company'}
                {actionType === 'block' && 'Block Company'}
                {actionType === 'unblock' && 'Unblock Company'}
              </h3>
              
              <p className="text-gray-500 mb-6">
                {actionType === 'delete' && (
                  <>Are you sure you want to permanently delete <strong>{actionCompany.companyName}</strong>? This will remove all subscriptions and payment history. This action cannot be undone.</>
                )}
                {actionType === 'block' && (
                  <>Are you sure you want to block <strong>{actionCompany.companyName}</strong>? This will prevent all users from this organization from logging in.</>
                )}
                {actionType === 'unblock' && (
                  <>Are you sure you want to unblock <strong>{actionCompany.companyName}</strong>? This will restore their access to the systems.</>
                )}
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setIsActionModalOpen(false);
                  setActionCompany(null);
                  setActionType(null);
                }}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCompanyAction}
                disabled={actionLoading}
                className={`flex-1 px-4 py-3 text-white rounded-xl transition-colors font-semibold flex items-center justify-center ${
                  actionType === 'delete' ? 'bg-red-600 hover:bg-red-700' : 
                  actionType === 'block' ? 'bg-orange-500 hover:bg-orange-600' : 
                  'bg-green-600 hover:bg-green-700'
                } disabled:opacity-50`}
              >
                {actionLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {actionType === 'delete' && 'Yes, Delete'}
                    {actionType === 'block' && 'Yes, Block'}
                    {actionType === 'unblock' && 'Yes, Unblock'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManager;
