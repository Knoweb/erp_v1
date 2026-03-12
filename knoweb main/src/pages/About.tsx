import { Award, Globe, Rocket, Target } from 'lucide-react';

const About = () => {
    return (
        <div className="pt-16 bg-white">
            {/* Hero Section */}
            <section className="relative py-20 bg-gray-900 overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80')] bg-cover bg-center"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-gray-900/90"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
                        About <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">KNOWEB</span>
                    </h1>
                    <p className="mt-4 max-w-3xl mx-auto text-xl text-gray-300 leading-relaxed">
                        We are a forward-thinking technology company dedicated to transforming how businesses operate through integrated, intelligent software solutions.
                    </p>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="bg-gradient-to-br from-blue-50 to-white p-10 rounded-3xl border border-blue-100 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                                <Target className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
                            <p className="text-gray-600 leading-relaxed">
                                To empower organizations with seamless, intuitive, and powerful management tools that eliminate inefficiency and drive growth. We believe in technology that works for people, not the other way around.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-cyan-50 to-white p-10 rounded-3xl border border-cyan-100 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="w-14 h-14 bg-cyan-100 rounded-2xl flex items-center justify-center mb-6 text-cyan-600">
                                <Rocket className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
                            <p className="text-gray-600 leading-relaxed">
                                To be the global standard for integrated business solutions, creating a connected ecosystem where HR, Finance, and Operations speak the same language.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2">
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80"
                                    alt="Team collaboration"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-blue-900/10"></div>
                            </div>
                        </div>
                        <div className="lg:w-1/2">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Who We Are</h2>
                            <div className="space-y-6 text-lg text-gray-600">
                                <p>
                                    Founded with a passion for innovation, Knoweb Solution began as a small team of developers who saw a gap in the enterprise software market. Systems were clunky, disconnected, and difficult to use.
                                </p>
                                <p>
                                    We set out to change that by building a unified platform. Our journey started with a simple belief: <strong className="text-gray-900">Complexity should not be the barrier to success.</strong>
                                </p>
                                <div className="flex items-center gap-8 mt-8">
                                    <div className="flex flex-col">
                                        <span className="text-3xl font-bold text-blue-600">5+</span>
                                        <span className="text-sm text-gray-500">Years Industry Experience</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-3xl font-bold text-cyan-600">100+</span>
                                        <span className="text-sm text-gray-500">Projects Delivered</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900">Core Values</h2>
                        <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
                            The principles that guide every line of code we write and every interaction we have.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'Innovation First',
                                desc: 'We constantly challenge the status quo to find better, faster, and smarter solutions.',
                                icon: Globe
                            },
                            {
                                title: 'User-Centric Design',
                                desc: 'We prioritize the user experience above all else. Powerful software should still be beautiful.',
                                icon: Award
                            },
                            {
                                title: 'Reliability',
                                desc: 'Trust is earned. We build robust systems that businesses can depend on, day in and day out.',
                                icon: Target
                            }
                        ].map((value, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-cyan-200 shadow-sm hover:shadow-md transition-all text-center group">
                                <div className="w-16 h-16 mx-auto bg-gray-50 group-hover:bg-cyan-50 rounded-full flex items-center justify-center mb-6 transition-colors">
                                    <value.icon className="w-8 h-8 text-gray-400 group-hover:text-cyan-600 transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                                <p className="text-gray-500">
                                    {value.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;