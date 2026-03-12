import { Check, X } from 'lucide-react';

const P_packages = () => {
    const plans = [
        {
            name: 'STARTER',
            price: '25',
            color: 'text-gray-800',
            btnStyle: 'bg-white text-gray-800 border-2 border-gray-800 hover:bg-gray-50'
        },
        {
            name: 'GROWTH',
            price: '49',
            color: 'text-indigo-500',
            btnStyle: 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/30'
        },
        {
            name: 'PROFESSIONAL',
            price: '89',
            color: 'text-gray-800',
            btnStyle: 'bg-white text-gray-800 border-2 border-gray-800 hover:bg-gray-50'
        },
        {
            name: 'ENTERPRISE',
            price: '149',
            color: 'text-indigo-500',
            btnStyle: 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/30'
        }
    ];

    const features = [
        { name: 'Employee Database (up to 10)', included: [true, true, true, true] },
        { name: 'Leave Management', included: [true, true, true, true] },
        { name: 'Attendance Tracking', included: [true, true, true, true] },
        { name: 'Document Management', included: [true, true, true, true] },
        { name: 'Employee Self-Service (ESS)', included: [true, true, true, true] },
        { name: 'Payroll Processing', included: [false, true, true, true] },
        { name: 'Statutory Compliance', included: [false, true, true, true] },
        { name: 'Expense Claims', included: [false, true, true, true] },
        { name: 'Asset Management', included: [false, false, true, true] },
        { name: 'Recruitment (ATS)', included: [false, false, true, true] },
        { name: 'Onboarding & Offboarding', included: [false, false, true, true] },
        { name: 'Performance Appraisals', included: [false, false, true, true] },
        { name: 'Training & Development', included: [false, false, false, true] },
        { name: 'Shift Scheduling', included: [false, false, false, true] },
        { name: 'Advanced Analytics', included: [false, false, false, true] },
        { name: 'Bio-metric Integration', included: [false, false, false, true] },
        { name: 'API Access', included: [false, false, false, true] },
        { name: 'Dedicated Account Manager', included: [false, false, false, true] },
    ];

    return (
        <section className="py-24 bg-white" id="packages">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-4">PirisaHR Packages</h2>
                    <p className="text-gray-500 text-lg">Scalable HR Solutions for Growing Teams.</p>
                    <div className="w-24 h-1 bg-gradient-to-r from-gray-800 to-indigo-500 mx-auto mt-4 rounded-full"></div>
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
                                                    <Check className="w-5 h-5 text-indigo-500" />
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
                                            onClick={() => window.open('#contact', '_self')}
                                        >
                                            Start Trial
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

export default P_packages;
