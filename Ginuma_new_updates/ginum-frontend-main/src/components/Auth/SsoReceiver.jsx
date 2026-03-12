import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const SsoReceiver = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    const userId = searchParams.get('userId');
    const orgId = searchParams.get('orgId');

    if (token) {
      // Save authentication data to localStorage ONLY (no sessionStorage)
      localStorage.setItem('auth_token', token);
      localStorage.setItem('token', token);
      
      // Also store with ginuma_ prefix for cross-app navigation
      localStorage.setItem('ginuma_token', token);
      
      if (refreshToken) {
        localStorage.setItem('ginuma_refreshToken', refreshToken);
        localStorage.setItem('refresh_token', refreshToken);
      }
      
      if (userId) {
        localStorage.setItem('ginuma_userId', userId);
        localStorage.setItem('userId', userId);
      }
      
      if (orgId) {
        localStorage.setItem('ginuma_orgId', orgId);
        localStorage.setItem('orgId', orgId);
        // Store as companyId in localStorage (Ginuma expects this key)
        localStorage.setItem('companyId', orgId);
      }

      // Store timestamp for session management
      localStorage.setItem('ginuma_loginTime', new Date().toISOString());

      console.log('SSO: Token received and stored successfully');
      
      // Redirect to app dashboard after successful SSO
      setTimeout(() => {
        navigate('/app/dashboard', { replace: true });
      }, 500);
    } else {
      // No token found, redirect to Knoweb inventory login
      console.warn('SSO: No token found in URL parameters');
      setTimeout(() => {
        window.location.href = 'http://localhost:5173/login';
      }, 1000);
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <div className="flex flex-col items-center space-y-4">
          {/* Animated Spinner */}
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin animation-delay-150"></div>
            </div>
          </div>

          {/* Authenticating Text */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-800">
              Authenticating...
            </h2>
            <p className="text-gray-600">
              Please wait while we securely log you in
            </p>
          </div>

          {/* Progress Dots */}
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce animation-delay-200"></div>
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce animation-delay-400"></div>
          </div>

          {/* Security Badge */}
          <div className="flex items-center space-x-2 text-sm text-gray-500 mt-4">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Secure Single Sign-On</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SsoReceiver;
