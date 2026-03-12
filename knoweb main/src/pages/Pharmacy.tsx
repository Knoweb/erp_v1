import { HeartPulse, Check } from 'lucide-react';

const Pharmacy = () => {
    return (
        <div className="pt-16 bg-white">
            {/* Hero Section */}
            <section className="relative py-20 bg-gray-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 to-teal-900/40 z-0"></div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-600 rounded-full blur-3xl opacity-20 animate-pulse"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
                    <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg mb-6">
                        <HeartPulse className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
                        Pharmacy Management
                    </h1>
                    <p className="mt-4 max-w-3xl mx-auto text-xl text-gray-300 leading-relaxed">
                        Precision healthcare management. Ensure compliance, manage inventory, and deliver better patient care with our specialized system.
                    </p>
                </div>
            </section>

            {/* Features Detail */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Efficiency Meets Care</h2>
                            <p className="text-lg text-gray-600 mb-8">
                                Designed for modern pharmacies. Reduce errors, optimize stock levels, and focus on what matters most: your patients.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    'Smart Inventory & Expiry Alerts',
                                    'Prescription Processing & Tracking',
                                    'Supplier & Purchase Order Management',
                                    'Point of Sale (POS) Integration',
                                    'Patient Medication History',
                                    'Regulatory Compliance Reports'
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center text-gray-700">
                                        <div className="mr-4 p-1 rounded-full bg-emerald-100">
                                            <Check className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <button className="mt-10 px-8 py-3 bg-emerald-600 text-white rounded-full font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/30">
                                Get A Quote
                            </button>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl transform rotate-3 opacity-10"></div>
                            <div className="relative bg-white border border-gray-100 p-8 rounded-3xl shadow-xl">
                                {/* Mock UI */}
                                <div className="flex space-x-4 mb-4">
                                    <div className="h-10 w-1/2 bg-gray-50 rounded-lg border border-gray-100"></div>
                                    <div className="h-10 w-1/4 bg-emerald-50 rounded-lg border border-emerald-100"></div>
                                </div>
                                <div className="mb-6">
                                    <div className="h-40 bg-gray-50 rounded-xl border border-gray-100 relative overflow-hidden">
                                        <div className="absolute top-4 left-4 h-4 w-20 bg-emerald-200 rounded"></div>
                                        <div className="absolute top-12 left-4 right-4 h-2 bg-gray-200 rounded"></div>
                                        <div className="absolute top-20 left-4 right-12 h-2 bg-gray-200 rounded"></div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-sm text-gray-400">
                                    <span>Stock Level: <span className="text-emerald-600 font-bold">Optimal</span></span>
                                    <span>Orders: <span className="text-gray-900 font-bold">12 Pending</span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Pharmacy;
