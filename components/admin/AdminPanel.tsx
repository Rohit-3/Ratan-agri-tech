import React, { useState } from 'react';
import { AdminPanelProps } from '../../types';
import ProductForm from './ProductForm';
// FIX: Changed to a named import to match the export from ImageManager.tsx
import { ImageManager } from './ImageManager';
import QRCodeManager from './QRCodeManager';
import PaymentsTable from './PaymentsTable';

const AdminPanel: React.FC<AdminPanelProps> = ({ 
    products, 
    siteImages, 
    onAddProduct, 
    onUpdateSiteImages,
    onDeleteProduct,
    onSelectProductToEdit
}) => {
    const [activeTab, setActiveTab] = useState<'products' | 'images' | 'qr-codes' | 'payments'>('products');

    return (
        <div className="bg-gray-100 min-h-screen">
            <header className="bg-gray-800 text-white p-6 shadow-md">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Admin Panel</h1>
                    <a href="#/" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300">
                        View Live Site
                    </a>
                </div>
            </header>

            <main className="container mx-auto p-6 md:p-8">
                {/* Navigation Tabs */}
                <div className="bg-white rounded-lg shadow-md mb-6">
                    <div className="flex border-b">
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`px-6 py-4 font-semibold text-sm ${
                                activeTab === 'products'
                                    ? 'text-primary border-b-2 border-primary bg-gray-50'
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            📦 Products
                        </button>
                        <button
                            onClick={() => setActiveTab('images')}
                            className={`px-6 py-4 font-semibold text-sm ${
                                activeTab === 'images'
                                    ? 'text-primary border-b-2 border-primary bg-gray-50'
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            🖼️ Images
                        </button>
                        <button
                            onClick={() => setActiveTab('qr-codes')}
                            className={`px-6 py-4 font-semibold text-sm ${
                                activeTab === 'qr-codes'
                                    ? 'text-primary border-b-2 border-primary bg-gray-50'
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            📱 QR Codes
                        </button>
                        <button
                            onClick={() => setActiveTab('payments')}
                            className={`px-6 py-4 font-semibold text-sm ${
                                activeTab === 'payments'
                                    ? 'text-primary border-b-2 border-primary bg-gray-50'
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            💵 Payments
                        </button>
                        {/* Upload QR button always visible */}
                        <div className="ml-auto pr-4 py-3">
                            <button
                                onClick={() => {
                                    setActiveTab('qr-codes');
                                    // notify QR manager to open form
                                    window.dispatchEvent(new Event('open-qr-upload'));
                                }}
                                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary text-sm font-semibold"
                            >
                                + Upload QR
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'products' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Forms */}
                        <div className="lg:col-span-2 space-y-8">
                            <ProductForm onAddProduct={onAddProduct} />
                        </div>

                        {/* Right Column: Product List */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Manage Products</h2>
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                                {products.length > 0 ? products.map(product => (
                                    <div key={product.id} className="flex items-center space-x-4 p-3 border rounded-md hover:shadow-md transition-shadow">
                                        <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
                                        <div className="flex-grow">
                                            <h4 className="font-semibold text-gray-900">{product.name}</h4>
                                            <p className="text-sm text-gray-500">{product.category}</p>
                                        </div>
                                        <div className="flex-shrink-0 flex items-center space-x-2">
                                            <button onClick={() => onSelectProductToEdit(product)} className="text-sm bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded transition-colors duration-200">Edit</button>
                                            <button onClick={() => onDeleteProduct(product.id)} className="text-sm bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded transition-colors duration-200">Delete</button>
                                        </div>
                                    </div>
                                )) : <p className="text-gray-500">No products yet. Add one using the form.</p>}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'images' && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <ImageManager currentImages={siteImages} onUpdate={onUpdateSiteImages} />
                    </div>
                )}

                {activeTab === 'qr-codes' && (
                    <div className="bg-white rounded-lg shadow-md">
                        <QRCodeManager />
                    </div>
                )}

                {activeTab === 'payments' && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Recent Payments</h2>
                        <PaymentsTable />
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminPanel;