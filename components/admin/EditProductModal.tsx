import React, { useState, useEffect } from 'react';
import { categories } from '../../constants';
import { Product, ProductCategory, EditProductModalProps } from '../../types';

// Helper to convert file to base64
const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});

interface FormState {
    name: string;
    category: ProductCategory;
    image: string;
    description: string;
    specifications: string; // Using a single string for the textarea
    price: string;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ product, onUpdateProduct, onClose }) => {
    const [formState, setFormState] = useState<FormState | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        if (product) {
            const specsString = Object.entries(product.specifications)
                .map(([key, value]) => `${key}: ${value}`)
                .join('\n');
            
            setFormState({
                name: product.name,
                category: product.category,
                image: product.image,
                description: product.description,
                specifications: specsString,
                price: product.price?.toString() || '',
            });
            setImagePreview(product.image);
        }
    }, [product]);

    if (!product || !formState) {
        return null;
    }
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const base64 = await toBase64(file);
            setFormState(prev => prev ? { ...prev, image: base64 } : null);
            setImagePreview(base64);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState) return;

        const specsObject = formState.specifications.split('\n').reduce((acc, line) => {
            const [key, value] = line.split(':', 2);
            if (key && value) {
                acc[key.trim()] = value.trim();
            }
            return acc;
        }, {} as { [key: string]: string });

        const updatedProduct: Product = {
            ...product, // This keeps the original ID
            name: formState.name,
            category: formState.category,
            image: formState.image,
            description: formState.description,
            specifications: specsObject,
            price: Number(formState.price) || undefined,
        };

        onUpdateProduct(updatedProduct);
    };
    
    const productCategories = categories.filter(c => c !== ProductCategory.All);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Edit Product: {product.name}</h2>
                    <button onClick={onClose} aria-label="Close modal" className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">Product Name</label>
                            <input type="text" name="name" id="edit-name" value={formState.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" />
                        </div>
                        <div>
                            <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700">Category</label>
                            <select name="category" id="edit-category" value={formState.category} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
                                {productCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700">Price (INR)</label>
                        <input type="number" name="price" id="edit-price" value={formState.price} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" placeholder="e.g., 45000" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Product Image</label>
                        <div className="mt-1 flex items-center space-x-4">
                            {imagePreview && <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-md bg-gray-100" />}
                            <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"/>
                        </div>
                         <p className="mt-1 text-xs text-gray-500">Upload a new image to replace the current one.</p>
                    </div>
                    <div>
                        <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea name="description" id="edit-description" value={formState.description} onChange={handleChange} rows={3} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"></textarea>
                    </div>
                    <div>
                        <label htmlFor="edit-specifications" className="block text-sm font-medium text-gray-700">Specifications</label>
                        <textarea name="specifications" id="edit-specifications" value={formState.specifications} onChange={handleChange} rows={4} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" placeholder="Enter one per line, e.g., Engine: 7 HP Petrol"></textarea>
                        <p className="mt-1 text-xs text-gray-500">Format: Key: Value (one per line)</p>
                    </div>
                    <div className="flex justify-end items-center space-x-4 pt-4 border-t mt-6">
                        <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg transition duration-300">
                            Cancel
                        </button>
                        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProductModal;