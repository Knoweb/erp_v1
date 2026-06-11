import React, { useState } from "react";
import {
    Users, Clock, DollarSign, BarChart2, CheckCircle, Check,
    FileText, Globe, ShieldCheck, Cloud, Calculator,
    TrendingUp, Home, Mail, Phone, Package, Menu, X,
    ArrowRight, Layers, Database, Zap, Star, RotateCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import allInOneImg from "../assets/AllinOne.png";


export default function LandingPage() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleChoosePlan = (plan) => {
        if (plan.price === 'Custom') {
            // For custom/enterprise plans, maybe show a contact form
            window.location.href = '#contact';
            return;
        }
        const price = plan.price.replace('$', '');
        navigate(`/payment?system=allinone&package=${encodeURIComponent(plan.name)}&price=${price}`);
    };

    const pricingPlans = [
        {
            name: "STARTER",
            price: "$49",
            period: "/mo",
            description: "Perfect for small businesses starting their automation journey.",
            features: [
                "Basic Accounting (Ginuma)",
                "Employee Records (PirisaHR)",
                "Simple Inventory Tracking",
                "5 User Accounts",
                "Standard Support"
            ],
            unavailable: [
                "Payroll Processing",
                "Multi-warehouse Support",
                "Advanced Analytics",
                "API Access"
            ],
            popular: false
        },
        {
            name: "BUSINESS",
            price: "$99",
            period: "/mo",
            description: "All-in-one power for growing companies needing full control.",
            features: [
                "Advanced Accounting & Invoicing",
                "Full HR Management",
                "Multi-warehouse Inventory",
                "15 User Accounts",
                "Standard Analytics",
                "Priority Support"
            ],
            unavailable: [
                "Payroll Automation",
                "AI-Powered Analytics",
                "API Access"
            ],
            popular: true
        },
        {
            name: "PREMIUM",
            price: "$149",
            period: "/mo",
            description: "Complete enterprise solution with all features included.",
            features: [
                "Advanced Accounting & Invoicing",
                "Full HR & Payroll Automation",
                "Multi-warehouse Inventory",
                "Unlimited Users",
                "AI-Powered Analytics",
                "Priority 24/7 Support",
                "API Access"
            ],
            unavailable: [],
            popular: false
        },
        {
            name: "ENTERPRISE",
            price: "Custom",
            period: "",
            description: "Tailored solutions for large-scale operations and compliance.",
            features: [
                "Dedicated Account Manager",
                "Custom API Integrations",
                "On-premise Deployment",
                "Advanced Security Compliance (SSO)",
                "Custom Reporting Engine"
            ],
            unavailable: [],
            popular: false
        }
    ];

    const allModules = [
        {
            icon: <Users />,
            title: "Pirisa HR",
            desc: "Complete employee management, payroll, and attendance system.",
            color: "text-sky-500",
            bg: "bg-sky-500",
            lightBg: "bg-sky-50",
            span: "md:col-span-1 lg:col-span-2",
            badge: "Core Module"
        },
        {
            icon: <DollarSign />,
            title: "Ginuma Accounting",
            desc: "Professional invoicing, expense tracking, and financial reports.",
            color: "text-blue-600",
            bg: "bg-blue-600",
            lightBg: "bg-blue-50",
            span: "md:col-span-1 lg:col-span-2",
            badge: "Core Module"
        },
        {
            icon: <Package />,
            title: "Smart Inventory",
            desc: "Real-time stock tracking, procurement, and multi-warehouse control.",
            color: "text-indigo-500",
            bg: "bg-indigo-500",
            lightBg: "bg-indigo-50",
            span: "md:col-span-1 lg:col-span-2",
            badge: "Core Module"
        },
        {
            icon: <BarChart2 />,
            title: "Unified Analytics",
            desc: "Cross-platform insights connecting your people, money, and stock.",
            color: "text-purple-500",
            bg: "bg-purple-500",
            lightBg: "bg-purple-50",
            span: "md:col-span-1 lg:col-span-3", // Full width on large
            badge: "Intelligence"
        },
        {
            icon: <Cloud />,
            title: "Cloud Ecosystem",
            desc: "Securely store data and access your business from anywhere.",
            color: "text-teal-500",
            bg: "bg-teal-500",
            lightBg: "bg-teal-50",
            span: "md:col-span-1 lg:col-span-3",
            badge: "Infrastructure"
        },
        {
            icon: <Zap />,
            title: "Automation",
            desc: "Automate workflows between HR, Accounting, and Inventory.",
            color: "text-amber-500",
            bg: "bg-amber-500",
            lightBg: "bg-amber-50",
            span: "md:col-span-1 lg:col-span-3",
            badge: "Productivity"
        }
    ];

    // Redeclare for cleaner grid logic below
    const smartModules = [
        {
            icon: <Users />, title: "Pirisa HR", desc: "Manage your workforce with automated payroll, attendance, and performance tracking.",
            color: "text-sky-500", bg: "hover:bg-sky-50", border: "hover:border-sky-200", badge: "HRM"
        },
        {
            icon: <DollarSign />, title: "Ginuma Accounting", desc: "Track every cent with professional invoicing, expense management, and financial reporting.",
            color: "text-blue-600", bg: "hover:bg-blue-50", border: "hover:border-blue-200", badge: "Finance"
        },
        {
            icon: <Package />, title: "Smart Inventory", desc: "Optimize stock levels, manage multiple warehouses, and streamline procurement.",
            color: "text-indigo-500", bg: "hover:bg-indigo-50", border: "hover:border-indigo-200", badge: "SCM"
        }
    ];

    return (
        <div className="font-sans text-slate-800 bg-white selection:bg-sky-200 selection:text-sky-900">

            {/* ================= NAVBAR ================= */}
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <Layers className="w-8 h-8 text-black" />
                            <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                                KNOWEB ERP
                            </span>
                        </div>

                        {/* Desktop Links */}
                        <div className="hidden md:flex items-center gap-10">
                            {[
                                { name: 'Home', href: '#home' },
                                { name: 'Features', href: '#features' },
                                { name: 'Overview', href: '#overview' },
                                { name: 'Pricing', href: '#pricing' },
                                { name: 'Reviews', href: '#reviews' },
                                { name: 'FAQ', href: '#faq' },
                                { name: 'Contact', href: '#contact' },
                            ].map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="text-lg font-medium text-gray-900 hover:text-gray-600 transition-colors"
                                >
                                    {link.name}
                                </a>
                            ))}
                        </div>

                        {/* Mobile Menu Button */}
                        <button className="md:hidden p-2 text-gray-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            {isMobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
                        >
                            <div className="px-4 py-4 space-y-4">
                                {[
                                    { name: 'Home', href: '#home' },
                                    { name: 'Features', href: '#features' },
                                    { name: 'Overview', href: '#overview' },
                                    { name: 'Pricing', href: '#pricing' },
                                    { name: 'Contact', href: '#contact' },
                                ].map((link) => (
                                    <a
                                        key={link.name}
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block w-full text-left py-2 font-bold text-gray-600"
                                    >
                                        {link.name}
                                    </a>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* ================= HERO SECTION ================= */}
            <section id="home" className="relative overflow-hidden pt-20 pb-32 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="inline-block text-sm font-bold uppercase tracking-wider text-sky-600 mb-4 bg-sky-100 px-3 py-1 rounded-full">
                                One Platform, Infinite Possibilities
                            </span>
                            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-tight mb-6">
                                Run Your Entire Business on <span className="text-sky-500">KNOWEB</span>
                            </h1>
                            <p className="text-xl text-slate-600 leading-relaxed max-w-lg mb-10">
                                Combine the power of <strong>PirisaHR</strong>, <strong>Ginuma Accounting</strong>, and <strong>Smart Inventory</strong> into one seamless operating system.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={() => window.location.href = '/register?system=ALL_IN_ONE'}
                                    className="px-8 py-4 bg-sky-500 text-white font-bold rounded-full shadow-lg shadow-sky-500/20 hover:bg-sky-600 transition-all active:scale-95"
                                >
                                    Get Started Free
                                </button>
                                <button className="px-8 py-4 bg-white text-slate-700 font-bold rounded-full shadow-sm border border-gray-200 hover:border-gray-300 transition-all flex items-center gap-2 group">
                                    Watch Demo <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="relative"
                        >
                            {/* Abstract Background Blobs */}
                            <div className="absolute -top-10 -right-10 w-72 h-72 bg-sky-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                            <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

                            {/* Main Dashboard Image */}
                            <div className="relative rounded-2xl shadow-2xl overflow-hidden border border-slate-200/50 bg-white">
                                <img src={allInOneImg} alt="ERP All-in-One Dashboard" className="w-full h-auto object-cover rounded-2xl" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ================= UNIFIED FEATURES GRID ================= */}
            <section id="features" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-4xl font-extrabold text-slate-900 mb-4">The Complete Business Suite</h2>
                        <p className="text-lg text-slate-600">Why pay for multiple subscriptions? Get HR, Accounting, and Inventory in one unified dashboard.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {smartModules.map((m, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className={`bg-white p-8 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 group cursor-pointer ${m.bg} ${m.border} hover:shadow-xl hover:-translate-y-1`}
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gray-50 group-hover:bg-white transition-colors shadow-sm`}>
                                        <div className={`${m.color}`}>
                                            {m.icon}
                                        </div>
                                    </div>
                                    <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-gray-50 ${m.color} bg-opacity-10`}>
                                        {m.badge}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-black">{m.title}</h3>
                                <p className="text-slate-600 leading-relaxed mb-6">
                                    {m.desc}
                                </p>

                                <div className={`flex items-center gap-2 font-bold text-sm ${m.color} opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300`}>
                                    Learn more <ArrowRight className="w-4 h-4" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= UNIFIED PRICING ================= */}
            <section id="pricing" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-blue-600 font-bold uppercase tracking-wider text-sm">Simple Pricing</span>
                        <h2 className="text-4xl font-extrabold text-gray-900 mt-2 mb-4">One Price. Everything Included.</h2>
                        <p className="text-lg text-gray-600">Choose the package that fits your business scale. No hidden fees.</p>
                        <div className="flex justify-center items-center gap-2 mt-4 mb-4">
                            <div className="h-1 w-8 bg-gray-900 rounded-full"></div>
                            <div className="h-1 w-12 bg-blue-600 rounded-full"></div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                        {pricingPlans.map((plan, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`relative bg-white rounded-3xl shadow-2xl overflow-hidden border-2 ${plan.popular
                                        ? 'border-blue-500 ring-4 ring-blue-100 scale-105 z-10'
                                        : 'border-gray-200'
                                    } transition-all duration-300 flex flex-col`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600" />
                                )}

                                <div className="p-8 flex-grow flex flex-col">
                                    <h3 className="text-xl font-extrabold text-gray-900 mb-2 uppercase tracking-wide text-center">{plan.name}</h3>
                                    <p className="mb-4 text-gray-600 text-sm text-center">{plan.description}</p>

                                    <div className="flex items-center justify-center mb-6">
                                        <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{plan.price}</span>
                                        <span className="text-gray-600 ml-1 font-medium">{plan.period}</span>
                                    </div>

                                    <ul className="space-y-4 mb-8 flex-grow">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center text-gray-700">
                                                <Check className="w-4 h-4 text-emerald-600 mr-3 flex-shrink-0" />
                                                <span className="text-sm font-medium">{feature}</span>
                                            </li>
                                        ))}
                                        {plan.unavailable && plan.unavailable.map((feature, idx) => (
                                            <li key={idx} className="flex items-center text-gray-400">
                                                <X className="w-4 h-4 text-gray-300 mr-3 flex-shrink-0" />
                                                <span className="text-sm line-through decoration-gray-300">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        disabled
                                        className={`w-full py-3 px-6 rounded-xl font-bold cursor-not-allowed transition-all duration-300 ${plan.popular
                                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg opacity-60'
                                                : 'bg-gray-200 text-gray-500 opacity-60'
                                            }`}
                                    >
                                        Choose {plan.name}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= TESTIMONIALS / STATS ================= */}
            <section id="reviews" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-[#0B1120] rounded-3xl overflow-hidden shadow-2xl">
                        <div className="grid lg:grid-cols-2">
                            <div className="p-12 lg:p-16 flex flex-col justify-center">
                                <div className="flex gap-1 text-yellow-400 mb-6">
                                    <Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" />
                                </div>
                                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-8 leading-tight">
                                    "KNOWEB completely transformed how we operate. Having our Inventory linked directly to Ginuma Accounting and PirisaHR has saved us 40+ hours a week."
                                </h2>
                                <div>
                                    <p className="text-white font-bold text-lg">Sarah Johnson</p>
                                    <p className="text-gray-400">Operations Director, TechFlow Inc.</p>
                                </div>
                            </div>
                            <div className="bg-sky-500 p-12 lg:p-16 flex flex-col justify-center items-center text-center">
                                <h3 className="text-white text-lg font-medium mb-8 uppercase tracking-widest opacity-80">Trusted by modern businesses</h3>
                                <div className="grid grid-cols-2 gap-x-12 gap-y-12">
                                    <div className="text-white">
                                        <div className="text-5xl font-extrabold mb-1">10k+</div>
                                        <div className="text-sky-100">Companies</div>
                                    </div>
                                    <div className="text-white">
                                        <div className="text-5xl font-extrabold mb-1">$500M</div>
                                        <div className="text-sky-100">Transactions</div>
                                    </div>
                                    <div className="text-white">
                                        <div className="text-5xl font-extrabold mb-1">99.9%</div>
                                        <div className="text-sky-100">Uptime</div>
                                    </div>
                                    <div className="text-white">
                                        <div className="text-5xl font-extrabold mb-1">24/7</div>
                                        <div className="text-sky-100">Support</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= FAQ ================= */}
            <section id="faq" className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-extrabold text-center mb-16">Frequently Asked Questions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { q: "Can I use only one module (e.g., just Inventory)?", a: "Yes! While KNOWEB is powerful as a suite, you can start with the Starter Bundle and use features as you need them." },
                            { q: "Is my data secure?", a: "Absolutely. We use bank-grade AES-256 encryption and daily cloud backups to ensure your business data is never lost or compromised." },
                            { q: "Do you offer free trials?", a: "Yes, we offer a 14-day full feature free trial. No credit card required to start." },
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-lg mb-4 text-slate-900">{item.q}</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}