import React from "react";
import {
    Users,
    Clock,
    DollarSign,
    BarChart2,
    CheckCircle,
    Check,
    Menu,
    X,
    FileText,
    Globe,
    ShieldCheck,
    Cloud,
    Calculator,
    TrendingUp,
    Home,
    Mail,
    Phone,
    Boxes
} from "lucide-react";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/inventory-landingpage/inventory-logo.jpeg';
import heroImg from '../assets/inventory-landingpage/inventory-hero.jpeg';



export default function App() {
    return (
        <div className="font-sans">
            <Navbar />
            <Hero />
            <Features />
            <Modules />

            <Pricing />
            <Footer />
        </div>
    );
}

/* ================= NAVBAR ================= */
function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { name: 'Home', href: '#home' },
        { name: 'Features', href: '#features' },

        { name: 'Pricing', href: '#pricing' },
        { name: 'Contact', href: '#contact' },
    ];

    return (
        <nav className="fixed top-0 w-full z-50 bg-white h-20 shadow-sm overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full relative z-10">
                <div className="flex items-center h-full">
                    <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer mr-12">
                        <img src={logo} alt="Pirisa Inventory Logo" className="h-16 w-auto" />
                        <span className="text-4xl font-extrabold text-black tracking-tight font-serif">
                            INVENTORY
                        </span>
                    </div>

                    <div className="flex-grow"></div>

                    <div className="hidden lg:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <a key={link.name} href={link.href}
                                className="text-lg font-medium text-gray-900 hover:text-gray-600">
                                {link.name}
                            </a>
                        ))}
                    </div>

                    <div className="lg:hidden flex items-center ml-auto">
                        <button onClick={() => setIsOpen(!isOpen)} className="p-2">
                            {isOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-white border-t shadow-xl"
                    >
                        <div className="px-6 pt-4 pb-8 space-y-2">
                            {navLinks.map((link) => (
                                <a key={link.name} href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className="block px-4 py-3 font-bold rounded-xl">
                                    {link.name}
                                </a>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

/* ================= HERO ================= */
function Hero() {
    return (
        <section id="home" className="bg-sky-50 relative overflow-hidden min-h-screen flex items-center pt-20">
            {/* Background Curve for Right Side */}
            <div className="absolute top-0 right-0 w-[45%] h-full bg-sky-400 rounded-l-[50%] translate-x-1/4 z-0 hidden lg:block scale-125 origin-right"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 relative">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-8"
                    >
                        <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 leading-tight">
                            <span className="text-sky-400">Inventory</span><br />
                            <span className="text-black">Software</span>
                        </h1>
                        <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                            Pirisa Inventory is the all-in-one inventory management software designed for
                            businesses of all sizes. Manage your stock effortlessly and
                            make informed decisions with real-time insights.
                        </p>
                        <button
                            onClick={() => window.location.href = '/register?system=INVENTORY'}
                            className="px-8 py-4 bg-sky-400 text-white text-lg font-bold rounded-full shadow-lg hover:bg-sky-500 transition-all transform hover:-translate-y-1"
                        >
                            Get Started
                        </button>
                    </motion.div>

                    {/* Right Image */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <img
                            src={heroImg}
                            alt="Pirisa Dashboard"
                            className="w-full relative z-10 drop-shadow-2xl rounded-lg"
                        />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

/* ================= FEATURES ================= */
function Features() {
    return (
        <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="text-sky-400 font-bold tracking-wider uppercase text-sm">Our Story, Your Success</span>
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mt-2 mb-6 leading-tight">
                            Empower Your Business <br /> with Smart Inventory Management
                        </h2>
                        <p className="text-gray-600 text-lg leading-relaxed mb-8">
                            At Pirisa, we redefine how businesses manage their inventory. Built with precision and simplicity, our platform empowers you to take control of stock, suppliers, and orders from automation to insightful analytics. Whether you're a startup or an enterprise, Pirisa grows with your needs.
                        </p>

                        <hr className="my-8 border-gray-100" />

                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Pirisa?</h3>
                            <ul className="space-y-4">
                                {[
                                    "Effortless Stock Tracking",
                                    "Unmatched Data Security",
                                    "Time-Saving Automation",
                                    "Real-Time Inventory Insights"
                                ].map((item, index) => (
                                    <li key={index} className="flex items-center gap-3">
                                        <div className="bg-sky-400 rounded-full p-1 flex-shrink-0">
                                            <CheckCircle className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="text-gray-700 font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>

                    {/* Right Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Card 1 - Blue */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-sky-400 p-8 rounded-2xl shadow-xl text-white transform hover:-translate-y-2 transition-transform duration-300"
                        >
                            <Boxes className="w-10 h-10 mb-6" />
                            <h3 className="text-xl font-bold mb-3">Smart Tracking</h3>
                            <p className="text-sky-50 leading-relaxed font-medium">
                                Track stock levels, product movements, and warehouse locations in real-time with ease.
                            </p>
                        </motion.div>

                        {/* Card 2 - White */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 transform hover:-translate-y-2 transition-transform duration-300"
                        >
                            <Globe className="w-10 h-10 text-sky-400 mb-6" />
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Global Suppliers</h3>
                            <p className="text-gray-600 leading-relaxed font-medium">
                                Manage suppliers across borders with built-in multi-currency purchasing support.
                            </p>
                        </motion.div>

                        {/* Card 3 - White */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 transform hover:-translate-y-2 transition-transform duration-300"
                        >
                            <ShieldCheck className="w-10 h-10 text-sky-400 mb-6" />
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Data</h3>
                            <p className="text-gray-600 leading-relaxed font-medium">
                                Ensure accurate stock records and generate audit-ready reports automatically.
                            </p>
                        </motion.div>

                        {/* Card 4 - Blue */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-sky-400 p-8 rounded-2xl shadow-xl text-white transform hover:-translate-y-2 transition-transform duration-300"
                        >
                            <BarChart2 className="w-10 h-10 mb-6" />
                            <h3 className="text-xl font-bold mb-3">Actionable Reports</h3>
                            <p className="text-sky-50 leading-relaxed font-medium">
                                Get instant insights into best-selling products, low stock alerts, and inventory value.
                            </p>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
}

/* ================= MODULES ================= */
function Modules() {
    const features = [
        { icon: <Boxes />, title: "Product Management", desc: "Add, update, and categorize products easily." },
        { icon: <TrendingUp />, title: "Stock Tracking", desc: "Monitor stock levels in real time." },
        { icon: <Calculator />, title: "Cost Management", desc: "Track inventory value and costs accurately." },
        { icon: <Clock />, title: "Order Tracking", desc: "Track purchase and sales orders efficiently." },
        { icon: <Users />, title: "Supplier Management", desc: "Manage suppliers and purchase history." },
        { icon: <Cloud />, title: "Cloud Backup", desc: "Secure data access anytime, anywhere." }
    ];

    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-6">
                    Inventory Features
                </h2>
                <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
                    Everything you need to manage your inventory efficiently
                </p>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {features.map((f, i) => (
                        <div key={i} className="flex gap-4 items-start">
                            <div className="w-14 h-14 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 flex-shrink-0">
                                {f.icon}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 mb-2">{f.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}



/* ================= PRICING ================= */
function Pricing() {
    const navigate = useNavigate();

    const handleChoosePlan = (plan) => {
        const price = plan.price.replace('$', '');
        navigate(`/payment?system=inventory&package=${encodeURIComponent(plan.name)}&price=${price}`);
    };

    const plans = [
        {
            name: "STARTER",
            price: "$15",
            period: "/mo",
            features: [
                "Product Tracking",
                "Stock Alerts",
                "Single User",
                "Supplier Management",
                "Basic Reports"
            ],
            unavailable: [
                "Multi-Warehouse",
                "Purchase Orders",
                "Inventory Analytics",
                "API Access"
            ],
            recommended: false
        },
        {
            name: "BASIC",
            price: "$29",
            period: "/mo",
            features: [
                "Product Management",
                "Stock Tracking",
                "3 Users",
                "Supplier Management",
                "Standard Reports"
            ],
            unavailable: [
                "Multi-Warehouse",
                "Purchase Orders",
                "Inventory Analytics",
                "API Access"
            ],
            recommended: false
        },
        {
            name: "STANDARD",
            price: "$59",
            period: "/mo",
            features: [
                "Product Management",
                "Stock Tracking",
                "5 Users",
                "Supplier Management",
                "Advanced Reports",
                "Multi-Warehouse",
                "Purchase Orders"
            ],
            unavailable: [
                "Inventory Analytics",
                "API Access"
            ],
            recommended: true
        },
        {
            name: "PREMIUM",
            price: "$99",
            period: "/mo",
            features: [
                "Product Management",
                "Stock Tracking",
                "Unlimited Users",
                "Supplier Management",
                "Advanced Reports",
                "Multi-Warehouse",
                "Purchase Orders",
                "Inventory Analytics",
                "API Access"
            ],
            unavailable: [],
            recommended: false
        }
    ];

    return (
        <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                        Our Packages
                    </h2>
                    <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
                        Select the ideal inventory management solution for your business
                    </p>
                    <div className="flex justify-center items-center gap-2 mt-4 mb-4">
                        <div className="h-1 w-8 bg-gray-900 rounded-full"></div>
                        <div className="h-1 w-12 bg-blue-600 rounded-full"></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative bg-white rounded-3xl shadow-2xl overflow-hidden border-2 ${plan.recommended
                                ? 'border-blue-500 ring-4 ring-blue-100 scale-105 z-10'
                                : 'border-gray-200'
                                } transition-all duration-300 flex flex-col`}
                        >
                            {plan.recommended && (
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600" />
                            )}

                            <div className="p-8 flex-grow flex flex-col">
                                <h3 className="text-xl font-extrabold text-gray-900 mb-2 uppercase tracking-wide text-center">
                                    {plan.name}
                                </h3>
                                <div className="flex items-center justify-center mb-6">
                                    <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        {plan.price}
                                    </span>
                                    <span className="text-gray-600 ml-1 font-medium">{plan.period}</span>
                                </div>

                                <ul className="space-y-4 mb-8 flex-grow">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center text-gray-700">
                                            <Check className="w-4 h-4 text-emerald-600 mr-3 flex-shrink-0" />
                                            <span className="text-sm font-medium">{feature}</span>
                                        </li>
                                    ))}
                                    {plan.unavailable.map((feature, i) => (
                                        <li key={i} className="flex items-center text-gray-400">
                                            <X className="w-4 h-4 text-gray-300 mr-3 flex-shrink-0" />
                                            <span className="text-sm line-through decoration-gray-300">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-auto">
                                    <button
                                        disabled
                                        className={`w-full py-3 px-6 rounded-xl font-bold cursor-not-allowed transition-all duration-300 ${plan.recommended
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg opacity-60'
                                            : 'bg-gray-200 text-gray-500 opacity-60'
                                            }`}
                                    >
                                        Choose Plan
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ================= FOOTER ================= */
const Footer = () => {
    return (
        <footer id="contact" className="bg-[#0B1120] pt-20 pb-10 text-gray-300 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">

                    {/* Left Column: Logo & Description (Span 5 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="flex items-center gap-3">
                            <img src={logo} alt="Pirisa Inventory Logo" className="h-10 w-auto brightness-0 invert" />
                            <span className="text-3xl font-extrabold text-white tracking-tight">INVENTORY</span>
                        </div>
                        <p className="text-gray-400 leading-relaxed text-md pr-4">
                            A seamless inventory management experience for businesses of all sizes. Automate your tracking, optimize stock levels, and achieve your goals faster.
                        </p>
                        <div className="pt-2">
                            <button
                                onClick={() => window.location.href = '/register?system=INVENTORY'}
                                className="px-8 py-3 bg-sky-400 text-white font-bold rounded-full shadow-lg hover:bg-sky-500 transition-colors"
                            >
                                Get Started
                            </button>
                        </div>
                    </div>

                    {/* Middle Column 1: Quick Link (Span 2 cols) */}
                    <div className="lg:col-span-2 lg:ml-auto">
                        <h4 className="font-bold text-white text-lg mb-6">Quick Link</h4>
                        <ul className="space-y-4 text-gray-400 font-medium">
                            <li><a href="#home" className="hover:text-sky-400 transition-colors">Home</a></li>
                            <li><a href="#features" className="hover:text-sky-400 transition-colors">Features</a></li>
                            <li><a href="#pricing" className="hover:text-sky-400 transition-colors">Packages</a></li>
                            <li><a href="#contact" className="hover:text-sky-400 transition-colors">Contact</a></li>
                        </ul>
                    </div>

                    {/* Middle Column 2: Community (Span 2 cols) */}
                    <div className="lg:col-span-2">
                        <h4 className="font-bold text-white text-lg mb-6">Community</h4>
                        <ul className="space-y-4 text-gray-400 font-medium">
                            <li><a href="#" className="hover:text-sky-400 transition-colors">Terms & Conditions</a></li>
                            <li><a href="#" className="hover:text-sky-400 transition-colors">Reviews</a></li>
                            <li><a href="#" className="hover:text-sky-400 transition-colors">Company</a></li>
                            <li><a href="#" className="hover:text-sky-400 transition-colors">Overview</a></li>
                        </ul>
                    </div>

                    {/* Right Column: Contact Info Box (Span 3 cols) */}
                    <div className="lg:col-span-4">
                        <div className="bg-[#131b2e] p-8 rounded-2xl space-y-6 border border-gray-800">
                            {/* Website */}
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-gray-800 rounded-full shadow-sm text-sky-400 flex-shrink-0">
                                    <Home className="w-5 h-5" />
                                </div>
                                <div className="overflow-hidden">
                                    <h5 className="font-bold text-white text-sm uppercase mb-1">WEBSITE:</h5>
                                    <p className="text-gray-400 text-sm truncate">www.pirisainventory.com</p>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-gray-800 rounded-full shadow-sm text-sky-400 flex-shrink-0">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div className="overflow-hidden">
                                    <h5 className="font-bold text-white text-sm uppercase mb-1">EMAIL:</h5>
                                    <p className="text-gray-400 text-sm truncate">info@pirisainventory.com</p>
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-gray-800 rounded-full shadow-sm text-sky-400 flex-shrink-0">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                    <h5 className="font-bold text-white text-sm uppercase mb-1">PHONE:</h5>
                                    <p className="text-gray-400 text-sm">+94-74-070-9989</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
                    <p className="mb-4 md:mb-0">
                        &copy; 2026 <span className="text-sky-400 font-bold">Pirisa</span> Inventory Management. All Rights Reserved
                    </p>
                    <div className="flex items-center space-x-6">
                        <a href="#" className="hover:text-white transition-colors">Terms & Conditions</a>
                        <span className="text-gray-600">|</span>
                        <a href="#" className="hover:text-white transition-colors">Support</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};