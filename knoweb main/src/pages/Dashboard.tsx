import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Briefcase,
  Package,
  AlertCircle,
  Loader2,
  LogOut,
  User,
  Building2,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  Crown,
  Check,
  Clock
} from 'lucide-react';
import { getMySubscribedSystems, type SystemAccessResponse } from '../services/subscriptionApi';

const HOST = window.location.hostname;
const PROTOCOL = window.location.protocol;
const IS_LOCAL = HOST === 'localhost' || HOST === '127.0.0.1';

const URLS = {
  main: `${PROTOCOL}//${HOST}:${IS_LOCAL ? '5173' : '3000'}`,
  ginuma: `${PROTOCOL}//${HOST}:${IS_LOCAL ? '5176' : '3001'}`,
  inventory: `${PROTOCOL}//${HOST}:${IS_LOCAL ? '5174' : '3002'}`,
  pirisahr: `${PROTOCOL}//${HOST}:${IS_LOCAL ? '5175' : '3003'}`,
  subscription: `${PROTOCOL}//${HOST}:8091`,
  gateway: `${PROTOCOL}//${HOST}:8080`
};

// All available systems in the platform
const ALL_AVAILABLE_SYSTEMS = ['GINUMA', 'INVENTORY', 'PIRISAHR', 'ALL_IN_ONE'];

// System metadata for display
const SYSTEM_INFO: Record<string, {
  name: string;
  description: string;
  color: string;
  icon: typeof Briefcase;
  features: string[];
  frontendUrl: string;
}> = {
  GINUMA: {
    name: 'Ginuma ERP',
    description: 'Complete business management solution with HR, Payroll, Accounting, and CRM capabilities.',
    color: 'from-blue-600 to-cyan-500',
    icon: Briefcase,
    features: ['Employee Management', 'Payroll Processing', 'Financial Accounting', 'Customer Relationship Management'],
    frontendUrl: URLS.ginuma
  },
  INVENTORY: {
    name: 'Inventory System',
    description: 'Advanced warehouse and supply chain management with real-time stock tracking and order processing.',
    color: 'from-green-600 to-emerald-500',
    icon: Package,
    features: ['Stock Management', 'Warehouse Operations', 'Order Processing', 'Supplier Management'],
    frontendUrl: URLS.inventory
  },
  PIRISAHR: {
    name: 'PirisaHR',
    description: 'Comprehensive HR management system with employee records, attendance, and performance tracking.',
    color: 'from-purple-600 to-pink-500',
    icon: User,
    features: ['Employee Records', 'Attendance Tracking', 'Leave Management', 'Performance Reviews'],
    frontendUrl: URLS.pirisahr
  },
  ALL_IN_ONE: {
    name: 'All-in-One Suite',
    description: 'Complete integrated platform with all systems: Ginuma ERP, Inventory, and PirisaHR.',
    color: 'from-orange-600 to-red-500',
    icon: Sparkles,
    features: ['Full ERP Access', 'Complete Inventory Management', 'Comprehensive HR Suite', 'Unified Dashboard'],
    frontendUrl: URLS.main
  }
};

// Pricing packages for each system
type PricingTier = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  buttonText: string;
};

