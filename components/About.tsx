import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface AboutProps {
    aboutImage: string;
}

const About: React.FC<AboutProps> = ({ aboutImage }) => {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.8,
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6 }
        }
    };

    return (
        <section id="about" className="py-20 bg-gradient-to-b from-white to-gray-50">
            <motion.div 
                className="container mx-auto px-4 md:px-6"
                ref={ref}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                variants={containerVariants}
            >
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Image Column */}
                    <motion.div
                        variants={itemVariants}
                        className="relative group"
                    >
                        <motion.div
                            className="absolute -inset-4 bg-gradient-to-r from-primary to-secondary rounded-2xl opacity-20 group-hover:opacity-30 blur-xl transition-all duration-500"
                            animate={{ scale: [1, 1.02, 1] }}
                            transition={{ duration: 4, repeat: Infinity }}
                        />
                        <motion.img 
                            src={aboutImage} 
                            alt="Ratan Agri Tech - Leading Agricultural Equipment Provider in Sikar" 
                            className="rounded-xl shadow-2xl w-full h-auto object-cover relative z-10 transform group-hover:scale-[1.02] transition-transform duration-500"
                            whileHover={{ scale: 1.02 }}
                        />
                    </motion.div>

                    {/* Content Column */}
                    <motion.div 
                        className="text-gray-700"
                        variants={itemVariants}
                    >
                        <motion.h2 
                            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
                            variants={itemVariants}
                        >
                            Empowering <span className="text-primary">Agriculture</span> Through Innovation
                        </motion.h2>
                        
                        <motion.p 
                            className="text-lg text-gray-600 mb-8 leading-relaxed"
                            variants={itemVariants}
                        >
                            Since our establishment, Ratan Agri Tech has been at the forefront of agricultural innovation in Sikar, Rajasthan. We specialize in providing cutting-edge farming equipment that transforms traditional agriculture into a more efficient and sustainable practice.
                        </motion.p>

                        <motion.div 
                            className="space-y-6"
                            variants={containerVariants}
                        >
                            <motion.div 
                                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                                variants={itemVariants}
                            >
                                <h3 className="font-bold text-xl text-primary mb-3">Our Mission</h3>
                                <p className="text-gray-600">
                                    To revolutionize farming practices by providing innovative, sustainable, and efficient agricultural solutions that enhance productivity and improve farmers' lives.
                                </p>
                            </motion.div>

                            <motion.div 
                                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                                variants={itemVariants}
                            >
                                <h3 className="font-bold text-xl text-primary mb-3">Our Vision</h3>
                                <p className="text-gray-600">
                                    To become the most trusted partner in agricultural advancement, leading the transformation towards modern and sustainable farming practices across India.
                                </p>
                            </motion.div>
                        </motion.div>

                        <motion.div 
                            className="grid grid-cols-2 gap-4 mt-8"
                            variants={containerVariants}
                        >
                            <motion.div 
                                className="text-center p-4 bg-white rounded-lg shadow-sm"
                                variants={itemVariants}
                            >
                                <h4 className="text-2xl font-bold text-primary mb-1">500+</h4>
                                <p className="text-sm text-gray-600">Satisfied Farmers</p>
                            </motion.div>
                            <motion.div 
                                className="text-center p-4 bg-white rounded-lg shadow-sm"
                                variants={itemVariants}
                            >
                                <h4 className="text-2xl font-bold text-primary mb-1">5★</h4>
                                <p className="text-sm text-gray-600">Customer Rating</p>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Additional SEO Content */}
                <motion.div 
                    className="mt-16 text-center max-w-4xl mx-auto"
                    variants={containerVariants}
                >
                    <motion.h3 
                        className="text-2xl font-semibold text-gray-800 mb-6"
                        variants={itemVariants}
                    >
                        Why Choose Ratan Agri Tech?
                    </motion.h3>
                    <motion.div 
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                        variants={containerVariants}
                    >
                        <motion.div 
                            className="p-6 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow duration-300"
                            variants={itemVariants}
                        >
                            <h4 className="font-bold text-primary mb-2">Expert Guidance</h4>
                            <p className="text-gray-600">Personalized consultation and support from agricultural experts</p>
                        </motion.div>
                        <motion.div 
                            className="p-6 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow duration-300"
                            variants={itemVariants}
                        >
                            <h4 className="font-bold text-primary mb-2">Quality Assurance</h4>
                            <p className="text-gray-600">All equipment tested and certified for optimal performance</p>
                        </motion.div>
                        <motion.div 
                            className="p-6 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow duration-300"
                            variants={itemVariants}
                        >
                            <h4 className="font-bold text-primary mb-2">After-Sales Support</h4>
                            <p className="text-gray-600">Dedicated maintenance and service support available 24/7</p>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </motion.div>
        </section>
    );
};

export default About;