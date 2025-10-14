import React, { useState, useEffect } from 'react';
import { SiteImages } from '../../types';
import { initialSiteImages } from '../../constants';

// Helper to convert file to base64
const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});

interface ImageManagerProps {
    currentImages: SiteImages;
    onUpdate: (newImages: SiteImages) => void;
}

// FIX: Added `export` to create a named export, and implemented the component's JSX return.
export const ImageManager: React.FC<ImageManagerProps> = ({ currentImages, onUpdate }) => {
    const [images, setImages] = useState(currentImages);
    const [previews, setPreviews] = useState(currentImages);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setImages(currentImages);
        setPreviews(currentImages);
    }, [currentImages]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, key: keyof SiteImages) => {
        const file = e.target.files?.[0];
        if (file) {
            const base64 = await toBase64(file);
            setImages(prev => ({ ...prev, [key]: base64 }));
            // FIX: Corrected typo from `base6` to `base64`.
            setPreviews(prev => ({...prev, [key]: base64 }));
        }
    };

    const handleSave = () => {
        onUpdate(images);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Manage Site Images</h2>
            <div className="space-y-6">
                {(Object.keys(initialSiteImages) as Array<keyof SiteImages>).map((key) => (
                    <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')} Image</label>
                        <div className="mt-1 flex items-center space-x-4">
                            <img src={previews[key]} alt={`${key} preview`} className="w-32 h-20 object-contain rounded-md bg-gray-100" />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, key)}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                            />
                        </div>
                    </div>
                ))}
            </div>
            <div className="text-right mt-6">
                <button
                    onClick={handleSave}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
                >
                    Save Image Changes
                </button>
                {isSaved && <span className="ml-4 text-green-600 font-semibold">Images saved successfully!</span>}
            </div>
        </div>
    );
};