const PRICING_PACKAGES: Record<string, PricingTier[]> = {
  GINUMA: [
    {
      name: 'Starter',
      price: '$29',
      period: 'per month',
      description: 'Perfect for small businesses just getting started',
      features: [
        'Up to 10 employees',
        'Basic payroll processing',
        'Simple accounting',
        'Email support',
        '5 GB storage'
      ],
      buttonText: 'Choose Starter'
    },
    {
      name: 'Business',
      price: '$79',
      period: 'per month',
      description: 'Ideal for growing companies',
      features: [
        'Up to 50 employees',
        'Advanced payroll & benefits',
        'Complete accounting suite',
        'Priority email & chat support',
        '50 GB storage',
        'Custom reports',
        'API access'
      ],
      isPopular: true,
      buttonText: 'Choose Business'
    },
    {
      name: 'Enterprise',
      price: '$199',
      period: 'per month',
      description: 'For large organizations with complex needs',
      features: [
        'Unlimited employees',
        'Full ERP capabilities',
        'Advanced analytics & BI',
        '24/7 phone & dedicated support',
        'Unlimited storage',
        'Custom integrations',
        'White-label options',
        'SLA guarantee'
      ],
      buttonText: 'Choose Enterprise'
    }
  ],
  INVENTORY: [
    {
      name: 'Basic',
      price: '$39',
      period: 'per month',
      description: 'Essential inventory management',
      features: [
        'Up to 500 products',
        '2 warehouse locations',
        'Basic stock tracking',
        'Order management',
        'Email support'
      ],
      buttonText: 'Choose Basic'
    },
    {
      name: 'Professional',
      price: '$99',
      period: 'per month',
      description: 'Advanced features for serious operations',
      features: [
        'Up to 5,000 products',
        '10 warehouse locations',
        'Real-time stock tracking',
        'Advanced order processing',
        'Barcode scanning',
        'Supplier management',
        'Priority support',
        '100 GB storage'
      ],
      isPopular: true,
      buttonText: 'Choose Professional'
    },
    {
      name: 'Enterprise',
      price: '$249',
      period: 'per month',
      description: 'Complete supply chain solution',
      features: [
        'Unlimited products',
        'Unlimited warehouses',
        'Multi-channel integration',
        'Advanced analytics',
        'Custom workflows',
        'API & webhooks',
        '24/7 dedicated support',
        'Unlimited storage'
      ],
      buttonText: 'Choose Enterprise'
    }
  ],
  PIRISAHR: [
    {
      name: 'Essentials',
      price: '$49',
      period: 'per month',
      description: 'Core HR management features',
      features: [
        'Up to 25 employees',
        'Employee records',
        'Attendance tracking',
        'Leave management',
        'Basic reporting'
      ],
      buttonText: 'Choose Essentials'
    },
    {
      name: 'Standard',
      price: '$129',
      period: 'per month',
      description: 'Comprehensive HR suite',
      features: [
        'Up to 100 employees',
        'Performance reviews',
        'Training management',
        'Document management',
        'Advanced analytics',
        'Mobile app access',
        'Priority support',
        'Custom workflows'
      ],
      isPopular: true,
      buttonText: 'Choose Standard'
    },
    {
      name: 'Premium',
      price: '$299',
      period: 'per month',
      description: 'Enterprise-grade HR platform',
      features: [
        'Unlimited employees',
        'Talent acquisition',
        'Succession planning',
        'Advanced compliance',
        'AI-powered insights',
        'Custom integrations',
        '24/7 dedicated support',
        'White-label options'
      ],
      buttonText: 'Choose Premium'
    }
  ],
  ALL_IN_ONE: [
    {
      name: 'Complete Starter',
      price: '$99',
      period: 'per month',
      description: 'All systems bundled for small teams',
      features: [
        'Ginuma ERP - Starter',
        'Inventory - Basic',
        'PirisaHR - Essentials',
        'Unified dashboard',
        'Cross-system reporting',
        'Email support'
      ],
      buttonText: 'Choose Complete'
    },
    {
      name: 'Complete Business',
      price: '$249',
      period: 'per month',
      description: 'Full suite for growing organizations',
      features: [
        'Ginuma ERP - Business',
        'Inventory - Professional',
        'PirisaHR - Standard',
        'Advanced analytics',
        'API access',
        'Priority support',
        'Custom integrations',
        'Save 20% vs individual plans'
      ],
      isPopular: true,
      buttonText: 'Choose Complete Business'
    },
    {
      name: 'Complete Enterprise',
      price: '$599',
      period: 'per month',
      description: 'Ultimate platform for enterprises',
      features: [
        'All Enterprise features',
        'Unlimited everything',
        'Dedicated account manager',
        '24/7 premium support',
        'Custom development',
        'White-label options',
        'SLA guarantee',
        'Save 35% vs individual plans'
      ],
      buttonText: 'Choose Complete Enterprise'
    }
  ]
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [systemData, setSystemData] = useState<SystemAccessResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upgradingSystem, setUpgradingSystem] = useState<string | null>(null);
  const [showBlockedModal, setShowBlockedModal] = useState(false);

  useEffect(() => {
    const fetchSubscribedSystems = async () => {
      try {
        // Get user details from localStorage (set during login)
        const userDetailsStr = localStorage.getItem('userDetails');

        if (!userDetailsStr) {
          setError('No user session found. Please log in.');
          setLoading(false);
          // Redirect to login after 2 seconds
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        const userDetails = JSON.parse(userDetailsStr);
        const orgId = userDetails?.orgId;

        if (!orgId) {
          setError('Organization ID not found. Please log in again.');
          setLoading(false);
          return;
        }

        // Fetch subscribed systems from API
        const response = await getMySubscribedSystems(orgId);

        // 🚨 CRITICAL: Check if account is blocked BEFORE setting any state
        if (response.isBlocked || response.status === 'BLOCKED') {
          // Show custom modal instead of browser alert
          setShowBlockedModal(true);
          setLoading(false);
          return; // Exit early - do NOT render dashboard
        }

        setSystemData(response);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load your systems. Please try again later.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscribedSystems();
  }, [navigate]);

  const handleSystemLaunch = (systemCode: string, frontendUrl: string) => {
    // Get JWT token from localStorage
    const jwtToken = localStorage.getItem('token');

    if (!jwtToken) {
      alert('No authentication token found. Please log in again.');
      navigate('/login');
      return;
    }

    // Store token in sessionStorage for the target system to pick up
    sessionStorage.setItem('sso_token', jwtToken);

    // Store orgId and other user details for the target system
    const userDetailsStr = localStorage.getItem('userDetails');
    let ssoParams = `token=${encodeURIComponent(jwtToken)}`;

    if (userDetailsStr) {
      try {
        const userDetails = JSON.parse(userDetailsStr);
        sessionStorage.setItem('sso_orgId', userDetails.orgId?.toString() || '');

        // Add user details as URL parameters for SSO
        if (userDetails.orgId) ssoParams += `&orgId=${encodeURIComponent(userDetails.orgId)}`;
        if (userDetails.email) ssoParams += `&email=${encodeURIComponent(userDetails.email)}`;
        if (userDetails.role) ssoParams += `&role=${encodeURIComponent(userDetails.role)}`;
        if (userDetails.username) ssoParams += `&username=${encodeURIComponent(userDetails.username)}`;
      } catch (e) {
        // Failed to parse userDetails - continue without them
      }
    }

    // Build the login URL with base path for systems that require it
    let loginPath = '/login';

    // Ginuma ERP uses /account as base public URL with SSO endpoint
    if (systemCode === 'GINUMA') {
      loginPath = '/account/sso-login';
    }

    // Open the login page with SSO token for seamless authentication
    const urlWithToken = `${frontendUrl}${loginPath}?${ssoParams}`;
    window.open(urlWithToken, '_blank');
  };

  /**
 * Single Sign-Out (SSO) Logout Chain
 * Flow: Dashboard -> Inventory -> Ginuma -> Final Destination
 */
  const handleLogout = () => {
    // 1. Clear local session for the Main Dashboard
    localStorage.clear();
    sessionStorage.clear();

    // Reference URLs (As per your platform configuration)
    const URLS = {
      inventory: "http://167.71.206.166:3002",
      ginuma: "http://167.71.206.166:3001"
    };

    // Final destination after all systems are cleared
    const FINAL_DESTINATION = "http://167.71.206.166:3000/login";

    try {
      // 2. Build the domino-effect redirect chain
      // Step B: Ginuma clears its state and then sends user to the Final Login
      const ginumaLogoutPath = "/account/auth/logout";
      const ginumaChain = `${URLS.ginuma}${ginumaLogoutPath}?returnTo=${encodeURIComponent(FINAL_DESTINATION)}`;

      // Step A: Inventory clears its state and then sends user to Ginuma
      // Note: This becomes the entry point for the redirect chain
      const logoutChainUrl = `${URLS.inventory}/logout?returnTo=${encodeURIComponent(ginumaChain)}`;

      // 3. Safety validation check
      // We strictly verify that the Ginuma logout path is present in the final string
      if (logoutChainUrl.includes(ginumaLogoutPath)) {
        window.location.href = logoutChainUrl;
      } else {
        throw new Error("Invalid SSO Logout Chain: Missing required logout paths.");
      }
    } catch (error) {
      console.error("SSO Logout Failure:", error);
      // Emergency Fallback: If the chain construction fails, force redirect to main login
      window.location.href = FINAL_DESTINATION;
    }
  };


  const handleUpgradeSystem = async (systemName: string) => {
    // Show browser confirmation
    const confirmed = window.confirm(
      `Are you sure you want to subscribe to ${SYSTEM_INFO[systemName]?.name || systemName}?\n\nThis will add the system to your active subscriptions.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpgradingSystem(systemName);

      // Get JWT token from localStorage
      const jwtToken = localStorage.getItem('token');
      if (!jwtToken) {
        alert('Authentication token not found. Please log in again.');
        navigate('/login');
        return;
      }

      // Get orgId from localStorage
      const userDetailsStr = localStorage.getItem('userDetails');
      if (!userDetailsStr) {
        alert('Session expired. Please log in again.');
        navigate('/login');
        return;
      }

      const userDetails = JSON.parse(userDetailsStr);
      const orgId = userDetails?.orgId;

      if (!orgId) {
        alert('Organization ID not found. Please log in again.');
        navigate('/login');
        return;
      }

      // Make POST request to upgrade endpoint with Authorization header
      const response = await axios.post(
        `${URLS.subscription}/api/subscriptions/upgrade`,
        {
          orgId: orgId,
          newSystem: systemName
        },
        {
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Show success message
        alert(`Successfully subscribed to ${SYSTEM_INFO[systemName]?.name || systemName}!`);

        // Reload the page to fetch updated subscriptions
        window.location.reload();
      } else {
        alert(`Failed to upgrade: ${response.data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      // Handle 401 Unauthorized specifically
      if (err.response?.status === 401) {
        alert('Your session has expired. Please log in again.');
        localStorage.clear();
        sessionStorage.clear();
        navigate('/login');
        return;
      }

      const errorMessage = err.response?.data?.error || err.message || 'Failed to upgrade subscription';
      alert(`Error: ${errorMessage}`);
    } finally {
      setUpgradingSystem(null);
    }
  };

  // Calculate unsubscribed systems
  const unsubscribedSystems = ALL_AVAILABLE_SYSTEMS.filter(
    (system) => !systemData?.subscribedSystems?.includes(system)
  );

  // 🚨 SAFEGUARD: Double-check blocked status before rendering (defense in depth)
  if (systemData?.isBlocked || systemData?.status === 'BLOCKED') {
    // This should not happen (handled in useEffect), but as a safeguard:
    setShowBlockedModal(true);
    return null; // Don't render anything
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-900 text-xl font-medium">Loading your systems...</p>
          <p className="text-gray-600 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-white backdrop-blur-md rounded-2xl p-8 max-w-md w-full border-2 border-red-500/50 shadow-xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">Access Issue</h2>
          <p className="text-gray-700 text-center mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No systems available
  if (systemData && systemData.systemCount === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-white backdrop-blur-md rounded-2xl p-8 max-w-md w-full border-2 border-gray-200 shadow-xl">
          <XCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">No Systems Available</h2>
          <p className="text-gray-700 text-center mb-6">
            You don't have access to any systems yet. Please contact your administrator.
          </p>
          <button
            onClick={handleLogout}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      {/* Subtle Glowing Orbs Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] right-[15%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[20%] left-[10%] w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="bg-white backdrop-blur-md rounded-2xl p-6 md:p-8 mb-8 border-2 border-gray-200 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Building2 className="w-8 h-8 text-blue-600" />
                {systemData?.companyName}
              </h1>
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4" />
                <span>{systemData?.contactEmail}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Status Badge */}
              <div className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 ${systemData?.isActive
                ? 'bg-red-600 text-white border border-red-500 shadow-lg shadow-red-900/20'
                : systemData?.isBlocked
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                }`}>
                {systemData?.isActive ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span>{systemData?.status}</span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 border border-gray-300"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>

          {/* Status Message */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-gray-700">{systemData?.statusMessage}</p>
          </div>
        </div>

        {/* Systems Grid */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Your Active Systems
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {systemData?.subscribedSystems?.map((systemCode) => {
              const system = SYSTEM_INFO[systemCode];
              if (!system) return null;

              const Icon = system.icon;

              return (
                <div
                  key={systemCode}
                  className="bg-white backdrop-blur-md rounded-xl p-5 border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 hover:transform hover:scale-[1.02] group"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${system.color} rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{system.name}</h3>
                      {/* Dynamic Plan Type Badge */}
                      {systemData?.planType === 'TRIAL' ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300 rounded-full mt-1">
                          <Clock className="w-3 h-3 text-amber-700" />
                          <span className="text-xs font-semibold text-amber-800">Trial Version</span>
                        </div>
                      ) : systemData?.planType === 'PAID' ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-emerald-100 to-green-100 border border-emerald-300 rounded-full mt-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          <span className="text-xs font-semibold text-emerald-800">Paid Subscription</span>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-xs mt-1">Active Subscription</p>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{system.description}</p>

                  <ul className="space-y-2 mb-5">
                    {system.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-gray-700 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSystemLaunch(systemCode, system.frontendUrl)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 text-sm rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    Launch {system.name}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Available Upgrades Section - Pricing Tiers */}
        {unsubscribedSystems.length > 0 && (
          <div className="mb-8 space-y-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
                <Sparkles className="w-8 h-8 text-blue-600" />
                Available System Upgrades
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Choose the perfect plan for your needs. Upgrade anytime, no commitment required.
              </p>
            </div>

            {unsubscribedSystems.map((systemCode) => {
              const system = SYSTEM_INFO[systemCode];
              const pricingTiers = PRICING_PACKAGES[systemCode];

              if (!system || !pricingTiers) return null;

              const Icon = system.icon;

              return (
                <div key={systemCode} className="space-y-8">
                  {/* System Header */}
                  <div className="bg-white backdrop-blur-sm rounded-xl p-6 border-2 border-gray-200 shadow-md">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 bg-gradient-to-br ${system.color} rounded-lg flex items-center justify-center shadow-lg`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">{system.name} Packages</h3>
                        <p className="text-gray-600">{system.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Cards Grid */}
                  <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-5">
                      {pricingTiers.map((tier) => {
                        const isUpgrading = upgradingSystem === systemCode;

                        return (
                          <div
                            key={tier.name}
                            className={`relative bg-white rounded-xl transition-all duration-300 hover:scale-[1.02] ${tier.isPopular
                              ? 'border-2 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)]'
                              : 'border-2 border-gray-200 shadow-md'
                              }`}
                          >
                            {/* Popular Badge */}
                            {tier.isPopular && (
                              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                <div className="bg-blue-500 text-white px-3 py-1 rounded-full font-semibold text-xs shadow-lg flex items-center gap-1.5">
                                  <Crown className="w-3 h-3" />
                                  MOST POPULAR
                                </div>
                              </div>
                            )}

                            <div className="p-5">
                              {/* Tier Name */}
                              <h4 className="text-xl font-bold text-gray-900 mb-1.5">{tier.name}</h4>
                              <p className="text-gray-600 text-xs mb-4 h-8 leading-relaxed">{tier.description}</p>

                              {/* Price */}
                              <div className="mb-4">
                                <div className="flex items-baseline gap-1.5">
                                  <span className="text-3xl font-bold text-gray-900">{tier.price}</span>
                                  <span className="text-gray-500 text-sm">/ {tier.period}</span>
                                </div>
                              </div>

                              {/* Choose Plan Button */}
                              <button
                                onClick={() => handleUpgradeSystem(systemCode)}
                                disabled={isUpgrading}
                                className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${tier.isPopular
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                  : 'bg-gray-800 text-white hover:bg-gray-700'
                                  }`}
                              >
                                {isUpgrading ? (
                                  <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Subscribing...
                                  </span>
                                ) : (
                                  tier.buttonText
                                )}
                              </button>

                              {/* Features List */}
                              <div className="mt-5 space-y-3">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                  What's included:
                                </p>
                                <ul className="space-y-2">
                                  {tier.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                      <div className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center mt-0.5">
                                        <Check className="w-2.5 h-2.5 text-blue-600" />
                                      </div>
                                      <span className="text-gray-700 text-xs leading-relaxed">{feature}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Separator between systems */}
                  {systemCode !== unsubscribedSystems[unsubscribedSystems.length - 1] && (
                    <div className="border-t border-gray-200 my-16"></div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Info */}
        <div className="bg-white backdrop-blur-xl rounded-2xl p-6 border-2 border-gray-200 shadow-md text-center">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-gray-600">
            <div>
              <span className="font-semibold text-gray-800">Organization ID:</span> {systemData?.orgId}
            </div>
            <div className="hidden md:block w-px h-6 bg-gray-300"></div>
            <div>
              <span className="font-semibold text-gray-800">Active Systems:</span> {systemData?.systemCount}
            </div>
            <div className="hidden md:block w-px h-6 bg-gray-300"></div>
            <div>
              <span className="font-semibold text-gray-800">Account Created:</span> {systemData?.createdAt ? new Date(systemData.createdAt).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* 🚨 BLOCKED ACCOUNT MODAL - Custom Beautiful UI */}
      {showBlockedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => {
              // Prevent closing by clicking backdrop - force user to use button
            }}
          ></div>

          {/* Modal Card */}
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-red-500/30 animate-in zoom-in-95 duration-300">
            {/* Glowing Red Border Effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-red-800 rounded-2xl blur opacity-30 animate-pulse"></div>

            {/* Content */}
            <div className="relative bg-slate-900/95 backdrop-blur-xl rounded-2xl p-8">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"></div>
                  <div className="relative bg-red-500/10 p-4 rounded-full border-2 border-red-500/50">
                    <XCircle className="w-12 h-12 text-red-500" />
                  </div>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-center mb-3">
                <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                  Account Blocked
                </span>
              </h2>

              {/* Message */}
              <p className="text-slate-300 text-center mb-8 leading-relaxed">
                Your account has been blocked by the Administrator. Please contact support for assistance.
              </p>

              {/* Divider */}
              <div className="border-t border-white/10 mb-6"></div>

              {/* Action Button */}
              <button
                onClick={() => {
                  // Clear all authentication data
                  localStorage.removeItem('token');
                  localStorage.removeItem('userDetails');
                  localStorage.clear();
                  sessionStorage.clear();

                  // Redirect to login
                  navigate('/login', { replace: true });
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group"
              >
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                Back to Login
              </button>

              {/* Support Info */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-xs text-slate-500 text-center">
                  Need help? Contact{' '}
                  <span className="text-blue-400 font-semibold">support@erp.com</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
