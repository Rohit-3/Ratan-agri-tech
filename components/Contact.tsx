import React from 'react';
import { contactDetails } from '../constants';
import { SiteImages } from '../types';

interface ContactProps {
    siteImages: SiteImages;
}

const Contact: React.FC<ContactProps> = ({ siteImages }) => {
    // A generic location for Sikar, Rajasthan for the map iframe
    const mapSrc = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d112293.9798244245!2d75.07685642674338!3d27.60749845347265!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396ca4b8c3228d7d%3A0x828c68449774574d!2sSikar%2C%20Rajasthan!5e0!3m2!1sen!2sin!4v1691500000000";

    return (
        <section id="contact" className="py-16 bg-gray-50">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Get in Touch</h2>
                    <p className="text-lg text-gray-600 mt-2">We'd love to hear from you. Contact us for quotes, support, or any inquiries.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Contact Information */}
                    <div className="bg-white p-8 rounded-lg shadow-lg">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">Contact Details</h3>
                        <div className="space-y-6 text-gray-700">
                            <div className="flex items-start">
                                <i className="fas fa-map-marker-alt text-2xl text-green-600 mr-4 mt-1"></i>
                                <div>
                                    <h4 className="font-semibold">Our Location</h4>
                                    <p>{contactDetails.address}</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <i className="fas fa-phone-alt text-2xl text-green-600 mr-4 mt-1"></i>
                                <div>
                                    <h4 className="font-semibold">Phone Number</h4>
                                    <a href={`tel:${contactDetails.mobile}`} className="hover:text-green-600 transition-colors">+91 {contactDetails.mobile}</a>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <i className="fas fa-envelope text-2xl text-green-600 mr-4 mt-1"></i>
                                <div>
                                    <h4 className="font-semibold">Email Address</h4>
                                    <a href={`mailto:${contactDetails.email}`} className="hover:text-green-600 transition-colors">{contactDetails.email}</a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Map */}
                    <div className="rounded-lg shadow-lg overflow-hidden">
                        <iframe
                            src={mapSrc}
                            width="100%"
                            height="100%"
                            style={{ border: 0, minHeight: '350px' }}
                            allowFullScreen={false}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Ratan Agri Tech Location"
                        ></iframe>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
