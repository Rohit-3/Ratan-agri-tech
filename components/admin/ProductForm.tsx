import React, { useState } from 'react';
import { categories } from '../../constants';
import { Product, ProductCategory } from '../../types';

// Upload to backend and return absolute URL
const uploadToBackend = async (file: File): Promise<string> => {
    const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
    // Compress to webp (max 1200px)
    const compress = (file: File) => new Promise<Blob>((resolve) => {
        const img = new Image();
        img.onload = () => {
            const maxDim = 1200;
            let { width, height } = img as HTMLImageElement;
            if (width > height && width > maxDim) {
                height = Math.round((maxDim / width) * height);
                width = maxDim;
            } else if (height > width && height > maxDim) {
                width = Math.round((maxDim / height) * width);
                height = maxDim;
            } else if (width > maxDim) {
                width = maxDim; height = maxDim;
            }
            const canvas = document.createElement('canvas');
            canvas.width = width; canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return resolve(file);
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => resolve(blob || file), 'image/webp', 0.8);
        };
        img.src = URL.createObjectURL(file);
    });
    const fd = new FormData();
    const blob = await compress(file);
    const webpFile = new File([blob], (file.name || 'image').replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' });
    fd.append('file', webpFile);
    const res = await fetch(`${apiUrl}/api/upload`, { method: 'POST', body: fd });
    const json = await res.json();
    if (!json?.success || !json?.url) throw new Error('Upload failed');
    const url: string = json.url;
    return url.startsWith('http') ? url : `${apiUrl}${url.startsWith('/') ? url : `/${url}`}`;
};

interface ProductFormProps {
    onAddProduct: (product: Omit<Product, 'id'>) => void;
}

const initialFormState = {
    name: '',
    category: ProductCategory.PowerTiller,
    image: '',
    description: '',
    specifications: '',
    price: '',
};

const ProductForm: React.FC<ProductFormProps> = ({ onAddProduct }) => {
    const [formState, setFormState] = useState(initialFormState);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    
    const productCategories = categories.filter(c => c !== ProductCategory.All);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // preview locally
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
            try {
                const uploadedUrl = await uploadToBackend(file);
                setFormState(prev => ({ ...prev, image: uploadedUrl }));
                setImagePreview(uploadedUrl);
            } catch (err) {
                console.error('Upload failed', err);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Convert specifications string to object
        const specsObject = formState.specifications.split('\n').reduce((acc, line) => {
            const [key, value] = line.split(':', 2);
            if (key && value) {
                acc[key.trim()] = value.trim();
            }
            return acc;
        }, {} as { [key: string]: string });

        // Try backend create; fall back to local handler
        const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
        try {
            const resp = await fetch(`${apiUrl}/api/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formState.name,
                    description: formState.description,
                    price: Number(formState.price) || 0,
                    image_url: formState.image,
                    category: formState.category,
                }),
            });
            const json = await resp.json();
            if (!json?.success) throw new Error('Create failed');
            // Mirror locally so UI and localStorage persist image/data
            const created = json.data;
            onAddProduct({
                name: created?.name ?? formState.name,
                category: created?.category ?? formState.category,
                image: created?.image_url ?? formState.image,
                description: created?.description ?? formState.description,
                specifications: specsObject,
                price: typeof created?.price === 'number' ? created.price : (Number(formState.price) || undefined),
            });
        } catch (err) {
            onAddProduct({
                name: formState.name,
                category: formState.category,
                image: formState.image,
                description: formState.description,
                specifications: specsObject,
                price: Number(formState.price) || undefined,
            });
        }

        // Reset form and show success message
        setFormState(initialFormState);
        setImagePreview(null);
        (document.getElementById('product-form') as HTMLFormElement)?.reset();
        setIsSubmitted(true);
        setTimeout(() => setIsSubmitted(false), 3000);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New Product</h2>
            <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
                        <input type="text" name="name" id="name" value={formState.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" />
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                        <select name="category" id="category" value={formState.category} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
                            {productCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                </div>
                 <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (INR)</label>
                    <input type="number" name="price" id="price" value={formState.price} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" placeholder="e.g., 45000" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Product Image</label>
                    <div className="mt-1 flex items-center space-x-4">
                        {imagePreview && <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-md bg-gray-100" />}
                        <input type="file" accept="image/*" onChange={handleImageChange} required className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"/>
                    </div>
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea name="description" id="description" value={formState.description} onChange={handleChange} rows={3} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"></textarea>
                </div>
                <div>
                    <label htmlFor="specifications" className="block text-sm font-medium text-gray-700">Specifications</label>
                    <textarea name="specifications" id="specifications" value={formState.specifications} onChange={handleChange} rows={4} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" placeholder="Enter one per line, e.g., Engine: 7 HP Petrol"></textarea>
                    <p className="mt-1 text-xs text-gray-500">Format: Key: Value (one per line)</p>
                </div>
                <div className="text-right">
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300">
                        Add Product
                    </button>
                    {isSubmitted && <span className="ml-4 text-green-600 font-semibold">Product added successfully!</span>}
                </div>
            </form>
        </div>
    );
};

export default ProductForm;