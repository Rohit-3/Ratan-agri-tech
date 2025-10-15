import React, { useState } from 'react';
import { AdminPanelProps } from '../../types';
import ProductForm from './ProductForm';
// FIX: Changed to a named import to match the export from ImageManager.tsx
import { ImageManager } from './ImageManager';
import QRCodeManager from './QRCodeManager';
import PaymentsTable from './PaymentsTable';
import heroImage from '../../image/hero.png';
import logoImage from '../../image/logo.jpg';

const AdminPanel: React.FC<AdminPanelProps> = ({ 
    products, 
    siteImages, 
    onAddProduct, 
    onUpdateSiteImages,
    onDeleteProduct,
    onSelectProductToEdit
}) => {
    const [activeTab, setActiveTab] = useState<'products' | 'images' | 'qr-codes' | 'payments'>('products');
    const [toast, setToast] = useState<string>('');
    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const handleExport = () => {
        const data = { products, siteImages };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `backup-${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a); a.click(); a.remove();
        URL.revokeObjectURL(url);
        showToast('Backup exported');
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const text = await file.text();
            const json = JSON.parse(text);
            const apiUrl = (import.meta as any).env.VITE_API_URL || window.location.origin;
            // Restore siteImages
            if (json.siteImages) {
                await fetch(`${apiUrl}/api/site-images`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
                    logo: json.siteImages.logo,
                    hero: json.siteImages.hero,
                    about: json.siteImages.about,
                    qr_code: json.siteImages.qrCode
                })});
                onUpdateSiteImages(json.siteImages);
                try { localStorage.setItem('siteImages', JSON.stringify(json.siteImages)); } catch {}
            }
            // Restore products
            if (Array.isArray(json.products)) {
                for (const p of json.products) {
                    try {
                        const resp = await fetch(`${apiUrl}/api/products`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
                            name: p.name,
                            description: p.description,
                            price: typeof p.price === 'number' ? p.price : 0,
                            image_url: p.image,
                            category: p.category,
                        })});
                        const rj = await resp.json();
                        if (!rj?.success) throw new Error('create failed');
                        onAddProduct({ name: p.name, category: p.category, image: p.image, description: p.description, specifications: p.specifications || {}, price: p.price });
                    } catch {
                        onAddProduct({ name: p.name, category: p.category, image: p.image, description: p.description, specifications: p.specifications || {}, price: p.price });
                    }
                }
            }
            showToast('Backup imported');
        } catch {
            showToast('Import failed');
        } finally {
            (e.target as HTMLInputElement).value = '';
        }
    };

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
                {toast && (
                    <div className="mb-4 p-3 rounded bg-green-50 text-green-800 border border-green-200">{toast}</div>
                )}
                {/* Static Hero and Logo Preview */}
                <div className="bg-white rounded-lg shadow-md mb-6 p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Site Images Preview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Logo Preview */}
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-700 mb-3">Logo</h3>
                            <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                                <img 
                                    src={logoImage} 
                                    alt="Site Logo" 
                                    className="h-16 w-16 mx-auto object-contain rounded-full"
                                />
                            </div>
                        </div>
                        
                        {/* Hero Image Preview */}
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-700 mb-3">Hero Image</h3>
                            <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                                <img 
                                    src={heroImage} 
                                    alt="Hero Image" 
                                    className="h-24 w-full object-cover rounded-lg"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Backup & Restore */}
                <div className="bg-white rounded-lg shadow-md mb-6 p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Backup & Restore</h3>
                    <div className="flex items-center gap-4">
                        <button onClick={handleExport} className="px-4 py-2 border border-black rounded hover:bg-gray-50 font-extrabold">Export JSON</button>
                        <label className="px-4 py-2 border border-black rounded cursor-pointer font-extrabold">
                            Import JSON
                            <input type="file" accept="application/json" onChange={handleImport} className="hidden" />
                        </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Exports both products and site images. Importing will merge into current data.</p>
                </div>

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
                                className="bg-white text-black border border-black px-4 py-2 rounded-md hover:bg-gray-100 text-sm font-extrabold"
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