import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, Mail, Phone, MapPin, Globe, ShieldCheck, Calendar, Users, Package } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const CompanyProfile = () => {
    const { user } = useAuth();
    const [organizationData, setOrganizationData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrganizationDetails();
    }, [user]);

    const fetchOrganizationDetails = async () => {
        try {
            if (user?.orgId) {
                const response = await axios.get(`${API_BASE_URL}/api/organizations/${user.orgId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setOrganizationData(response.data);
            }
        } catch (error) {
            console.error('Error fetching organization details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const profileData = organizationData || {
        name: user?.orgName || 'Organization',
        email: user?.email,
        industryType: user?.industryType,
        logoUrl: user?.companyLogo
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 rounded-3xl p-8 mb-8 shadow-2xl border border-slate-700">
                <div className="flex items-start gap-6">
                    {/* Company Logo */}
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center shadow-[0_8px_30px_rgb(79,70,229,0.4)] border border-indigo-500/20 overflow-hidden flex-shrink-0">
                        {profileData.logoUrl ? (
                            <img 
                                src={`${API_BASE_URL}${profileData.logoUrl}`}
                                alt="Company Logo" 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Building2 className="w-12 h-12 text-white" />
                        )}
                    </div>

                    {/* Company Info */}
                    <div className="flex-1">
                        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
                            {profileData.name}
                        </h1>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-4 py-1.5 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider border border-indigo-500/30">
                                {profileData.industryType || 'STANDARD'} System
                            </span>
                            {profileData.subscriptionTier && (
                                <span className="px-4 py-1.5 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
                                    {profileData.subscriptionTier} Plan
                                </span>
                            )}
                            {(profileData.isActive !== false) && (
                                <span className="px-4 py-1.5 bg-green-500/20 text-green-300 rounded-full text-xs font-bold uppercase tracking-wider border border-green-500/30 flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                    Active
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
                    <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-indigo-600" />
                        Contact Information
                    </h2>
                    <div className="space-y-4">
                        {profileData.email && (
                            <div className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email</p>
                                    <p className="text-sm font-medium text-slate-900">{profileData.email}</p>
                                </div>
                            </div>
                        )}
                        {profileData.contactPhone && (
                            <div className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Phone</p>
                                    <p className="text-sm font-medium text-slate-900">{profileData.contactPhone}</p>
                                </div>
                            </div>
                        )}
                        {profileData.registeredAddress && (
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Address</p>
                                    <p className="text-sm font-medium text-slate-900">{profileData.registeredAddress}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Organization Details */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
                    <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-indigo-600" />
                        Organization Details
                    </h2>
                    <div className="space-y-4">
                        {profileData.industryType && (
                            <div className="flex items-start gap-3">
                                <Package className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Industry Type</p>
                                    <p className="text-sm font-medium text-slate-900">{profileData.industryType}</p>
                                </div>
                            </div>
                        )}
                        {profileData.taxId && (
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Tax ID</p>
                                    <p className="text-sm font-medium text-slate-900">{profileData.taxId}</p>
                                </div>
                            </div>
                        )}
                        {profileData.registrationNo && (
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Registration No</p>
                                    <p className="text-sm font-medium text-slate-900">{profileData.registrationNo}</p>
                                </div>
                            </div>
                        )}
                        {profileData.createdAt && (
                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Member Since</p>
                                    <p className="text-sm font-medium text-slate-900">
                                        {new Date(profileData.createdAt).toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* User Information */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 mt-6">
                <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    Current User
                </h2>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-600 font-black text-lg border border-indigo-500/20">
                        {user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900">{user?.username}</p>
                        <p className="text-xs text-slate-500">{user?.email}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyProfile;
