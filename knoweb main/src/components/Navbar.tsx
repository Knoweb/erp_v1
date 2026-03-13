import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogIn } from 'lucide-react';
import logo from '../assets/knoweb-logo.png';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('home');
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);

            // Detect active section
            const sections = ['home', 'products', 'about', 'contact'];
            const current = sections.find(section => {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    return rect.top <= 100 && rect.bottom >= 100;
                }
                return false;
            });
            if (current) setActiveSection(current);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const navLinks = [
        { name: 'Home', path: '#home', id: 'home' },
        { name: 'Products', path: '#products', id: 'products' },
        { name: 'About', path: '#about', id: 'about' },
        { name: 'Contact', path: '#contact', id: 'contact' },
    ];

    const handleNavClick = (e: React.MouseEvent<HTMLElement>, path: string) => {
        if (path.startsWith('#')) {
            e.preventDefault();
            if (location.pathname !== '/') {
                window.location.href = '/' + path;
            } else {
                const id = path.substring(1);
                const element = document.getElementById(id);
                if (element) {
                    const offset = 80;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - offset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        }
        setIsOpen(false);
    };

    return (
        <>
            <nav
                className={`fixed w-full z-50 transition-all duration-500 ${scrolled
                    ? 'bg-white/70 backdrop-blur-xl shadow-lg shadow-gray-200/50 py-3'
                    : 'bg-gradient-to-b from-white/80 to-transparent backdrop-blur-sm py-5'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        {/* Logo */}
                        <Link
                            to="/"
                            className="flex items-center space-x-3 group"
                        >
                            <img src={logo} alt="KNOWEB" className="h-12 w-auto object-contain mix-blend-multiply" />
                        </Link>


                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center space-x-8">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.path}
                                    onClick={(e) => handleNavClick(e, link.path)}
                                    className={`relative px-4 py-2 text-base font-semibold transition-all duration-300 cursor-pointer group ${activeSection === link.id
                                        ? 'text-cyan-600'
                                        : 'text-gray-600 hover:text-cyan-600'
                                        }`}
                                >
                                    <span className="relative z-10">{link.name}</span>

                                    {/* Active indicator */}
                                    {activeSection === link.id && (
                                        <span className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg"></span>
                                    )}

                                    {/* Hover effect */}
                                    <span className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 rounded-lg transition-all duration-300"></span>

                                    {/* Bottom border animation */}
                                    <span className={`absolute bottom-0 left-1/2 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300 ${activeSection === link.id
                                        ? 'w-full -translate-x-1/2'
                                        : 'w-0 group-hover:w-full -translate-x-1/2'
                                        }`}></span>
                                </a>
                            ))}
                        </div>

                        {/* Auth Section */}
                        <div className="hidden md:flex items-center space-x-4">
                            <a
                                href="http://localhost:5173/register"
                                className="group flex items-center space-x-2 px-6 py-2.5 border-2 border-blue-600 rounded-full text-base font-bold text-gray-900 bg-white hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-blue-500/30"
                            >
                                <LogIn className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                <span>Get Started</span>
                            </a>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="relative p-2 text-gray-600 hover:text-cyan-600 focus:outline-none transition-colors duration-300"
                                aria-label="Toggle menu"
                            >
                                <div className="relative w-6 h-6">
                                    <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}`}>
                                        <Menu className="h-6 w-6" />
                                    </span>
                                    <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'}`}>
                                        <X className="h-6 w-6" />
                                    </span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={() => setIsOpen(false)}
            />

            {/* Mobile Menu */}
            <div
                className={`fixed top-0 right-0 h-full w-[280px] bg-white shadow-2xl z-50 md:hidden transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Mobile Menu Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <Link to="/" onClick={() => setIsOpen(false)}>
                            <img src={logo} alt="KNOWEB" className="h-12 w-auto object-contain mix-blend-multiply" />
                        </Link>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Mobile Menu Links */}
                    <div className="flex-1 overflow-y-auto py-6 px-4">
                        <div className="space-y-2">
                            {navLinks.map((link, index) => (
                                <a
                                    key={link.name}
                                    href={link.path}
                                    onClick={(e) => handleNavClick(e, link.path)}
                                    className={`block px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 ${activeSection === link.id
                                        ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-600'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{link.name}</span>
                                        {activeSection === link.id && (
                                            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 animate-pulse"></span>
                                        )}
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Mobile Menu Footer */}
                    <div className="p-6 border-t border-gray-100 space-y-4">
                        <a
                            href="http://localhost:5173/register"
                            className="group flex items-center justify-center space-x-2 w-full px-6 py-3 border-2 border-blue-600 rounded-xl font-bold text-gray-900 bg-white hover:bg-blue-600 hover:text-white transition-all duration-300"
                            onClick={() => setIsOpen(false)}
                        >
                            <LogIn className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                            <span>Get Started</span>
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;