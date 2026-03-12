import { Mail, MapPin, Phone, Send } from 'lucide-react';

const Contact = () => {
    return (
        <div className="pt-24 pb-16 min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">Get in Touch</h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                        Have questions about our systems? We're here to help you transform your business.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {[
                            { icon: Mail, title: 'Email Us', content: 'hello@knoweb.com', description: 'We will respond within 24 hours' },
                            { icon: Phone, title: 'Call Us', content: '+1 (555) 123-4567', description: 'Mon-Fri from 9am to 6pm' },
                            { icon: MapPin, title: 'Visit Us', content: '123 Innovation Drive', description: 'Tech City, TC 90210' }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center mb-6">
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                                <p className="text-cyan-600 font-medium mb-1">{item.content}</p>
                                <p className="text-gray-400 text-sm">{item.description}</p>
                            </div>
                        ))}
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                            <div className="p-8 md:p-12">
                                <h2 className="text-2xl font-bold text-gray-900 mb-8">Send us a message</h2>
                                <form className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                            <input type="text" id="firstName" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-cyan-500 focus:bg-white focus:ring-0 transition-colors" placeholder="John" />
                                        </div>
                                        <div>
                                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                            <input type="text" id="lastName" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-cyan-500 focus:bg-white focus:ring-0 transition-colors" placeholder="Doe" />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                        <input type="email" id="email" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-cyan-500 focus:bg-white focus:ring-0 transition-colors" placeholder="john@example.com" />
                                    </div>

                                    <div>
                                        <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">Interested In</label>
                                        <select id="topic" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-cyan-500 focus:bg-white focus:ring-0 transition-colors">
                                            <option>General Inquiry</option>
                                            <option>Ginum System</option>
                                            <option>PirisaHR</option>
                                            <option>Pharmacy Management</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                        <textarea id="message" rows={4} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-cyan-500 focus:bg-white focus:ring-0 transition-colors" placeholder="How can we help you?"></textarea>
                                    </div>

                                    <button type="submit" className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2">
                                        <Send className="w-5 h-5" />
                                        <span>Send Message</span>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;