import { Check, X } from 'lucide-react';

const G_packages = () => {
    const plans = [
        {
            name: 'STARTER',
            price: '15',
            color: 'text-gray-800',
            btnStyle: 'bg-white text-gray-800 border-2 border-gray-800 hover:bg-gray-50'
        },
        {
            name: 'BASIC',
            price: '29',
            color: 'text-cyan-500',
            btnStyle: 'bg-cyan-500 text-white hover:bg-cyan-600 shadow-lg shadow-cyan-500/30'
        },
        {
            name: 'STANDARD',
            price: '59',
            color: 'text-gray-800',
            btnStyle: 'bg-white text-gray-800 border-2 border-gray-800 hover:bg-gray-50'
        },
        {
            name: 'PREMIUM',
            price: '99',
            color: 'text-cyan-500',
            btnStyle: 'bg-cyan-500 text-white hover:bg-cyan-600 shadow-lg shadow-cyan-500/30'
        }
    ];

    const features = [
        { name: 'Double-entry bookkeeping', included: [true, true, true, true] },
        { name: 'Profit & Loss (P&L)', included: [true, true, true, true] },
        { name: 'Trial Balance (TB)', included: [true, true, true, true] },
        { name: 'Balance Sheet', included: [true, true, true, true] },
        { name: 'Sales and Expenses Tracking', included: [true, true, true, true] },
        { name: 'Quotations and Invoices', included: [true, true, true, true] },
        { name: 'Basic Dashboard', included: [true, true, true, true] },
        { name: 'Project-wise expenses tracking', included: [false, true, true, true] },
        { name: 'Period-wise P&L, TB, Balance Sheet', included: [false, true, true, true] },
        { name: 'Bank reconciliation', included: [false, true, true, true] },
        { name: 'Asset register', included: [false, true, true, true] },
        { name: 'Employee management', included: [false, true, true, true] },
        { name: 'Payroll management', included: [false, false, true, true] },
        { name: 'Inventory management', included: [false, false, true, true] },
        { name: 'Depreciation tracking', included: [false, false, true, true] },
        { name: 'Period-wise report generation', included: [false, false, true, true] },
        { name: 'Advanced dashboard & reporting tools', included: [false, false, true, true] },
        { name: 'Unlimited projects and employees', included: [false, false, false, true] },
        { name: 'Advanced inventory management', included: [false, false, false, true] },
        { name: 'Advanced sales tracking', included: [false, false, false, true] },
        { name: 'Advanced Tax Calculation', included: [false, false, false, true] },
        { name: 'Priority customer support', included: [false, false, false, true] },
    ];

    return (
        <section className="py-24 bg-white" id="packages">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Our Packages</h2>
                    <p className="text-gray-500 text-lg">Affordable Plans for Every Business.</p>
                    <div className="w-24 h-1 bg-gradient-to-r from-gray-800 to-cyan-500 mx-auto mt-4 rounded-full"></div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] border-collapse">
                        <thead>
                            <tr className="border-b-2 border-gray-900">
                                <th className="text-left py-6 px-6 w-1/4 text-gray-800 font-bold uppercase tracking-wider">Features</th>
                                {plans.map((plan, index) => (
                                    <th key={index} className="text-center py-6 px-4 w-[18%] align-top">
                                        <div className={`text-lg font-bold ${plan.color} uppercase mb-1`}>{plan.name}</div>
                                        <div className={`text-xl font-bold ${plan.color}`}>{plan.price}/mo</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {features.map((feature, featureIndex) => (
                                <tr key={featureIndex} className={featureIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                    <td className="py-4 px-6 text-gray-700 font-medium text-sm border-b border-gray-100">{feature.name}</td>
                                    {feature.included.map((isIncluded, planIndex) => (
                                        <td key={planIndex} className="text-center py-4 px-4 border-b border-gray-100">
                                            <div className="flex justify-center">
                                                {isIncluded ? (
                                                    <Check className="w-5 h-5 text-cyan-500" />
                                                ) : (
                                                    <X className="w-4 h-4 text-red-400 opacity-60" />
                                                )}
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            {/* Price Footer Row */}
                            <tr className="bg-gray-100 border-t-2 border-gray-900">
                                <td className="py-6 px-6"></td>
                                {plans.map((plan, index) => (
                                    <td key={index} className="text-center py-6 px-4">
                                        <div className="text-2xl font-extrabold text-gray-900 mb-6">${plan.price}/mo</div>
                                        <button
                                            className={`px-8 py-2.5 rounded-full font-bold text-sm transition-all transform hover:-translate-y-1 ${plan.btnStyle}`}
                                            onClick={() => window.open('#contact', '_self')} // Assuming contact or checkout link
                                        >
                                            Buy Plan
                                        </button>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
};

export default G_packages;
