import { useState, useEffect } from 'react';
import { Building2, Shield, ShieldAlert, Loader2, RefreshCw } from 'lucide-react';
import { subscriptionApi } from '../services/subscriptionApi';

const CompanyManagementTab = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blockingOrgId, setBlockingOrgId] = useState(null);


  // Fetch companies on mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await subscriptionApi.getCompanies();
      setCompanies(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch companies');
      console.error('Error fetching companies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockCompany = async (orgId, companyName) => {
    if (!window.confirm(`Are you sure you want to block "${companyName}"? Users will not be able to login.`)) {
      return;
    }

    try {
      setBlockingOrgId(orgId);
      await subscriptionApi.blockCompany(orgId);

      // Success notification
      alert(`Successfully blocked ${companyName}`);

      // Refresh the list
      await fetchCompanies();
    } catch (err) {
      alert(`Failed to block company: ${err.response?.data?.message || err.message}`);
      console.error('Error blocking company:', err);
    } finally {
      setBlockingOrgId(null);
    }
  };

  const handleUnblockCompany = async (orgId, companyName) => {
    if (!window.confirm(`Are you sure you want to unblock "${companyName}"? Users will be able to login again.`)) {
      return;
    }

    try {
      setBlockingOrgId(orgId);
      await subscriptionApi.unblockCompany(orgId);

      // Success notification
      alert(`Successfully unblocked ${companyName}`);

      // Refresh the list
      await fetchCompanies();
    } catch (err) {
      alert(`Failed to unblock company: ${err.response?.data?.message || err.message}`);
      console.error('Error unblocking company:', err);
    } finally {
      setBlockingOrgId(null);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'ACTIVE') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <Shield className="w-3 h-3 mr-1" />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <ShieldAlert className="w-3 h-3 mr-1" />
        Blocked
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading companies...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <ShieldAlert className="w-5 h-5 text-red-600 mr-2" />
          <p className="text-red-800">{error}</p>
        </div>
        <button
          onClick={fetchCompanies}
          className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Building2 className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Company Management</h2>
        </div>
        <button
          onClick={fetchCompanies}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Total Companies</p>
          <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4 border border-green-200">
          <p className="text-sm text-green-600">Active Companies</p>
          <p className="text-2xl font-bold text-green-900">
            {companies.filter(c => c.status === 'ACTIVE').length}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-4 border border-red-200">
          <p className="text-sm text-red-600">Blocked Companies</p>
          <p className="text-2xl font-bold text-red-900">
            {companies.filter(c => c.status === 'BLOCKED').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Org ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No companies found</p>
                  </td>
                </tr>
              ) : (
                companies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {company.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                        {company.orgId}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {company.companyName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {company.contactEmail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getStatusBadge(company.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(company.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      {company.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleBlockCompany(company.orgId, company.companyName)}
                          disabled={blockingOrgId === company.orgId}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {blockingOrgId === company.orgId ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Blocking...
                            </>
                          ) : (
                            <>
                              <ShieldAlert className="w-3 h-3 mr-1" />
                              Block
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnblockCompany(company.orgId, company.companyName)}
                          disabled={blockingOrgId === company.orgId}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {blockingOrgId === company.orgId ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Unblocking...
                            </>
                          ) : (
                            <>
                              <Shield className="w-3 h-3 mr-1" />
                              Unblock
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CompanyManagementTab;
