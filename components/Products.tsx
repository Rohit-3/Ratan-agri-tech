import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ProductsProps, ProductCategory } from '../types';
import ProductCard from './ProductCard';
import { categories } from '../constants';

const Products: React.FC<ProductsProps> = ({ products, onBuyNow }) => {
    const [selectedCategory, setSelectedCategory] = useState<ProductCategory>(ProductCategory.All);
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1
    });

    // Only show up to 4 products, regardless of category
    const filteredProducts = (selectedCategory === ProductCategory.All
        ? products
        : products.filter(p => p.category === selectedCategory)
    ).slice(0, 4);

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    return (
        <section id="products" className="py-16 bg-gradient-to-b from-gray-50 to-white">
            <div className="container mx-auto px-4 md:px-6">
                {/* Product Benefits Section */}
                <motion.div 
                    ref={ref}
                    initial="hidden"
                    animate={inView ? "visible" : "hidden"}
                    variants={containerVariants}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4 animate-fadeIn">
                        Empowering Farmers with Advanced Technology
                    </h2>
                    <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto mb-6 animate-slideUp">
                        Our products are designed to revolutionize agriculture for everyone—from small family farms to large commercial operations. By integrating nano processing, AI-driven analytics, and smart IoT features, we help farmers boost productivity, reduce manual labor, and achieve better yields with less effort.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                        <div className="bg-white rounded-xl shadow-lg p-6 hover-grow">
                            <h3 className="text-xl font-bold text-primary mb-2">Nano Processing</h3>
                            <p className="text-gray-600">Precision soil and crop management for healthier harvests and sustainable farming.</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-6 hover-grow">
                            <h3 className="text-xl font-bold text-primary mb-2">AI & Smart Analytics</h3>
                            <p className="text-gray-600">Real-time insights and recommendations to maximize efficiency and minimize waste.</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-6 hover-grow">
                            <h3 className="text-xl font-bold text-primary mb-2">IoT Integration</h3>
                            <p className="text-gray-600">Remote monitoring and control for smarter, safer, and more connected farming.</p>
                        </div>
                    </div>
                </motion.div>

                {/* Category Filters */}
                <motion.div 
                    className="flex flex-wrap justify-center gap-3 md:gap-4 mb-12"
                    variants={containerVariants}
                >
                    {categories.map(category => (
                        <motion.button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-6 py-3 rounded-full font-semibold text-sm md:text-base transition-all duration-300 transform hover:scale-105 ${
                                selectedCategory === category
                                    ? 'bg-primary text-white shadow-lg hover:bg-secondary'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-primary'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {category}
                        </motion.button>
                    ))}
                </motion.div>

                {/* Products Grid */}
                <motion.div 
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-8 auto-rows-fr"
                    variants={containerVariants}
                >
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product, index) => (
                            <motion.div
                                key={product.id}
                                className="h-full"
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        transition: {
                                            delay: index * 0.08
                                        }
                                    }
                                }}
                            >
                                <div className="h-full flex">
                                  <ProductCard product={product} onBuyNow={onBuyNow} />
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <motion.p 
                            className="text-center text-gray-500 col-span-full text-lg"
                            variants={containerVariants}
                        >
                            No products available in this category at the moment.
                        </motion.p>
                    )}
                </motion.div>
                
                {/* SEO Enhancement Section */}
                <motion.div 
                    className="mt-16 text-center max-w-4xl mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                        Why Choose Our Agricultural Equipment?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        <div className="p-4 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
                            <h4 className="font-bold text-primary mb-2">Superior Quality</h4>
                            <p className="text-gray-600">Built to last with premium materials and expert craftsmanship</p>
                        </div>
                        <div className="p-4 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
                            <h4 className="font-bold text-primary mb-2">Modern Technology</h4>
                            <p className="text-gray-600">Incorporating latest agricultural innovations for better results</p>
                        </div>
                        <div className="p-4 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
                            <h4 className="font-bold text-primary mb-2">Expert Support</h4>
                            <p className="text-gray-600">Dedicated technical support and maintenance services</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Products;
