import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-slate-300 pt-20 pb-10 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-16">
                    {/* Brand Section */}
                    <div className="lg:col-span-1">
                        <a href="/" className="inline-block text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 mb-6">
                            KNOWEB
                        </a>
                        <p className="text-slate-400 leading-relaxed mb-8">
                            Empowering businesses with seamless, integrated solutions. From ERP to HR and Inventory, we build the tools that drive your success.
                        </p>
                        <div className="flex space-x-4">
                            {[
                                { icon: Facebook, href: '#' },
                                { icon: Twitter, href: '#' },
                                { icon: Instagram, href: '#' },
                                { icon: Linkedin, href: '#' }
                            ].map((social, i) => (
                                <a
                                    key={i}
                                    href={social.href}
                                    className="bg-slate-800 p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-600 hover:text-white transition-all duration-300 group"
                                >
                                    <social.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Solutions Links */}
                    <div>
                        <h4 className="text-lg font-bold text-white mb-8 relative inline-block">
                            Solutions
                            <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-cyan-500 rounded-full"></span>
                        </h4>
                        <ul className="space-y-4">
                            {[
                                { name: 'Ginum System', href: '/ginum' },
                                { name: 'PirisaHR', href: '/pirisahr' },
                                { name: 'Inventory System', href: '/inventory' },
                                { name: 'All-In-One Platform', href: '/all-in-one' },

                            ].map((item) => (
                                <li key={item.name}>
                                    <a href={item.href} className="group flex items-center text-slate-400 hover:text-cyan-400 transition-colors">
                                        <ArrowRight className="h-3 w-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                                        {item.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 className="text-lg font-bold text-white mb-8 relative inline-block">
                            Company
                            <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-blue-500 rounded-full"></span>
                        </h4>
                        <ul className="space-y-4">
                            {[
                                { name: 'About Us', href: '#about' },
                                { name: 'Careers', href: '#' },
                                { name: 'Blog', href: '#' },
                                { name: 'Contact Us', href: '#contact' },

                            ].map((item) => (
                                <li key={item.name}>
                                    <a href={item.href} className="group flex items-center text-slate-400 hover:text-blue-400 transition-colors">
                                        <ArrowRight className="h-3 w-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                                        {item.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-lg font-bold text-white mb-8 relative inline-block">
                            Get in Touch
                            <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-purple-500 rounded-full"></span>
                        </h4>
                        <ul className="space-y-6">
                            <li className="flex items-start space-x-4">
                                <div className="bg-slate-800 p-2 rounded-lg text-cyan-400 mt-1">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <span className="text-slate-400 leading-relaxed">
                                    No.422, 4th floor, Sanvik plaza, Wakwella Road, Galle, Sri Lanka.<br />

                                </span>
                            </li>
                            <li className="flex items-center space-x-4">
                                <div className="bg-slate-800 p-2 rounded-lg text-blue-400">
                                    <Phone className="h-5 w-5" />
                                </div>
                                <span className="text-slate-400">(+94)70 24 93 211</span>
                            </li>
                            <li className="flex items-center space-x-4">
                                <div className="bg-slate-800 p-2 rounded-lg text-purple-400">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <span className="text-slate-400">info@knowebsolutions.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright & Legal */}
                <div className="border-t border-slate-800 pt-10 mt-10">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-center md:text-left">
                        <p className="text-slate-500 text-sm">
                            &copy; {new Date().getFullYear()} KNOWEB Technologies. All rights reserved.
                        </p>
                        <div className="flex space-x-8 text-sm text-slate-500">
                            <a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-cyan-400 transition-colors">Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;