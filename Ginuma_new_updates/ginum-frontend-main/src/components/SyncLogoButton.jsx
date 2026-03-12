import { useState } from 'react';
import api from '../utils/api';

const SyncLogoButton = () => {
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState('');

  const handleSync = async () => {
    try {
      setSyncing(true);
      setMessage('');
      
      const companyId = localStorage.getItem('companyId');
      if (!companyId) {
        setMessage('❌ Company ID not found');
        return;
      }

      console.log('🔄 Syncing company logo from Knoweb...');
      
      // Call the sync endpoint
      const response = await api.post(`/api/superadmin/companies/sync/${companyId}`);
      
      if (response.success) {
        setMessage('✅ Logo synced successfully! Refreshing page...');
        
        // Wait 2 seconds then reload
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage('❌ Sync failed: ' + response.error);
      }
    } catch (error) {
      console.error('Sync error:', error);
      setMessage('❌ Error: ' + (error.response?.data?.error || error.message));
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-lg">
      <button
        onClick={handleSync}
        disabled={syncing}
        className={`px-6 py-3 rounded-lg font-medium text-white transition-all ${
          syncing 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
        }`}
      >
        {syncing ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Syncing Logo...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Sync Logo from Knoweb
          </span>
        )}
      </button>
      
      {message && (
        <div className={`text-sm px-4 py-2 rounded ${
          message.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}
      
      <p className="text-xs text-gray-500 text-center">
        This will download your logo from Knoweb Inventory <br/>
        and save it to Ginuma database
      </p>
    </div>
  );
};

export default SyncLogoButton;
