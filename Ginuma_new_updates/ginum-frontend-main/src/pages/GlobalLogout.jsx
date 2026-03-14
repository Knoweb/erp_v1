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
    const performLogout = () => {
      // 1. Get the returnTo parameter from URL
      const returnTo = searchParams.get('returnTo');

      // 2. Clear ALL authentication data
      localStorage.clear();
      sessionStorage.clear();

      // 3. Redirect to the final destination
      if (returnTo) {
        // Small delay to ensure storage is fully cleared
        setTimeout(() => {
          window.location.href = returnTo;
        }, 100);
      } else {
        // Fallback: If no returnTo parameter, go to Main Dashboard login
        window.location.href = 'http://167.71.206.166:3000/login';
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
