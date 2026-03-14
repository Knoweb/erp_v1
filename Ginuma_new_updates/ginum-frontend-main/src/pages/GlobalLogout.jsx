import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

// 🚨 DEBUGGING: Module loaded
console.log('📦 [Ginuma ERP] GlobalLogout.jsx MODULE LOADED');

/**
 * GlobalLogout Component - SSO Logout Chain Handler
 * 
 * This component is part of the SSO (Single Sign-On) logout chain across micro-frontends.
 * 
 * When a user logs out from the Main Dashboard, it triggers a chain of redirects:
 * Main Dashboard (5173) → Inventory (5174) → Ginuma (5176) → Back to Login (5173)
 * 
 * This component:
 * 1. Clears all authentication data (localStorage, sessionStorage)
 * 2. Reads the `returnTo` URL parameter
 * 3. Redirects to the next app in the chain (or final login page)
 * 
 * Usage:
 * Add this route to your AppRouter.jsx as a PUBLIC route (BEFORE PrivateRoute):
 * <Route path="/auth/logout" element={<GlobalLogout />} />
 */
const GlobalLogout = () => {
  const [searchParams] = useSearchParams();

  // 🚨 DEBUGGING: Component mounted
  console.log('🟢 [Ginuma ERP] GlobalLogout component MOUNTED');
  alert('🟢 Ginuma GlobalLogout Component Mounted!');

  useEffect(() => {
    const performLogout = async () => {
      try {
        console.log('🚪 [Ginuma ERP] GlobalLogout triggered - Starting cleanup');
        alert('🚪 Ginuma Logout Executing - Starting cleanup');

        // Get the returnTo parameter from URL
        const returnTo = searchParams.get('returnTo');
        console.log('🔗 [Ginuma ERP] returnTo parameter:', returnTo);

        console.log('🧹 [Ginuma ERP] Clearing localStorage and sessionStorage...');
        alert('🧹 About to clear BOTH localStorage and sessionStorage (auth_token, companyId, role)');

        // 🔴 PHASE 1: Remove specific Ginuma keys from BOTH storages
        console.log('');
        console.log('   📦 Removing from localStorage:');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('companyId');
        localStorage.removeItem('role');
        console.log('      ✅ Specific keys removed from localStorage');

        console.log('   📦 Removing from sessionStorage:');
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('companyId');
        sessionStorage.removeItem('role');
        console.log('      ✅ Specific keys removed from sessionStorage');

        // 🔴 PHASE 2: Nuclear wipe - clear() on BOTH storages
        console.log('');
        console.log('   🧹 Executing full clear() on both storages...');
        localStorage.clear();
        sessionStorage.clear();

        console.log('');
        console.error('💥💥💥 !!! BOTH STORAGES NUKED !!! 💥💥💥');
        console.log('✅ [Ginuma ERP] Storage cleared successfully (auth_token, companyId, role from BOTH storages)');
        alert('✅ BOTH Storages cleared! Redirecting in 150ms...');

        const HOST = window.location.hostname;
        const PROTOCOL = window.location.protocol;
        const IS_LOCAL = HOST === 'localhost' || HOST === '127.0.0.1';
        const mainDashboardUrl = `${PROTOCOL}//${HOST}:${IS_LOCAL ? '5173' : '3000'}`;

        // Determine where to redirect next
        if (returnTo) {
          console.log(`🔗 [Ginuma ERP] Redirecting to final destination: ${returnTo}`);

          // Small delay to ensure storage is fully cleared before redirect
          setTimeout(() => {
            window.location.href = returnTo;
          }, 150);
        } else {
          // Fallback: If no returnTo parameter, redirect to Main Dashboard login
          console.warn('⚠️ [Ginuma ERP] No returnTo parameter found. Redirecting to Main Dashboard login.');
          setTimeout(() => {
            window.location.href = `${mainDashboardUrl}/login`;
          }, 150);
        }
      } catch (error) {
        console.error('❌ [Ginuma ERP] Error during logout:', error);
        alert(`❌ Error during logout: ${error.message}`);
        // Still try to redirect even if there's an error
        const mainDashboardUrl = `${window.location.protocol}//${window.location.hostname}:${(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? '5173' : '3000'}`;
        window.location.href = `${mainDashboardUrl}/login`;
      }
    };

    performLogout();
  }, [searchParams]);

  // Return a full-screen loading state (NOT inside any layout)
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0f172a',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      zIndex: 9999
    }}>
      {/* Spinner */}
      <div style={{
        width: '60px',
        height: '60px',
        border: '5px solid rgba(59, 130, 246, 0.2)',
        borderTop: '5px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        marginBottom: '24px'
      }}></div>

      {/* Title */}
      <h2 style={{
        fontSize: '24px',
        fontWeight: '600',
        marginBottom: '12px',
        color: '#f1f5f9'
      }}>
        Logging out...
      </h2>

      {/* Subtitle */}
      <p style={{
        fontSize: '14px',
        color: '#94a3b8',
        textAlign: 'center',
        maxWidth: '300px'
      }}>
        Clearing session data from Ginuma ERP
      </p>

      {/* Keyframe animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default GlobalLogout;
