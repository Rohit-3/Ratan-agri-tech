import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Products from './components/Products';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import AdminPanel from './components/admin/AdminPanel';
import EditProductModal from './components/admin/EditProductModal';
import PaymentModal from './components/PaymentModal';
import { initialProducts, initialSiteImages } from './constants';
import { Product, SiteImages } from './types';

// Helper function to get initial state from localStorage
const getInitialState = <T,>(key: string, defaultValue: T): T => {
    try {
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage for key "${key}":`, error);
        return defaultValue;
    }
};

const App: React.FC = () => {
    const [products, setProducts] = useState<Product[]>(() => getInitialState('products', initialProducts));
    const [siteImages, setSiteImages] = useState<SiteImages>(() => getInitialState('siteImages', initialSiteImages));
    const [currentView, setCurrentView] = useState(window.location.hash || '#/');
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);
    const [productToBuy, setProductToBuy] = useState<Product | null>(null);

    useEffect(() => {
        localStorage.setItem('products', JSON.stringify(products));
    }, [products]);

    // Persist site images to localStorage so they survive backend resets/sleep
    useEffect(() => {
        try {
            localStorage.setItem('siteImages', JSON.stringify(siteImages));
        } catch {}
    }, [siteImages]);

    // Load products and site images on mount with local fallback
    useEffect(() => {
        // Try to load products from backend, merge with local
        (async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
                const res = await fetch(`${apiUrl}/api/products`);
                const json = await res.json();
                if (json?.success && Array.isArray(json.data)) {
                    // Normalize to Product[] used by UI
                    const toAbsolute = (img: string | undefined) => {
                        if (!img) return img;
                        if (img.startsWith('http') || img.startsWith('data:')) return img;
                        const path = img.startsWith('/') ? img : `/${img}`;
                        return `${apiUrl}${path}`;
                    };
                    const backendProducts = json.data.map((p: any) => ({
                        id: p.id ?? Date.now() + Math.random(),
                        name: p.name,
                        category: p.category,
                        image: toAbsolute(p.image_url),
                        description: p.description,
                        specifications: {},
                        price: typeof p.price === 'number' ? p.price : undefined,
                    }));
                    // Prefer backend list if not empty
                    if (backendProducts.length) {
                        setProducts(backendProducts);
                        localStorage.setItem('products', JSON.stringify(backendProducts));
                    }
                }
            } catch {}
        })();

        // Migration: clear stale siteImages pointing to localhost or /uploads so bundled images take effect
        try {
            const stored = localStorage.getItem('siteImages');
            if (stored) {
                const parsed = JSON.parse(stored);
                const invalid = (v: unknown) => typeof v === 'string' && (v.includes('localhost') || v.includes('/uploads/'));
                if (parsed && (invalid(parsed.logo) || invalid(parsed.hero) || invalid(parsed.about) || invalid(parsed.qrCode))) {
                    localStorage.removeItem('siteImages');
                }
            }
        } catch {}

        // Migration: replace any non-matching catalog with the new curated 6-product catalog
        try {
            const storedProducts = localStorage.getItem('products');
            if (storedProducts) {
                const parsed = JSON.parse(storedProducts);
                // Sanitize any localhost or /uploads images to current origin
                const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
                const needsFix = (img: unknown) => typeof img === 'string' && (img.includes('localhost') || img.startsWith('/uploads'));
                const fixed = Array.isArray(parsed) ? parsed.map((p: any) => {
                    if (needsFix(p?.image)) {
                        const path = (p.image as string).startsWith('/') ? p.image : `/${p.image}`;
                        return { ...p, image: `${apiUrl}${path}` };
                    }
                    return p;
                }) : parsed;
                if (fixed !== parsed) {
                    localStorage.setItem('products', JSON.stringify(fixed));
                }
                const targetNames = new Set(initialProducts.map(p => p.name));
                const invalidList = !Array.isArray(parsed) || parsed.length !== initialProducts.length || parsed.some((p: any) => !p?.name || !targetNames.has(p.name));
                if (invalidList) {
                    localStorage.setItem('products', JSON.stringify(initialProducts));
                    setProducts(initialProducts);
                }
            }
        } catch {}

        const fetchSiteImages = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
                const res = await fetch(`${apiUrl}/api/site-images`);
                const json = await res.json();
                if (json?.success && json?.data) {
                    const { logo, hero, about, qr_code } = json.data;
                    const toAbsolute = (value: string | undefined) => {
                        if (!value) return undefined;
                        if (value.startsWith('http') || value.startsWith('data:')) return value;
                        // ensure leading slash
                        const path = value.startsWith('/') ? value : `/${value}`;
                        return `${apiUrl}${path}`;
                    };
                    const merged: SiteImages = {
                        logo: toAbsolute(logo) || siteImages.logo,
                        hero: toAbsolute(hero) || siteImages.hero,
                        about: about || siteImages.about,
                        qrCode: toAbsolute(qr_code) || siteImages.qrCode,
                    };
                    setSiteImages(merged);
                }
            } catch {}
        };
        fetchSiteImages();
    }, []);

    useEffect(() => {
        const handleHashChange = () => {
            setCurrentView(window.location.hash || '#/');
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const addProduct = (newProduct: Omit<Product, 'id'>) => {
        setProducts(prevProducts => [
            { ...newProduct, id: Date.now() }, // Use timestamp for unique ID
            ...prevProducts,
        ]);
    };

    const deleteProduct = (productId: number) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
        }
    };
    
    const updateProduct = (updatedProduct: Product) => {
        setProducts(prevProducts =>
            prevProducts.map(p => (p.id === updatedProduct.id ? updatedProduct : p))
        );
        setProductToEdit(null); // Close modal on update
    };

    const handleSelectProductToEdit = (product: Product) => {
        setProductToEdit(product);
    };

    const handleCloseEditModal = () => {
        setProductToEdit(null);
    };
    
    const handleBuyNow = (product: Product) => {
        setProductToBuy(product);
    };

    const handleClosePaymentModal = () => {
        setProductToBuy(null);
    };

    const updateSiteImages = (newImages: SiteImages) => {
        setSiteImages(newImages);
    }

    const renderMainContent = () => {
        // Use a less specific check for the home page
        if (currentView === '#/' || currentView === '#home' || currentView === '') {
            return (
                <>
                    <Hero heroImage={siteImages.hero} products={products} onBuyNow={handleBuyNow} />
                </>
            );
        }
        
        switch (currentView) {
            case '#/products':
                return <Products products={products} onBuyNow={handleBuyNow} />;
            case '#/about':
                return <About aboutImage={siteImages.about} />;
            case '#/contact':
                return <Contact siteImages={siteImages} />;
            default:
                // Redirect to home for unknown hashes
                window.location.hash = '#/';
                return null;
        }
    };

    // Admin password protection
    const [adminAuthenticated, setAdminAuthenticated] = useState(false);
    const [adminPassword, setAdminPassword] = useState('');
    const [adminError, setAdminError] = useState('');

    if (currentView === '#/admin') {
        if (!adminAuthenticated) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm animate-fadeIn">
                        <h2 className="text-2xl font-bold mb-4 text-primary text-center">Admin Login</h2>
                        <form onSubmit={e => {
                            e.preventDefault();
                            if (adminPassword === 'admin@admin') {
                                setAdminAuthenticated(true);
                                setAdminError('');
                            } else {
                                setAdminError('Incorrect password.');
                            }
                        }}>
                            <input
                                type="password"
                                className="w-full px-4 py-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary mb-3"
                                placeholder="Enter admin password"
                                value={adminPassword}
                                onChange={e => setAdminPassword(e.target.value)}
                                autoFocus
                            />
                            {adminError && <p className="text-red-500 text-sm mb-2 text-center">{adminError}</p>}
                            <button
                                type="submit"
                                className="w-full bg-white text-black font-extrabold py-3 rounded border border-black hover:bg-gray-100 transition-all duration-300"
                            >
                                Login
                            </button>
                        </form>
                    </div>
                </div>
            );
        }
        return (
            <>
                <AdminPanel 
                    products={products}
                    siteImages={siteImages}
                    onAddProduct={addProduct}
                    onUpdateSiteImages={updateSiteImages}
                    onDeleteProduct={deleteProduct}
                    onSelectProductToEdit={handleSelectProductToEdit}
                />
                <EditProductModal 
                    product={productToEdit}
                    onUpdateProduct={updateProduct}
                    onClose={handleCloseEditModal}
                />
            </>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header logo={siteImages.logo} />
            <main className="flex-grow">
                {renderMainContent()}
            </main>
            <Footer />
            <ChatWidget />
            <PaymentModal 
                product={productToBuy}
                siteImages={siteImages}
                onClose={handleClosePaymentModal}
            />
        </div>
    );
};

export default App;