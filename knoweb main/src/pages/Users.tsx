import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Users as UsersIcon,
  Plus,
  ArrowLeft,
  Search,
  Shield,
  MapPin,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';

const HOST = window.location.hostname;
const PROTOCOL = window.location.protocol;
const GATEWAY_URL = `${PROTOCOL}//${HOST}:8080`;

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  isActive: boolean;
  orgId: number;
  branchId: number;
}

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    role: 'USER',
  });
  
  // Feedback states
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<User | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [userDetails, setUserDetails] = useState<any>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userDetailsStr = localStorage.getItem('userDetails');

    if (!token || !userDetailsStr) {
      navigate('/login');
      return;
    }

    const parsedUserDetails = JSON.parse(userDetailsStr);
    setUserDetails(parsedUserDetails);
    setJwtToken(token);

    fetchUsers(parsedUserDetails.orgId, token);
  }, [navigate]);

  const fetchUsers = async (orgId: number, token: string) => {
    try {
      setLoading(true);
      const MIDDENIYA_ORG_ID = 16;
      const targetGateway = orgId === MIDDENIYA_ORG_ID ? 'http://178.128.221.122:8080' : GATEWAY_URL;

      const response = await axios.get(`${targetGateway}/api/users/organization/${orgId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load employees.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userDetails || !jwtToken) return;

    try {
      setSubmitting(true);
      // Temporary stub mapping to registration until backend pure-employee endpoint is complete
      const payload = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        orgId: userDetails.orgId,
        industryType: userDetails.industryType || 'MANUFACTURING',
        companyName: userDetails.companyName || 'Company',
        // role is theoretically handled appropriately if backend endpoint is supported
        role: formData.role
      };

      // Determine where the API call should go based on Organization ID
      const MIDDENIYA_ORG_ID = 16;
      let targetGateway = GATEWAY_URL; // Default gateway

      if (userDetails.orgId === MIDDENIYA_ORG_ID) {
        // Reroute to Middeniya specific droplet API Gateway
        targetGateway = 'http://178.128.221.122:8080';
      }

      await axios.post(`${targetGateway}/api/auth/register`, payload, {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      
      setSuccessMessage('Employee profile has been successfully integrated into the system protocols.');
      setShowSuccessModal(true);
      setShowModal(false);
      
      // Reset form
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        role: 'USER',
      });
      
      // Update from correct gateway
      const response = await axios.get(`${targetGateway}/api/users/organization/${userDetails.orgId}`, {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      setUsers(response.data);

    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Access synchronization failed.');
      setShowErrorModal(true);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (user: User) => {
    setItemToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteUser = async () => {
    if (!itemToDelete || !jwtToken) return;
    
    try {
      setSubmitting(true);
      const MIDDENIYA_ORG_ID = 16;
      let targetGateway = GATEWAY_URL;
      if (userDetails?.orgId === MIDDENIYA_ORG_ID) {
        targetGateway = 'http://178.128.221.122:8080';
      }
      
      await axios.delete(`${targetGateway}/api/users/${itemToDelete.id}`, {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      setUsers(users.filter(u => u.id !== itemToDelete.id));
      setShowDeleteModal(false);
      setItemToDelete(null);
      
      setSuccessMessage('Access credentials for the selected employee have been permanently revoked.');
      setShowSuccessModal(true);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to revoke system access.');
      setShowErrorModal(true);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.firstName + ' ' + u.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-slate-500 hover:text-slate-700 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <UsersIcon className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">User & Employee Management</h1>
                  <p className="text-sm text-slate-500">Manage access across ERP, HR, and Inventory</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Add Employee
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative mb-6">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full max-w-md pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 bg-white placeholder-slate-400"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading employees...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : filteredUsers.length === 0 ? (
             <div className="p-8 text-center text-slate-500">No employees found. Add one to get started.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Employee</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Contact</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Role & Access</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Location</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-900">{user.firstName || '-'} {user.lastName || ''}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                        {user.email || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Shield className="w-4 h-4 text-indigo-500" />
                          <span className="text-sm font-medium text-slate-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                            {(user.roles && user.roles[0]) || 'USER'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <MapPin className="w-4 h-4" />
                          Branch: {user.branchId || 'HQ'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => confirmDelete(user)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Revoke Access">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">Add New Employee</h2>
              <button disabled={submitting} onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
                  <input type="text" name="firstName" required value={formData.firstName} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900 placeholder:text-slate-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900 placeholder:text-slate-400" />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Email (Login ID) *</label>
                <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900 placeholder:text-slate-400" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Temporary Password *</label>
                <input type="password" name="password" required minLength={6} value={formData.password} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900 placeholder:text-slate-400" />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">Global System Role *</label>
                <select name="role" required value={formData.role} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900">
                  <optgroup label="General Roles">
                    <option value="ROLE_USER">Basic User</option>
                    <option value="ROLE_MANAGER">Department Manager</option>
                    <option value="ROLE_ORG_ADMIN">Organization Admin</option>
                  </optgroup>
                  <optgroup label="Ginum ERP Roles">
                    <option value="ROLE_ACCOUNTANT">Financial Accountant</option>
                    <option value="ROLE_AUDITOR">Auditor</option>
                  </optgroup>
                  <optgroup label="Inventory/Supply Roles">
                    <option value="ROLE_PROCUREMENT">Procurement Staff</option>
                    <option value="ROLE_SALES_STAFF">Sales & Orders Staff</option>
                    <option value="ROLE_WAREHOUSE_STAFF">General Warehouse Staff</option>
                  </optgroup>
                  <optgroup label="Manufacturing (Middeniya)">
                    <option value="ROLE_INV_STOCK_KEEPER">Stock Keeper</option>
                    <option value="ROLE_INV_MOLDING">Molding Staff</option>
                    <option value="ROLE_INV_QC">Quality Control Inspector</option>
                    <option value="ROLE_INV_ASSEMBLE">Assembly Line Staff</option>
                    <option value="ROLE_INV_PRIMARY">Primary Finishing Staff</option>
                  </optgroup>
                </select>
                <p className="text-xs text-slate-500 mt-1">This role applies across ERP, HR, and Inventory systems.</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" disabled={submitting} onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-700 hover:bg-slate-100 font-medium rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-70">
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    'Save Employee'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="pt-10 pb-4 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-rose-50 flex items-center justify-center mb-8">
                <Trash2 className="w-10 h-10 text-rose-500" />
              </div>
              
              <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Revoke Access</h3>
              <p className="text-center px-10 text-slate-500 font-bold leading-relaxed mb-10">
                Are you sure you want to completely remove <span className="text-slate-900">{itemToDelete?.firstName}</span> from the system? This action cannot be undone.
              </p>
              
              <div className="w-full px-8 flex gap-4 mb-8">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  disabled={submitting}
                  className="flex-1 py-4 bg-slate-50 text-slate-600 font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={submitting}
                  className="flex-1 py-4 bg-rose-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-rose-100 hover:bg-rose-600 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:grayscale"
                >
                  {submitting ? (
                    <RefreshCw className="animate-spin" size={18} />
                  ) : (
                    <>
                      <Trash2 size={18} />
                      Revoke
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 text-center">
            <div className="pt-10 pb-10 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Protocol Successful</h3>
              <p className="px-10 text-slate-500 font-medium mb-8">
                {successMessage}
              </p>
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="px-10 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 text-center">
            <div className="pt-10 pb-10 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mb-6">
                <AlertCircle className="w-10 h-10 text-rose-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Sync Error</h3>
              <p className="px-10 text-slate-500 font-medium mb-8">
                {errorMessage}
              </p>
              <button 
                onClick={() => setShowErrorModal(false)}
                className="px-10 py-3 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-900 transition-all active:scale-95 shadow-lg shadow-slate-100"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
