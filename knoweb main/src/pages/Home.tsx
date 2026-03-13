import { ArrowRight, Zap, Shield, Users, Target, Rocket, Globe, Award, Mail, Phone, MapPin, Send, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import ginumLogo from '../assets/ginum_logo.png';
import pirisahrLogo from '../assets/pirisa-logo.png';
import inventoryLogo from '../assets/inventory-logo.png';
import allinoneLogo from '../assets/all-logo.png';

const Home = () => {

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section id="home" className="relative min-h-screen flex items-center pt-32 pb-20 lg:pt-0 lg:pb-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 z-0"></div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-30 animate-pulse delay-1000"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-8">
                        Building the Future of <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                            Enterprise Management
                        </span>
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 mb-10">
                        Integrated solutions for HR, Inventory and Business Operations. Experience the power of synchronized systems with KNOWEB.
                    </p>
                    <div className="flex justify-center gap-4 pt-5">
                        <a
                            href="/register"
                            className="inline-flex items-center px-10 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-full font-bold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all transform hover:-translate-y-1 hover:scale-105"
                        >
                            Get Started
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </a>
                    </div>
                </div>
            </section>

            {/* Products / Features Section */}
            <section id="products" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-base text-cyan-600 font-semibold tracking-wide uppercase">Our Ecosystem</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Comprehensive Integration
                        </p>
                        <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                            A comprehensive suite of tools designed to streamline every aspect of your organization.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                title: 'Ginum System',
                                icon: Zap,
                                image: ginumLogo,
                                description: 'Comprehensive accounting and financial management platform with automated invoicing, real-time reporting, multi-currency support, and intelligent expense tracking to streamline your business operations.',
                                color: 'from-orange-400 to-red-500',
                                link: '/landingpage',
                                external: false
                            },
                            {
                                title: 'PirisaHR',
                                icon: Users,
                                image: pirisahrLogo,
                                description: 'Advanced HR management system featuring automated payroll processing, employee self-service portal, attendance tracking, leave management, performance analytics, and comprehensive workforce insights to empower your team.',
                                color: 'from-blue-400 to-indigo-500',
                                link: '/pirisahr-landing'
                            },
                            {
                                title: 'Inventory System',
                                icon: Shield,
                                image: inventoryLogo,
                                description: 'Intelligent inventory management solution with real-time stock tracking, automated reorder alerts, multi-warehouse support, supplier management, barcode scanning, and detailed analytics to optimize your supply chain operations.',
                                color: 'from-emerald-400 to-teal-500',
                                link: '/inventory-landing'
                            },
                            {
                                title: 'All In One',
                                icon: Rocket,
                                image: allinoneLogo,
                                description: 'Unified business management platform seamlessly integrating ERP, HR, and Inventory systems. Access comprehensive dashboards, cross-module reporting, centralized data management, and synchronized workflows to drive operational excellence across your entire organization.',
                                color: 'from-purple-500 to-pink-500',
                                link: '/all-in-one'
                            }
                        ].map((feature, idx) => (
                            <div key={idx} className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-300 hover:-translate-y-2 hover:scale-[1.02] w-full min-h-[500px] flex flex-col overflow-hidden cursor-pointer">
                                <Link
                                    to={feature.link}
                                    className="absolute inset-0 z-20"
                                >
                                    <span className="sr-only">View details about {feature.title}</span>
                                </Link>

                                <div className={`h-56 w-full bg-gradient-to-br ${feature.color} flex items-center justify-center relative overflow-hidden group-hover:scale-110 transition-transform duration-700 ease-out`}>
                                    {feature.image ? (
                                        <img src={feature.image} alt={feature.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <feature.icon className="w-20 h-20 text-white opacity-90" />
                                    )}
                                </div>

                                <div className="p-8 flex flex-col flex-grow justify-between bg-white relative z-10">
                                    <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
                                    </div>

                                    <div className="inline-flex items-center text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-all duration-300 mt-6">
                                        Learn more <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 relative">
                        <div className="absolute inset-0 flex items-center justify-center opacity-10">
                            <div className="w-96 h-96 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-3xl"></div>
                        </div>
                        <h2 className="text-3xl font-extrabold sm:text-4xl relative z-10 text-gray-900">
                            About KNOWEB
                        </h2>
                        <p className="mt-6 max-w-3xl text-xl text-gray-600 mx-auto leading-relaxed relative z-10">
                            KNOWEB is your trusted partner in digital transformation. We bring together cutting-edge technology and deep business expertise to deliver integrated solutions that simplify complex operations and accelerate your success.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
                        {/* Mission Card */}
                        <div className="group relative bg-white/60 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/50 shadow-xl shadow-slate-200/60 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/50 to-cyan-100/50 rounded-full blur-3xl -mr-32 -mt-32 transition-all duration-700 group-hover:scale-150 group-hover:opacity-70"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-100/30 to-blue-50/30 rounded-full blur-2xl -ml-20 -mb-20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center mb-8 text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                    <Target className="w-8 h-8" />
                                </div>
                                <h3 className="text-3xl font-bold text-slate-800 mb-6 group-hover:text-blue-600 transition-colors duration-300">Our Mission</h3>
                                <p className="text-slate-600 text-lg leading-relaxed font-medium">
                                    We exist to simplify business management for organizations of all sizes. By providing seamless, integrated solutions that connect your financial operations, human resources, and inventory management, we help you eliminate silos, reduce manual work, and make data-driven decisions with confidence.
                                </p>
                            </div>
                        </div>

                        {/* Vision Card */}
                        <div className="group relative bg-white/60 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/50 shadow-xl shadow-slate-200/60 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-100/50 to-blue-100/50 rounded-full blur-3xl -mr-32 -mt-32 transition-all duration-700 group-hover:scale-150 group-hover:opacity-70"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-100/30 to-cyan-50/30 rounded-full blur-2xl -ml-20 -mb-20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-8 text-white shadow-lg shadow-cyan-500/20 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                                    <Rocket className="w-8 h-8" />
                                </div>
                                <h3 className="text-3xl font-bold text-slate-800 mb-6 group-hover:text-cyan-600 transition-colors duration-300">Our Vision</h3>
                                <p className="text-slate-600 text-lg leading-relaxed font-medium">
                                    We envision a future where every business, regardless of size or industry, has access to enterprise-grade management tools that are intuitive, affordable, and powerful. Our goal is to create a unified ecosystem where your ERP, HR, and inventory systems work together seamlessly, giving you complete visibility and control over your operations.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { title: 'Innovation First', icon: Globe, desc: 'We continuously evolve our platform with the latest technologies to keep you ahead of the competition.' },
                            { title: 'User-Centric Design', icon: Award, desc: 'Every feature is designed with your team in mind, ensuring intuitive workflows and minimal training time.' },
                            { title: 'Unwavering Reliability', icon: Target, desc: 'Your business depends on us, and we deliver rock-solid performance, security, and support 24/7.' },
                            { title: 'Comprehensive Integration', icon: Layers, desc: 'Seamlessly connect all your business functions into one unified platform for maximum efficiency.' }
                        ].map((val, idx) => (
                            <div key={idx} className="group relative bg-white p-8 rounded-2xl border border-gray-200 text-center shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative z-10">
                                    <div className="w-14 h-14 mx-auto bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                                        <val.icon className="w-7 h-7 text-blue-600 group-hover:text-cyan-600 transition-colors" />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{val.title}</h4>
                                    <p className="text-gray-600 text-sm leading-relaxed">{val.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="relative py-24 bg-white overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
                    <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-6">
                            Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Touch</span>
                        </h2>
                        <p className="max-w-2xl mx-auto text-xl text-gray-500 leading-relaxed">
                            Have questions? We're here to help you transform your business with our integrated solutions.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
                        {/* Contact Info Cards */}
                        <div className="lg:col-span-1 space-y-8">
                            {[
                                {
                                    icon: Mail,
                                    title: 'Email Us',
                                    content: 'info@knowebsolutions.com',
                                    sub: 'We usually reply within 24 hours.',
                                    color: 'text-blue-500',
                                    bg: 'bg-blue-50'
                                },
                                {
                                    icon: Phone,
                                    title: 'Call Us',
                                    content: '(+94)70 24 93 211',
                                    sub: 'Mon-Fri from 8am to 5pm.',
                                    color: 'text-cyan-500',
                                    bg: 'bg-cyan-50'
                                },
                                {
                                    icon: MapPin,
                                    title: 'Visit Us',
                                    content: 'No.422, 4th floor, Sanvik plaza, Wakwella Road, Galle, Sri Lanka.',
                                    sub: 'Tech City, Galle.',
                                    color: 'text-purple-500',
                                    bg: 'bg-purple-50'
                                }
                            ].map((item, idx) => (
                                <div key={idx} className="group bg-white p-8 rounded-3xl shadow-lg shadow-gray-100 hover:shadow-2xl transition-all duration-300 border border-gray-50 hover:-translate-y-1">
                                    <div className="flex items-start space-x-6">
                                        <div className={`w-14 h-14 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                                            <item.icon className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">{item.title}</h3>
                                            <p className="text-gray-900 font-medium mb-1">{item.content}</p>
                                            <p className="text-sm text-gray-400">{item.sub}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100 p-8 md:p-12 relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-100 to-blue-50 rounded-bl-full opacity-50"></div>

                                <form className="space-y-8 relative z-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700 ml-1">First Name</label>
                                            <input
                                                type="text"
                                                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 outline-none font-medium text-gray-900 placeholder-gray-400"
                                                placeholder="John"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700 ml-1">Last Name</label>
                                            <input
                                                type="text"
                                                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 outline-none font-medium text-gray-900 placeholder-gray-400"
                                                placeholder="Doe"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
                                        <input
                                            type="email"
                                            className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 outline-none font-medium text-gray-900 placeholder-gray-400"
                                            placeholder="john@company.com"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 ml-1">Message</label>
                                        <textarea
                                            rows={4}
                                            className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 outline-none font-medium text-gray-900 placeholder-gray-400 resize-none"
                                            placeholder="Tell us how we can help..."
                                        ></textarea>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            className="group w-full py-5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/30 hover:shadow-cyan-500/50 transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.99] flex items-center justify-center space-x-3"
                                        >
                                            <span>Send Message</span>
                                            <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Home;