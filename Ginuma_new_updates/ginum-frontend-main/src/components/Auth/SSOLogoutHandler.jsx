import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * SSOLogoutHandler - Standardized SSO Domino Logout Receiver
 * This component handles the nuclear wipe of session data before redirecting.
 */
const SSOLogoutHandler = () => {
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const performLogout = () => {
            // 1. Clear both localStorage and sessionStorage
            localStorage.clear();
            sessionStorage.clear();

            // 2. Extract the next destination from the 'returnTo' parameter
            const returnTo = searchParams.get('returnTo');

            // 3. Fallback to Main Dashboard LoginPage if returnTo is missing
            const fallbackUrl = 'http://167.71.206.166:3000/login';

            // 4. Redirect with a slight delay
            setTimeout(() => {
                window.location.href = returnTo || fallbackUrl;
            }, 500);
        };

        performLogout();
    }, [searchParams]);

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
            color: 'white',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid rgba(255,255,255,0.1)',
                borderTop: '3px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                marginBottom: '16px'
            }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: '500', marginBottom: '8px' }}>
                Logging out safely...
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Finalizing your secure session closure.</p>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default SSOLogoutHandler;
