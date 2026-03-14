import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * SSOLogoutHandler - Standardized SSO Domino Logout Receiver
 * This component clears local context and handles the next hop in the chain.
 */
const SSOLogoutHandler = () => {
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const performLogout = () => {
            // 1. Nuclear wipe of all session and local data
            localStorage.clear();
            sessionStorage.clear();

            // 2. Extract the next destination from the 'returnTo' parameter
            const returnTo = searchParams.get('returnTo');

            // 3. Fallback to Main Dashboard LoginPage if returnTo is missing
            const fallbackUrl = 'http://167.71.206.166:3000/login';

            // 4. Execution with small delay to ensure storage operations complete
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
            fontFamily: 'Inter, system-ui, sans-serif'
        }}>
            <div style={{
                width: '50px',
                height: '50px',
                border: '4px solid rgba(255,255,255,0.1)',
                borderTop: '4px solid #6366f1',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '20px'
            }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '10px' }}>
                Logging out safely...
            </h2>
            <p style={{ color: '#94a3b8' }}>Please wait while we clear your session.</p>
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
