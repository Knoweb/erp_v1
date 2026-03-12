import { Check, BarChart3, Users, HeartPulse, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Products = () => {
    const systems = [
        {
            id: 'ginuma',
            title: 'Ginum System',
            description: 'The backbone of your financial operations. Ginum provides comprehensive tools for accounting, invoicing, and financial forecasting.',
            icon: BarChart3,
            color: 'blue',
            features: ['Real-time financial tracking', 'Automated invoicing', 'Tax compliance tools', 'Multi-currency support'],
            gradient: 'from-blue-500 to-cyan-500',
            link: '/ginum'
        },
        {
            id: 'pirisahr',
            title: 'PirisaHR',
            description: 'Empower your most valuable asset - your people. PirisaHR streamlines recruitment, onboarding, and ongoing employee management.',
            icon: Users,
            color: 'indigo',
            features: ['Employee self-service portal', 'Performance management', 'Attendance tracking', 'Payroll integration'],
            gradient: 'from-indigo-500 to-purple-500',
            link: '/pirisahr'
        },
        {
            id: 'pharmacy',
            title: 'Pharmacy Management',
            description: 'Specialized solutions for the healthcare sector. Manage inventory, prescriptions, and patient records with precision and care.',
            icon: HeartPulse,
            color: 'emerald',
            features: ['Inventory control', 'Prescription tracking', 'Supplier management', 'Expiry date alerts'],
            gradient: 'from-emerald-500 to-teal-500',
            link: '/pharmacy'
        }
    ];

    return (
        <div className="pt-16">
            {/* Header */}
            <div className="bg-gray-900 text-white py-24 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-10 translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600 rounded-full blur-3xl opacity-10 -translate-x-1/2 translate-y-1/2"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">Our Integrated Ecosystem</h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                        Three powerful systems working in harmony to drive your success.
                    </p>
                </div>
            </div>

            {/* Systems */}
            {systems.map((system, idx) => (
                <section key={system.id} className={`py-24 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className={`flex flex-col md:flex-row items-center gap-16 ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>

                            <div className="flex-1">
                                <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${system.gradient} shadow-lg mb-6`}>
                                    <system.icon className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{system.title}</h2>
                                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                    {system.description}
                                </p>
                                <ul className="space-y-4">
                                    {system.features.map((feature, i) => (
                                        <li key={i} className="flex items-center text-gray-700">
                                            <div className={`mr-4 p-1 rounded-full bg-gradient-to-r ${system.gradient}`}>
                                                <Check className="w-4 h-4 text-white" />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    to={system.link}
                                    className={`inline-flex items-center mt-8 px-6 py-3 rounded-full text-white bg-gradient-to-r ${system.gradient} shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 font-medium`}
                                >
                                    Learn More
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Link>
                            </div>

                            <div className="flex-1 w-full">
                                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-900 aspect-video group transform transition-transform hover:scale-[1.02] duration-500">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${system.gradient} opacity-20`}></div>
                                    {/* Abstract UI Representation */}
                                    <div className="absolute inset-4 bg-gray-800 rounded-xl p-6 opacity-90 border border-gray-700/50">
                                        <div className="flex items-center space-x-2 mb-6 opacity-50">
                                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="h-2 bg-gray-600 rounded w-3/4"></div>
                                            <div className="h-2 bg-gray-600 rounded w-1/2"></div>
                                            <div className="grid grid-cols-3 gap-4 mt-8">
                                                <div className="h-20 bg-gray-700/50 rounded-lg animate-pulse"></div>
                                                <div className="h-20 bg-gray-700/50 rounded-lg animate-pulse delay-100"></div>
                                                <div className="h-20 bg-gray-700/50 rounded-lg animate-pulse delay-200"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>
            ))}

            {/* Team CTA */}
            <div className="bg-white py-24 border-t border-gray-100">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Expertise Across Domains</h2>
                    <p className="text-lg text-gray-600 mb-10">
                        Our team of specialists works tirelessly to ensure each system meets the specific needs of its industry standard.
                    </p>
                    <button className="px-8 py-3 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-colors">
                        Meet the Team
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Products;
