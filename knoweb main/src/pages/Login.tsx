import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, LogIn } from 'lucide-react';

/**
 * Login Component for Unified SSO
 * Authenticates users and redirects to dashboard
 */
const Login = () => {
  const host = window.location.hostname;
  const protocol = window.location.protocol;
  const gatewayBaseUrl = import.meta.env.VITE_API_BASE_URL || `${protocol}//${host}:8080`;
  const subscriptionBaseUrl = import.meta.env.VITE_SUBSCRIPTION_BASE_URL || `${protocol}//${host}:8091`;

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call API Gateway (port 8080) instead of identity service directly
      // Gateway will route to identity-service internally
      let response = await fetch(`${gatewayBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.email,  // Backend expects 'username' field (maps to email)
          password: formData.password
        })
      });

      // CROSS-SYSTEM SSO FALLBACK: If user is an Inventory/Manufacturing Role created in Middeniya, 
      // they don't exist in the Main ERP DB! Let's dynamically check Middeniya's DB if Main fails.
      if (!response.ok) {
        const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const middeniyaBackendUrl = IS_LOCAL ? `${protocol}//${host}:8082` : 'http://178.128.221.122:8080';
        
        console.log('Login failed on Main ERP (User not found). Attemping cross-system SSO to Middeniya...');
        
        try {
          const fallbackResponse = await fetch(`${middeniyaBackendUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: formData.email,
              password: formData.password
            })
          });

          if (fallbackResponse.ok) {
            console.log('✅ Succesfully authenticated via Middeniya Database!');
            response = fallbackResponse; // If successful, swap the response so the UI proceeds!
          }
        } catch (fallbackError) {
          console.error('⚠️ Middeniya fallback also failed or unreachable:', fallbackError);
        }
      }

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid email or password');
        }
        throw new Error('Login failed. Please try again.');
      }

      const data = await response.json();
      
      // 🔍 DEBUG: Log the complete response to inspect backend payload
      console.log('Login Response Data:', data);
      console.log('Available keys:', Object.keys(data));
      
      // 🔑 Smart token extraction - Check all common Spring Boot token keys
      const token = data.accessToken || data.jwt || data.token || data.jwtToken;
      
      if (!token) {
        console.error('⚠️ No JWT token found in response. Available keys:', Object.keys(data));
        throw new Error('Authentication successful but no token received. Please contact support.');
      }
      
      console.log('✅ Token extracted successfully:', token.substring(0, 20) + '...');
      
      // 🔒 COMPANY BLOCK CHECK - Verify company is not blocked before granting access
      const orgId = data.orgId;
      
      if (!orgId) {
        console.error('⚠️ No orgId found in response');
        throw new Error('Organization ID not found. Please contact support.');
      }
      
      try {
        console.log(`🔍 Checking block status for orgId: ${orgId}`);
        
        const blockCheckResponse = await fetch(
          `${subscriptionBaseUrl}/api/internal/subscriptions/access/${orgId}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (blockCheckResponse.ok) {
          const accessData = await blockCheckResponse.json();
          console.log('Block check response:', accessData);
          
          // Check if company is blocked
          if (accessData.isBlocked) {
            console.error('🚫 Company is BLOCKED');
            alert('⛔ Your company account has been blocked by the Administrator.\n\nPlease contact support for assistance.');
            throw new Error('Company account is blocked.');
          }
          
          console.log('✅ Company is ACTIVE - access granted');
        } else if (blockCheckResponse.status === 404) {
          // Company not found in subscription service - allow for backwards compatibility
          console.warn('⚠️ Company not found in subscription service, allowing access (fail-open)');
        } else {
          // Other error - log but allow access (fail-open approach)
          console.error('⚠️ Failed to check company block status:', blockCheckResponse.status);
          console.warn('Allowing login to proceed (fail-open)');
        }
      } catch (blockCheckError) {
        // If the error is our custom "Company account is blocked" error, re-throw it
        if (blockCheckError instanceof Error && blockCheckError.message === 'Company account is blocked.') {
          throw blockCheckError;
        }
        
        // Network error or subscription service down - log but allow access
        console.error('⚠️ Error checking company block status:', blockCheckError);
        console.warn('Subscription service may be unavailable, allowing login to proceed (fail-open)');
      }
      
      // Store JWT token first (most critical)
      localStorage.setItem('token', token);
      
      // Store additional user details if available
      const userDetails = {
        orgId: data.orgId || null,
        companyName: data.companyName || null,
        email: data.email || formData.email,
        role: data.role || data.roles?.[0] || 'USER',
        username: data.username || null
      };
      
      console.log('User Details:', userDetails);
      localStorage.setItem('userDetails', JSON.stringify(userDetails));
      
      // Auto-routing based on Roles
      const role = data.role || data.roles?.[0] || 'USER';
      console.log('User Role:', role);

      let targetUrl = '/dashboard'; // Default to main dashboard
      
      const IS_LOCAL = host === 'localhost' || host === '127.0.0.1';
      // IP for Middeniya frontend (Inventory)
      const inventoryDomain = IS_LOCAL ? `${protocol}//${host}:5174` : 'http://178.128.221.122:3002';
      let needsSsoHandoff = false;

      if (role === 'ROLE_INV_STOCK_KEEPER') {
        targetUrl = '/stores';
        needsSsoHandoff = true;
      } else if (role === 'ROLE_INV_MOLDING') {
        targetUrl = '/molding';
        needsSsoHandoff = true;
      } else if (role === 'ROLE_INV_QC') {
        targetUrl = '/qc';
        needsSsoHandoff = true;
      } else if (role === 'ROLE_INV_ASSEMBLE') {
        targetUrl = '/assemble';
        needsSsoHandoff = true;
      } else if (role === 'ROLE_INV_PRIMARY') {
        targetUrl = '/primary';
        needsSsoHandoff = true;
      }
      
      if (needsSsoHandoff) {
        console.log(`🎉 Login successful, SSO redirecting to ${targetUrl} in Middeniya Inventory...`);
        // We use the SsoReceiver component route established in the inventory-frontend
        const ssoUrl = new URL(`${inventoryDomain}/sso-login`);
        ssoUrl.searchParams.append('token', token);
        ssoUrl.searchParams.append('redirectTo', targetUrl);
        if (data.refreshToken) ssoUrl.searchParams.append('refreshToken', data.refreshToken);
        if (data.userId) ssoUrl.searchParams.append('userId', data.userId);
        if (data.orgId) ssoUrl.searchParams.append('orgId', data.orgId);
        
        window.location.href = ssoUrl.toString();
        return; // Prevent navigate below
      }

      // Default Admin and Manager roles redirect to Main Dashboard
      console.log('🎉 Login successful, redirecting to Main Dashboard...');
      navigate('/dashboard');
      
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 bg-purple-400 rounded-full blur-3xl opacity-10 animate-pulse delay-1000"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Back to Home */}
        <Link 
          to="/"
          className="flex items-center text-gray-600 hover:text-gray-900 mb-8 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <LogIn className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to access your systems</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-xl">
              <p className="text-red-700 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="your.email@company.com"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-12 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your password"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-12 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-600 hover:text-gray-900 cursor-pointer">
                <input
                  type="checkbox"
                  className="mr-2 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                Sign up now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
