import React from 'react';
import ProductCard from './ProductCard';
import { motion } from 'framer-motion';
import { ChevronDownIcon, GlobeAltIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { Product } from '../types';

interface HeroProps {
		heroImage: string;
		products: Product[];
		onBuyNow: (product: Product) => void;
}

const Hero: React.FC<HeroProps> = ({ heroImage, products, onBuyNow }) => {
		const scrollToProducts = () => {
				document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
		};

		return (
			<>
				<section id="hero" className="relative min-h-[80vh] bg-cover bg-center text-white overflow-hidden flex items-center justify-center" style={{ backgroundImage: `url('${heroImage}')` }}>
					<div className="absolute inset-0 bg-gradient-to-br from-black/70 via-gray-900/60 to-primary/40 animate-fadeIn"></div>
					<div className="absolute inset-0 bg-gradient-to-t from-white/10 via-transparent to-transparent"></div>
					<motion.div 
						initial={{ opacity: 0, y: 40 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 1 }}
						className="relative z-10 flex flex-col items-center justify-center py-24 text-center px-2 w-full"
					>
						<motion.div 
							initial={{ scale: 0.95, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ duration: 0.8, delay: 0.2 }}
							className="mx-auto w-full max-w-3xl"
						>
							<h1
								className="font-bold mb-4 text-center text-white drop-shadow-lg tracking-tight leading-snug gradient-text"
								style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', letterSpacing: '-0.01em' }}
							>
								<span className="block">
									Transform Your <span className="text-primary">Agriculture</span>
								</span>
								<span className="block">
									with <span className="text-accent">Modern Technology</span>
								</span>
							</h1>
						</motion.div>
						<motion.p 
							className="text-xl md:text-2xl max-w-4xl mb-10 text-gray-200 font-medium mx-auto mt-8 animate-slideUp"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.5 }}
						>
							Transform your farming operations with India's most trusted agricultural machinery. From power tillers to smart brush cutters, we deliver cutting-edge equipment that maximizes productivity and minimizes effort.<br />
							<span className="text-primary font-bold">Serving 500+ farmers across Rajasthan with 5-star rated equipment and 24/7 support.</span><br />
							Join the agricultural revolution—where tradition meets innovation.
						</motion.p>
						<motion.div
							className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-2"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.8 }}
						>
							<a
								href="#/products"
								className="bg-primary hover:bg-secondary text-white font-bold py-4 px-8 rounded-full transition-all duration-300 ease-in-out transform hover:scale-110 hover:shadow-2xl flex items-center gap-2 text-lg shadow-lg"
							>
								Explore Our Products
								<ChevronDownIcon className="w-5 h-5 animate-bounce" />
							</a>
							<a 
								href="#contact" 
								className="border-2 border-white hover:border-accent text-white font-bold py-4 px-8 rounded-full transition-all duration-300 ease-in-out transform hover:scale-110 hover:shadow-2xl hover:bg-accent hover:text-black text-lg shadow-lg"
							>
								Contact Us
							</a>
						</motion.div>
						<motion.div 
							className="absolute bottom-8 left-0 right-0 flex justify-center"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 1 }}
						>
							<div className="flex flex-row gap-4 text-sm text-gray-300">
								<span>📍 Sikar, Rajasthan</span>
								<span>|</span>
								<span>🌾 Serving Farmers Since 2020</span>
							</div>
						</motion.div>
					</motion.div>
				</section>
						{/* Homepage Products Section */}
						<section className="py-10 bg-transparent">
							<div className="mx-auto max-w-5xl px-4">
								<h2 className="text-2xl font-bold text-center mb-6 text-primary">Featured Products</h2>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-center">
									{products.slice(0,2).map(product => (
										<ProductCard key={product.id} product={product} onBuyNow={onBuyNow} />
									))}
								</div>
							</div>
						</section>
						{/* Features Section */}
				<section className="bg-white py-16">
					<div className="container mx-auto px-4 md:px-8">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
							<div className="flex flex-col items-center">
								<GlobeAltIcon className="w-12 h-12 text-primary mb-4" />
								<h3 className="text-xl font-semibold mb-2">Premium Build Quality</h3>
								<p className="text-gray-600">Engineered for durability and reliability, our products set the standard for modern agriculture.</p>
							</div>
							<div className="flex flex-col items-center">
								<PhoneIcon className="w-12 h-12 text-primary mb-4" />
								<h3 className="text-xl font-semibold mb-2">Smart Technology</h3>
								<p className="text-gray-600">Integrating advanced features for efficiency, safety, and ease of use—empowering every farmer.</p>
							</div>
							<div className="flex flex-col items-center">
								<EnvelopeIcon className="w-12 h-12 text-primary mb-4" />
								<h3 className="text-xl font-semibold mb-2">Expert Support</h3>
								<p className="text-gray-600">Our team is dedicated to your success, offering guidance, training, and after-sales service.</p>
							</div>
						</div>
					</div>
				</section>

				{/* Statistics Section */}
				<section className="py-16 bg-white text-gray-900">
					<div className="container mx-auto px-4 md:px-8">
						<motion.div 
							className="text-center mb-12"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							viewport={{ once: true }}
						>
							<h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Trusted by Farmers Across Rajasthan</h2>
							<p className="text-xl font-semibold text-gray-700">Numbers that speak for our commitment to excellence</p>
						</motion.div>
						
						<div className="grid grid-cols-2 md:grid-cols-4 gap-8">
							<motion.div 
								className="text-center"
								initial={{ opacity: 0, scale: 0.8 }}
								whileInView={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.6, delay: 0.1 }}
								viewport={{ once: true }}
							>
								<div className="text-4xl md:text-5xl font-bold mb-2 text-gray-900">500+</div>
								<div className="text-gray-700 font-semibold">Happy Farmers</div>
							</motion.div>
							<motion.div 
								className="text-center"
								initial={{ opacity: 0, scale: 0.8 }}
								whileInView={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.6, delay: 0.2 }}
								viewport={{ once: true }}
							>
								<div className="text-4xl md:text-5xl font-bold mb-2 text-gray-900">1000+</div>
								<div className="text-gray-700 font-semibold">Machines Sold</div>
							</motion.div>
							<motion.div 
								className="text-center"
								initial={{ opacity: 0, scale: 0.8 }}
								whileInView={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.6, delay: 0.3 }}
								viewport={{ once: true }}
							>
								<div className="text-4xl md:text-5xl font-bold mb-2 text-gray-900">5★</div>
								<div className="text-gray-700 font-semibold">Customer Rating</div>
							</motion.div>
							<motion.div 
								className="text-center"
								initial={{ opacity: 0, scale: 0.8 }}
								whileInView={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.6, delay: 0.4 }}
								viewport={{ once: true }}
							>
								<div className="text-4xl md:text-5xl font-bold mb-2 text-gray-900">24/7</div>
								<div className="text-gray-700 font-semibold">Support</div>
							</motion.div>
						</div>
					</div>
				</section>

				{/* Services Section */}
				<section className="py-16 bg-gray-50">
					<div className="container mx-auto px-4 md:px-8">
						<motion.div 
							className="text-center mb-12"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							viewport={{ once: true }}
						>
							<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Complete Agricultural Solutions</h2>
							<p className="text-xl text-gray-600 max-w-3xl mx-auto">From equipment sales to maintenance, we provide end-to-end support for all your farming needs</p>
						</motion.div>
						
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							<motion.div 
								className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.1 }}
								viewport={{ once: true }}
							>
								<div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6">
									<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
								</div>
								<h3 className="text-xl font-bold text-gray-900 mb-4">Equipment Sales</h3>
								<p className="text-gray-600 mb-4">Premium agricultural machinery including power tillers, brush cutters, earth augers, and chainsaws from leading brands.</p>
								<ul className="text-sm text-gray-500 space-y-1">
									<li>• Power Tillers (7HP - 9HP)</li>
									<li>• Brush Cutters (Honda, Mitsubishi)</li>
									<li>• Earth Augers & Chainsaws</li>
									<li>• Genuine spare parts</li>
								</ul>
							</motion.div>

							<motion.div 
								className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.2 }}
								viewport={{ once: true }}
							>
								<div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6">
									<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
									</svg>
								</div>
								<h3 className="text-xl font-bold text-gray-900 mb-4">Maintenance & Repair</h3>
								<p className="text-gray-600 mb-4">Professional maintenance services to keep your equipment running at peak performance throughout the farming season.</p>
								<ul className="text-sm text-gray-500 space-y-1">
									<li>• Regular servicing</li>
									<li>• Emergency repairs</li>
									<li>• Parts replacement</li>
									<li>• Performance optimization</li>
								</ul>
							</motion.div>

							<motion.div 
								className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.3 }}
								viewport={{ once: true }}
							>
								<div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6">
									<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
									</svg>
								</div>
								<h3 className="text-xl font-bold text-gray-900 mb-4">Expert Consultation</h3>
								<p className="text-gray-600 mb-4">Get personalized advice from our agricultural experts to choose the right equipment for your specific farming needs.</p>
								<ul className="text-sm text-gray-500 space-y-1">
									<li>• Equipment selection</li>
									<li>• Usage training</li>
									<li>• Farm planning</li>
									<li>• Efficiency optimization</li>
								</ul>
							</motion.div>
						</div>
					</div>
				</section>

				{/* Testimonials Section */}
				<section className="py-16 bg-white">
					<div className="container mx-auto px-4 md:px-8">
						<motion.div 
							className="text-center mb-12"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							viewport={{ once: true }}
						>
							<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Farmers Say</h2>
							<p className="text-xl text-gray-600">Real stories from real farmers who trust Ratan Agri Tech</p>
						</motion.div>
						
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							<motion.div 
								className="bg-gray-50 p-8 rounded-lg"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.1 }}
								viewport={{ once: true }}
							>
								<div className="flex items-center mb-4">
									<div className="flex text-yellow-400">
										{'★'.repeat(5)}
									</div>
								</div>
								<p className="text-gray-700 mb-6 italic">"The power tiller from Ratan Agri Tech has transformed my farming. It's reliable, powerful, and their service is exceptional. My productivity has increased by 40%!"</p>
								<div className="flex items-center">
									<div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold mr-4">
										RS
									</div>
									<div>
										<div className="font-semibold text-gray-900">Rajesh Sharma</div>
										<div className="text-sm text-gray-600">Farmer, Sikar</div>
									</div>
								</div>
							</motion.div>

							<motion.div 
								className="bg-gray-50 p-8 rounded-lg"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.2 }}
								viewport={{ once: true }}
							>
								<div className="flex items-center mb-4">
									<div className="flex text-yellow-400">
										{'★'.repeat(5)}
									</div>
								</div>
								<p className="text-gray-700 mb-6 italic">"Excellent brush cutter! The Honda engine is so smooth and efficient. The team provided great training and ongoing support. Highly recommended!"</p>
								<div className="flex items-center">
									<div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold mr-4">
										PK
									</div>
									<div>
										<div className="font-semibold text-gray-900">Priya Kumari</div>
										<div className="text-sm text-gray-600">Farm Owner, Jhunjhunu</div>
									</div>
								</div>
							</motion.div>

							<motion.div 
								className="bg-gray-50 p-8 rounded-lg"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.3 }}
								viewport={{ once: true }}
							>
								<div className="flex items-center mb-4">
									<div className="flex text-yellow-400">
										{'★'.repeat(5)}
									</div>
								</div>
								<p className="text-gray-700 mb-6 italic">"Best agricultural equipment dealer in Rajasthan! Quality products, fair prices, and 24/7 support. They truly care about farmers' success."</p>
								<div className="flex items-center">
									<div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold mr-4">
										MS
									</div>
									<div>
										<div className="font-semibold text-gray-900">Mohan Singh</div>
										<div className="text-sm text-gray-600">Agricultural Contractor</div>
									</div>
								</div>
							</motion.div>
						</div>
					</div>
				</section>

				{/* Call to Action Section */}
				<section className="py-20 bg-gradient-to-br from-gray-50 via-white to-primary/5 relative overflow-hidden">
					{/* Background Pattern */}
					<div className="absolute inset-0 opacity-5">
						<div className="absolute top-10 left-10 w-20 h-20 bg-primary rounded-full"></div>
						<div className="absolute top-32 right-20 w-16 h-16 bg-secondary rounded-full"></div>
						<div className="absolute bottom-20 left-1/4 w-12 h-12 bg-primary rounded-full"></div>
						<div className="absolute bottom-32 right-1/3 w-8 h-8 bg-secondary rounded-full"></div>
					</div>
					
					<div className="container mx-auto px-4 md:px-8 text-center relative z-10">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							viewport={{ once: true }}
						>
							{/* Icon */}
							<motion.div 
								className="mb-6"
								initial={{ scale: 0 }}
								whileInView={{ scale: 1 }}
								transition={{ duration: 0.5, delay: 0.2 }}
								viewport={{ once: true }}
							>
								<div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto shadow-lg">
									<svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
									</svg>
								</div>
							</motion.div>
							
                            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 leading-tight">
								Ready to Transform Your <span className="text-primary">Farming</span>?
							</h2>
                            <p className="text-lg md:text-xl font-medium text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
								Join hundreds of successful farmers who have already upgraded their operations with Ratan Agri Tech. 
								Get expert consultation and find the perfect equipment for your farm today.
							</p>
							
							{/* Enhanced Buttons */}
							<div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
								<motion.a
									href="#/products"
									className="group bg-gray-900 text-white font-bold py-5 px-10 rounded-full hover:bg-gray-800 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl text-lg shadow-lg flex items-center gap-3"
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
								>
									<svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
									</svg>
									Browse Products
								</motion.a>
								<motion.a
									href="mailto:ratanagritech@gmail.com?subject=Free%20Consultation%20Request&body=Hello%2C%20I%20am%20interested%20in%20getting%20a%20free%20consultation%20for%20agricultural%20equipment.%20Please%20contact%20me%20at%20your%20earliest%20convenience."
									className="group border-3 border-primary text-primary font-bold py-5 px-10 rounded-full hover:bg-primary hover:text-white transition-all duration-300 ease-in-out transform hover:scale-105 text-lg shadow-lg flex items-center gap-3"
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
								>
									<svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
									</svg>
									Get Free Consultation
								</motion.a>
							</div>
							
							{/* Enhanced Contact Info */}
							<div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-2xl mx-auto">
								<div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
									<div className="flex flex-col items-center">
										<div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-3">
											<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
											</svg>
										</div>
										<p className="text-lg font-bold text-gray-900">+91 7726017648</p>
										<p className="text-sm text-gray-600">Call Now</p>
									</div>
									<div className="flex flex-col items-center">
										<div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-3">
											<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
											</svg>
										</div>
										<p className="text-lg font-bold text-gray-900">Jagmalpura</p>
										<p className="text-sm text-gray-600">Sikar, Rajasthan</p>
									</div>
									<div className="flex flex-col items-center">
										<div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-3">
											<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
										</div>
										<p className="text-lg font-bold text-gray-900">Mon-Sat</p>
										<p className="text-sm text-gray-600">9AM-7PM</p>
									</div>
								</div>
							</div>
						</motion.div>
					</div>
				</section>
			</>
		);
}

export default Hero;
