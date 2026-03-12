import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Menu, X, Check, FileText, DollarSign, CreditCard, BarChart2,
    CheckCircle, Calculator, Clock, Users, Cloud, Quote, Star,
    ChevronDown, ChevronUp, Mail, Phone, MapPin, Send, Home
} from 'lucide-react';

// Assets
import logo from '../assets/ginum_img/ginuma-logo.jpeg';
import heroImage from '../assets/ginum_img/ginuma-hero.jpeg';
import faqImage from '../assets/ginum_img/faq.jpeg';
import img1 from '../assets/ginum_img/g1.jpeg';
import img2 from '../assets/ginum_img/g2.jpeg';
import img3 from '../assets/ginum_img/g3.jpeg';
import img4 from '../assets/ginum_img/g4.jpeg';
import img5 from '../assets/ginum_img/g5.jpeg';
import img6 from '../assets/ginum_img/6.jpeg';
import img7 from '../assets/ginum_img/7.jpeg';
import img8 from '../assets/ginum_img/8.jpeg';
import img9 from '../assets/ginum_img/9.jpeg';
import img10 from '../assets/ginum_img/10.jpeg';

// --- Components ---

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { name: 'Home', href: '#home', isActive: true },
        { name: 'Features', href: '#features' },
        { name: 'Overview', href: '#glance' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'Reviews', href: '#reviews' },
        { name: 'FAQ', href: '#faq' },
        { name: 'Contact', href: '#contact' },
    ];

    return (
        <nav className="fixed top-0 w-full z-50 bg-white h-20 shadow-sm overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full relative z-10">
                <div className="flex items-center h-full">
                    {/* Logo Section */}
                    <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer mr-12">
                        <div className="relative">
                            <img src={logo} alt="Ginum Logo" className="h-16 w-auto" />
                        </div>
                        <span className="text-4xl font-extrabold text-black tracking-tight font-serif">
                            GINUM
                        </span>
                    </div>

                    {/* Desktop Navigation Links - Centered/Left-aligned */}
                    <div className="hidden lg:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className={`text-lg font-medium tracking-normal transition-colors ${link.isActive ? 'text-black' : 'text-gray-900 hover:text-gray-600'
                                    }`}
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>

                    {/* Spacer to push buttons to right */}
                    <div className="flex-grow"></div>

                    {/* Auth Buttons - Positioned over the cyan background */}
                  {/*  <div className="hidden lg:flex items-center space-x-4 pl-8">
                        <button className="px-8 py-3 bg-slate-800 text-white font-medium rounded-full hover:bg-slate-900 transition-transform hover:scale-105 shadow-xl text-sm">
                            Login
                        </button>
                        <button className="px-8 py-3 bg-white text-slate-900 border border-gray-200 font-medium rounded-full hover:bg-gray-50 transition-transform hover:scale-105 shadow-xl text-sm">
                            Register
                        </button>
                    </div>
                    */}

                    {/* Mobile Menu Button - Pushed to right on mobile */}
                    <div className="lg:hidden flex items-center ml-auto">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-blue-600 focus:outline-none p-2">
                            {isOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-white border-t border-gray-100 absolute w-full left-0 z-40 shadow-xl"
                    >
                        <div className="px-6 pt-4 pb-8 space-y-2">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-bold rounded-xl transition-all"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.name}
                                </a>
                            ))}
                            <div className="pt-6 space-y-3 px-4 grid grid-cols-2 gap-4">
                                <button className="w-full px-4 py-3 bg-slate-800 text-white font-bold rounded-xl shadow-md">
                                    Login
                                </button>
                                <button className="w-full px-4 py-3 bg-cyan-400 text-white font-bold rounded-xl shadow-md">
                                    Register
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

const Hero = () => {
    return (
        <section id="home" className="relative pt-20 pb-20 lg:pt-32 overflow-hidden bg-sky-50 h-screen flex items-center">
            {/* Background Blob - Large Cyan Shape on Right */}
            <div className="absolute top-0 right-0 h-full w-[55%] bg-[#4DC4F4] rounded-l-full hidden lg:block translate-x-[20%] scale-110" />

            {/* Mobile background blob */}
            <div className="absolute top-0 right-0 w-3/4 h-screen bg-[#4DC4F4] rounded-l-full z-0 lg:hidden opacity-20 blur-3xl" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                <div className="grid lg:grid-cols-2 gap-8 items-center">

                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-left"
                    >
                        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-[#4DC4F4] mb-2">
                            Ginum
                        </h1>
                        <h2 className="text-4xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
                            Accounting Software
                        </h2>

                        <p className="text-lg text-gray-500 mb-8 max-w-lg leading-relaxed">
                            Ginum is the all-in-one accounting software designed for businesses of all sizes.
                            Manage your finances effortlessly and make informed decisions with real-time insights.
                        </p>

                        <button 
                            onClick={() => window.location.href = 'http://localhost:5173/register?system=GINUMA'}
                            className="px-10 py-3 bg-[#4DC4F4] text-white font-bold rounded-full shadow-lg hover:bg-cyan-400 transition-all duration-300 transform hover:-translate-y-1 text-lg"
                        >
                            Get Started
                        </button>
                    </motion.div>

                    {/* Hero Image */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative z-20 flex justify-center"
                    >
                        <img
                            src={heroImage}
                            alt="Ginum Dashboard on Laptop"
                            className="w-full h-auto object-contain drop-shadow-2xl"
                        />
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

const Features = () => {
    // Array for the list items on the left side
    const listItems = [
        "Effortless Accounting Excellence",
        "Unmatched Data Security",
        "Time-Saving Automation",
        "Real-Time Financial Insights"
    ];

    // Array for the grid cards on the right side
    const cards = [
        {
            id: 1,
            icon: <FileText className="w-8 h-8 text-white" />,
            title: "Easy Invoicing",
            description: "Create, send, and track invoices in just a few clicks. Automate reminders for overdue payments.",
            bgColor: "bg-sky-400", // Light Blue
            textColor: "text-white",
            descColor: "text-sky-100"
        },
        {
            id: 2,
            icon: <DollarSign className="w-8 h-8 text-sky-500" />,
            title: "Multi-Currency Support",
            description: "Work seamlessly across borders with built-in multi-currency options.",
            bgColor: "bg-white", // White
            textColor: "text-gray-900",
            descColor: "text-gray-500",
            shadow: "shadow-2xl"
        },
        {
            id: 3,
            icon: <CreditCard className="w-8 h-8 text-sky-500" />,
            title: "Tax Compliance",
            description: "Ensure accurate tax calculations and generate reports for VAT, GST, and other compliance needs.",
            bgColor: "bg-white", // White
            textColor: "text-gray-900",
            descColor: "text-gray-500",
            shadow: "shadow-2xl"
        },
        {
            id: 4,
            icon: <BarChart2 className="w-8 h-8 text-white" />,
            title: "Real-Time Financial Reporting",
            description: "Get actionable insights into your cash flow, expenses, and profits anytime.",
            bgColor: "bg-sky-400", // Light Blue
            textColor: "text-white",
            descColor: "text-sky-100"
        }
    ];

    // Array for the new "Our Features" grid
    const ourFeatures = [
        {
            icon: <FileText className="w-8 h-8 text-slate-800" />,
            title: "Simplified Invoicing & Billing",
            description: "Generate professional invoices in seconds."
        },
        {
            icon: <BarChart2 className="w-8 h-8 text-slate-800" />,
            title: "Expense Tracking",
            description: "Stay on top of your cash flow with detailed expense monitoring."
        },
        {
            icon: <Calculator className="w-8 h-8 text-slate-800" />,
            title: "Tax Management",
            description: "Automatic tax calculations and compliance support."
        },
        {
            icon: <Clock className="w-8 h-8 text-slate-800" />,
            title: "Real-Time Reporting",
            description: "Access financial reports instantly for smarter decisions."
        },
        {
            icon: <Users className="w-8 h-8 text-slate-800" />,
            title: "Multi-User Access",
            description: "Collaborate seamlessly with your team."
        },
        {
            icon: <Cloud className="w-8 h-8 text-slate-800" />,
            title: "Cloud Backup & Security",
            description: "Your data is safe, accessible anytime, anywhere."
        },
    ];

    return (
        <section id="features" className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section 1: Our Story - 2 Column Layout */}
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start mb-32">

                    {/* Left Column: Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="pt-8"
                    >
                        <h4 className="text-sky-400 font-bold uppercase tracking-wider text-md mb-2">
                            OUR STORY, YOUR SUCCESS
                        </h4>
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight mb-8">
                            Empower Your Business with Smart Accounting
                        </h2>
                        <p className="text-md text-gray-700 leading-relaxed mb-8">
                            At Ginum, we redefine how businesses manage finances. Built with<br />
                            precision and simplicity, our app empowers you to take control of accounting, from automation to insightful analytics. Whether you're a startup or an enterprise, Ginum grows with your needs, delivering innovation at every step.
                        </p>

                        <hr className="border-gray-200 mb-8" />

                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">
                                Why Choose Ginum?
                            </h3>
                            <ul className="space-y-4">
                                {listItems.map((item, index) => (
                                    <li key={index} className="flex items-center space-x-3">
                                        <div className="flex-shrink-0">
                                            <CheckCircle className="w-6 h-6 text-sky-400 fill-sky-50" />
                                        </div>
                                        <span className="text-gray-600 font-medium text-lg">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>

                    {/* Right Column: 2x2 Grid using Flex/Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {cards.map((card, index) => (
                            <motion.div
                                key={card.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className={`p-8 rounded-xl ${card.bgColor} ${card.shadow ? card.shadow : ''} flex flex-col items-start min-h-[320px]`}
                            >
                                <div className="mb-6 p-0">
                                    {card.icon}
                                </div>
                                <h3 className={`text-xl font-bold ${card.textColor} mb-4`}>
                                    {card.title}
                                </h3>
                                <p className={`${card.descColor} leading-relaxed text-sm`}>
                                    {card.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                </div>

                {/* Section 2: Our Features - New Section Added Below */}
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-4xl font-extrabold text-gray-900 mb-4"
                    >
                        Our Features
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-gray-500 mb-6"
                    >
                        Why Choose Ginum Accounting Software?
                    </motion.p>

                    {/* Decorative Line Separator */}
                    <div className="flex justify-center items-center gap-1 mb-16">
                        <div className="h-1 w-8 bg-black rounded-full"></div>
                        <div className="h-1 w-12 bg-sky-400 rounded-full"></div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                        {ourFeatures.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="flex items-start space-x-4 text-left"
                            >
                                <div className="flex-shrink-0">
                                    <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center">
                                        {feature.icon}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-500 leading-relaxed text-sm">
                                        {feature.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
};

const Glance = () => {
    const images = [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10];
    const [activeIndex, setActiveIndex] = useState(1);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [images.length]);

    return (
        <section id="glance" className="py-5 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Section */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-6">
                        Ginum at a Glance
                    </h2>
                    <p className="mt-4 text-gray-500 max-w-3xl mx-auto text-lg leading-relaxed">
                        Ginum is a user friendly accounting software that simplifies financial management with features like expense tracking, invoicing, and detailed reporting, helping businesses stay organized and efficient.
                    </p>

                    {/* Decorative Line */}
                    <div className="flex justify-center items-center gap-2 mt-8 mb-4">
                        <div className="h-1 w-8 bg-black rounded-full"></div>
                        <div className="h-1 w-12 bg-sky-400 rounded-full"></div>
                    </div>
                </div>

                {/* Desktop Carousel (Mockup) */}
                <div className="relative h-[400px] md:h-[500px] flex items-center justify-center">
                    {images.map((img, index) => {
                        const isActive = index === activeIndex;
                        const isPrev = index === (activeIndex - 1 + images.length) % images.length;
                        const isNext = index === (activeIndex + 1) % images.length;

                        // Only render relevant slides to avoid layout thrashing
                        if (!isActive && !isPrev && !isNext) return null;

                        return (
                            <motion.div
                                key={index}
                                initial={false}
                                animate={{
                                    scale: isActive ? 1 : 0.8,
                                    opacity: isActive ? 1 : 0.5,
                                    x: isActive ? 0 : isPrev ? '-65%' : '65%',
                                    zIndex: isActive ? 10 : 5,
                                    filter: isActive ? 'blur(0px)' : 'blur(0px)', // Removed blur for cleaner look
                                }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                className="absolute top-0 w-[90%] md:w-[80%] lg:w-[70%] h-full rounded-xl shadow-2xl overflow-hidden bg-white border border-gray-100 flex items-center justify-center p-2"
                                style={{
                                    left: '0',
                                    right: '0',
                                    margin: 'auto'
                                }}
                            >
                                <img
                                    src={img}
                                    alt={`Screenshot ${index + 1}`}
                                    className="w-full h-full object-contain md:object-cover rounded-lg bg-gray-50"
                                />
                            </motion.div>
                        );
                    })}
                </div>

                {/* Pagination Dots */}
                <div className="flex justify-center items-center gap-3 mt-12">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveIndex(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${activeIndex === index ? 'bg-sky-400 scale-125' : 'bg-gray-300 hover:bg-gray-400'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>

            </div>
        </section>
    );
};

const PaymentModal = ({ isOpen, onClose, selectedPlan }) => {
    const [formData, setFormData] = useState({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: '',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const subscriptionData = {
            ...formData,
            planName: selectedPlan?.name,
            planPrice: selectedPlan?.price,
            planPeriod: selectedPlan?.period,
            subscribedAt: new Date().toISOString(),
            status: 'pending'
        };

        try {
            // Send to superadmin API endpoint
            const response = await fetch('/api/superadmin/subscriptions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(subscriptionData)
            });

            if (response.ok) {
                alert('Subscription request submitted successfully! Our team will contact you soon.');
                onClose();
                setFormData({
                    companyName: '',
                    contactPerson: '',
                    email: '',
                    phone: '',
                    address: '',
                    cardNumber: '',
                    cardName: '',
                    expiryDate: '',
                    cvv: '',
                });
            } else {
                alert('Failed to submit subscription. Please try again.');
            }
        } catch (error) {
            console.error('Subscription error:', error);
            alert('An error occurred. Please try again later.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
                <div className="p-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Complete Your Subscription</h2>
                            <p className="text-gray-500 mt-1">
                                {selectedPlan?.name} Plan - {selectedPlan?.price}{selectedPlan?.period}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Company Information */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Company Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
                                        placeholder="Your Company Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person *</label>
                                    <input
                                        type="text"
                                        name="contactPerson"
                                        value={formData.contactPerson}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
                                        placeholder="john@company.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
                                        placeholder="+94 70 123 4567"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        required
                                        rows="2"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all resize-none"
                                        placeholder="Company Address"
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Payment Information */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Payment Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Card Number *</label>
                                    <input
                                        type="text"
                                        name="cardNumber"
                                        value={formData.cardNumber}
                                        onChange={handleChange}
                                        required
                                        maxLength="19"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
                                        placeholder="1234 5678 9012 3456"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name *</label>
                                    <input
                                        type="text"
                                        name="cardName"
                                        value={formData.cardName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date *</label>
                                    <input
                                        type="text"
                                        name="expiryDate"
                                        value={formData.expiryDate}
                                        onChange={handleChange}
                                        required
                                        maxLength="5"
                                        placeholder="MM/YY"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">CVV *</label>
                                    <input
                                        type="text"
                                        name="cvv"
                                        value={formData.cvv}
                                        onChange={handleChange}
                                        required
                                        maxLength="4"
                                        placeholder="123"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="bg-gray-50 p-6 rounded-xl">
                            <h3 className="text-lg font-bold text-gray-900 mb-3">Order Summary</h3>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600">{selectedPlan?.name} Plan</span>
                                <span className="font-bold text-gray-900">{selectedPlan?.price}{selectedPlan?.period}</span>
                            </div>
                            <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between items-center">
                                <span className="text-lg font-bold text-gray-900">Total</span>
                                <span className="text-2xl font-bold text-sky-400">{selectedPlan?.price}{selectedPlan?.period}</span>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-4 px-6 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all duration-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                            >
                                Submit Payment
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

const Pricing = () => {
    const navigate = useNavigate();

    const handleChoosePlan = (plan) => {
        const price = plan.price.replace('$', '');
        navigate(`/payment?system=ginum&package=${encodeURIComponent(plan.name)}&price=${price}`);
    };

    const plans = [
        {
            name: "STARTER", // Uppercase as per image
            price: "$15",
            period: "/mo",
            features: [
                "Basic Invoicing",
                "Expense Tracking",
                "Single User",
                "Client Management",
                "Basic Reports"
            ],
            unavailable: [
                "Multiple Currencies",
                "Recurring Invoices",
                "Inventory Management",
                "API Access"
            ],
            recommended: false
        },
        {
            name: "BASIC", // Uppercase as per image
            price: "$29",
            period: "/mo",
            features: [
                "Unlimited Invoicing",
                "Expense Tracking",
                "3 Users",
                "Client Management",
                "Standard Reports"
            ],
            unavailable: [
                "Multiple Currencies",
                "Recurring Invoices",
                "Inventory Management",
                "API Access"
            ],
            recommended: false
        },
        {
            name: "STANDARD", // Uppercase as per image
            price: "$59",
            period: "/mo",
            features: [
                "Unlimited Invoicing",
                "Expense Tracking",
                "5 Users",
                "Client Management",
                "Advanced Reports",
                "Multiple Currencies",
                "Recurring Invoices"
            ],
            unavailable: [
                "Inventory Management",
                "API Access"
            ],
            recommended: true // Typically standard is recommended, though user didn't specify.
        },
        {
            name: "PREMIUM", // Uppercase as per image
            price: "$99",
            period: "/mo",
            features: [
                "Unlimited Invoicing",
                "Expense Tracking",
                "Unlimited Users",
                "Client Management",
                "Advanced Reports",
                "Multiple Currencies",
                "Recurring Invoices",
                "Inventory Management",
                "API Access"
            ],
            unavailable: [],
            recommended: false
        }
    ];

    return (
        <section id="pricing" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold text-gray-900 sm:text-4xl"
                    >
                        Our Packages
                    </motion.h2>
                    <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
                        Choose the plan that fits your business needs.
                    </p>
                    {/* Decorative Line */}
                    <div className="flex justify-center items-center gap-2 mt-4 mb-4">
                        <div className="h-1 w-8 bg-gray-900 rounded-full"></div>
                        <div className="h-1 w-12 bg-blue-600 rounded-full"></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative bg-white rounded-3xl shadow-2xl overflow-hidden border-2 ${plan.recommended
                                ? 'border-blue-500 ring-4 ring-blue-100 scale-105 z-10'
                                : 'border-gray-200'
                                } transition-all duration-300 flex flex-col`}
                        >
                            {plan.recommended && (
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600" />
                            )}

                            <div className="p-8 flex-grow flex flex-col">
                                <h3 className="text-xl font-extrabold text-gray-900 mb-2 uppercase tracking-wide text-center">{plan.name}</h3>
                                <div className="flex items-center justify-center mb-6">
                                    <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{plan.price}</span>
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
                                        }`}>
                                        Choose Plan
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const Testimonials = () => {
    const testimonials = [
        {
            name: "Sarah Jenkins",
            role: "Financial Director",
            company: "TechFlow Inc.",
            content: "Ginum has completely transformed how we manage our finances. The automation features save us hours every week.",
            rating: 5
        },
        {
            name: "Michael Chen",
            role: "Small Business Owner",
            company: "Chen Design",
            content: "Incredibly intuitive and easy to use. I was up and running in minutes, and the support team is fantastic.",
            rating: 5
        },
        {
            name: "David Ross",
            role: "Freelance Consultant",
            company: "Ross Consulting",
            content: "The best accounting software for freelancers. It handles multiple currencies perfectly for my international clients.",
            rating: 4
        }
    ];

    return (
        <section id="reviews" className="py-24 bg-blue-50/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold text-gray-900 sm:text-4xl"
                    >
                        Customer Reviews
                    </motion.h2>
                    <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
                        See what our users are saying about Ginum.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 relative group hover:-translate-y-1 transition-transform"
                        >
                            <Quote className="absolute top-6 right-6 text-blue-100 w-12 h-12 transform rotate-180 group-hover:text-blue-200 transition-colors" />

                            <div className="flex items-center space-x-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                    />
                                ))}
                            </div>

                            <p className="text-gray-600 mb-6 italic relative z-10">
                                "{testimonial.content}"
                            </p>

                            <div className="flex items-center mt-auto">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 text-white flex items-center justify-center font-bold text-sm">
                                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="ml-3">
                                    <h4 className="text-gray-900 font-bold text-sm">{testimonial.name}</h4>
                                    <p className="text-gray-500 text-xs">{testimonial.role}, {testimonial.company}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const FAQ = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    const toggleFAQ = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    const faqs = [
        {
            question: "Do I need technical expertise to use Ginum?",
            answer: "Not at all! Ginum is designed with simplicity in mind, making it accessible for everyone, regardless of technical skill. The user interface is intuitive and easy to navigate, allowing you to manage your accounting tasks effortlessly. Whether you're new to accounting or experienced, Ginum ensures a seamless experience without any technical knowledge required."
        },
        {
            question: "Is my data secure?",
            answer: "Yes, your data is fully secure with Ginum. We use 256-bit SSL encryption to protect your information during transmission, ensuring that it remains private and safe from unauthorized access. Additionally, we follow strict GDPR compliance, giving you peace of mind that your data is handled with the highest level of security and privacy standards"
        },
        {
            question: "Can I cancel my subscription anytime?",
            answer: "Absolutely! We believe in providing flexibility, so there are no lock-in contracts with Ginum. You can cancel your subscription at any time directly from your account settings without any penalties. We aim to make the process as straightforward and hassle-free as possible."
        },
        {
            question: "Are there any hidden fees with Ginum?",
            answer: "No, Ginum prides itself on transparency. There are no hidden fees, and you only pay for the features and subscription plan you choose. Any additional charges, if applicable, are clearly communicated upfront, ensuring no surprises on your billing statement."
        }
    ];

    return (
        <section id="faq" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Centered Header Section */}
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-4xl font-extrabold text-gray-900 mb-6"
                    >
                        FAQ
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-700 max-w-2xl mx-auto text-center leading-relaxed"
                    >
                        Navigate the world of accounting effortlessly with our FAQ page, designed to simplify complex concepts and provide clear, actionable answers. From financial statements to tax tips, explore expert insights tailored to your needs.
                    </motion.p>

                    {/* Decorative Line */}
                    <div className="flex justify-center items-center gap-2 mt-8 mb-4">
                        <div className="h-1 w-8 bg-black rounded-full"></div>
                        <div className="h-1 w-12 bg-sky-400 rounded-full"></div>
                    </div>
                </div>

                {/* Two Column Layout: Image Left, FAQ Right */}
                <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-start">

                    {/* Left Column: Image */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex justify-center"
                    >
                        <img
                            src={faqImage}
                            alt="FAQ Illustration"
                            className="w-full max-w-md h-auto object-contain"
                        />
                    </motion.div>

                    {/* Right Column: FAQ Accordion */}
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                className="border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white"
                            >
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full flex justify-between items-center p-5 text-left focus:outline-none bg-white"
                                >
                                    <span className="font-bold text-gray-900 text-lg">{faq.question}</span>
                                    {activeIndex === index ? (
                                        <ChevronUp className="text-sky-500 w-5 h-5" />
                                    ) : (
                                        <ChevronDown className="text-gray-400 w-5 h-5" />
                                    )}
                                </button>

                                <AnimatePresence>
                                    {activeIndex === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="border-t border-gray-50"
                                        >
                                            <div className="p-5 pt-0 text-gray-700 text-sm leading-relaxed bg-white">
                                                <br />
                                                {faq.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

const Contact = () => {
    return (
        <section id="contact" className="py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-24">

                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                    >
                        <h2 className="text-4xl font-bold text-gray-900 tracking-tight">
                            Start Your Journey <br />
                            <span className="text-blue-600">With Ginum Today.</span>
                        </h2>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Have questions? Need help setting up? Our team is here to assist you every step of the way. Get in touch with us!
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">Headquarters</h4>
                                    <p className="text-gray-600">No 421, 4th floor,<br />sanvik plaza, Wakwella Rd, Galle,<br />Sri Lanka.</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">Phone</h4>
                                    <p className="text-gray-600">+94-74-070-9989</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">Email</h4>
                                    <p className="text-gray-600">info@ginumapps.com</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100/50"
                    >
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" placeholder="John" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" placeholder="Doe" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <input type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" placeholder="john@example.com" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                <textarea rows="4" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none" placeholder="Tell us about your needs..."></textarea>
                            </div>

                            <button type="submit" className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/40 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center">
                                Send Message
                                <Send className="ml-2 w-5 h-5" />
                            </button>
                        </form>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

const Footer = () => {
    return (
        <footer className="bg-[#0B1120] pt-20 pb-10 text-gray-300 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">

                    {/* Left Column: Logo & Description (Span 5 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="flex items-center gap-3">
                            <img src={logo} alt="Ginum Logo" className="h-10 w-auto brightness-0 invert" />
                            <span className="text-3xl font-extrabold text-white tracking-tight">GINUM</span>
                        </div>
                        <p className="text-gray-400 leading-relaxed text-md pr-4">
                            A seamless accounting experience for businesses of all sizes. Automate your finances, track progress, and achieve your goals faster.
                        </p>
                        <div className="pt-2">
                            <button 
                                onClick={() => window.location.href = 'http://localhost:5173/register?system=GINUMA'}
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
                            <li><a href="#features" className="hover:text-sky-400 transition-colors">About Us</a></li>
                            <li><a href="#pricing" className="hover:text-sky-400 transition-colors">Packages</a></li>
                            <li><a href="#faq" className="hover:text-sky-400 transition-colors">FAQ</a></li>
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
                                    <p className="text-gray-400 text-sm truncate">www.ginumapps.com</p>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-gray-800 rounded-full shadow-sm text-sky-400 flex-shrink-0">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div className="overflow-hidden">
                                    <h5 className="font-bold text-white text-sm uppercase mb-1">EMAIL:</h5>
                                    <p className="text-gray-400 text-sm truncate">info@ginumapps.com</p>
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
                        &copy; 2026 <span className="text-sky-400 font-bold">Ginum</span> Accounting Software. All Rights Reserved
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

const LandingPage = () => {
    return (
        <div className="font-sans antialiased text-gray-900 bg-white">
            <Navbar />
            <main>
                <Hero />
                <Features />
                <Glance />
                <Pricing />
                <Testimonials />
                <FAQ />
                <Contact />
            </main>
            <Footer />
        </div>
    );
};

export default LandingPage;