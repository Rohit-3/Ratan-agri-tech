import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface QRCode {
  id: string;
  name: string;
  upi_id: string;
  qr_code_url: string;
  is_active: boolean;
  created_at: string;
}

const QRCodeManager: React.FC = () => {
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingQR, setEditingQR] = useState<QRCode | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    upi_id: '',
    qr_code_file: null as File | null,
    is_active: true
  });

  // Load QR codes from localStorage
  useEffect(() => {
    const savedQRCodes = localStorage.getItem('admin_qr_codes');
    if (savedQRCodes) {
      setQrCodes(JSON.parse(savedQRCodes));
    }
  }, []);

  // Allow external button in AdminPanel to open the upload form
  useEffect(() => {
    const openForm = () => {
      setShowForm(true);
      setEditingQR(null);
    };
    window.addEventListener('open-qr-upload', openForm);
    return () => window.removeEventListener('open-qr-upload', openForm);
  }, []);

  // Save QR codes to localStorage
  const saveQRCodes = (codes: QRCode[]) => {
    setQrCodes(codes);
    localStorage.setItem('admin_qr_codes', JSON.stringify(codes));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, qr_code_file: file }));
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:image/png;base64, prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1) Upload file to backend
      let uploadedUrl = '';
      if (formData.qr_code_file) {
        const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
        const fd = new FormData();
        fd.append('file', formData.qr_code_file);
        const uploadRes = await fetch(`${apiUrl}/api/upload`, {
          method: 'POST',
          body: fd
        });
        const uploadJson = await uploadRes.json();
        if (!uploadJson.success) throw new Error('Upload failed');
        uploadedUrl = uploadJson.url; // e.g. /uploads/filename.png
      }

      // 2) Save as site image (qr_code)
      const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
      const saveRes = await fetch(`${apiUrl}/api/site-images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_code: uploadedUrl })
      });
      const saveJson = await saveRes.json();
      if (!saveJson.success) throw new Error('Save site image failed');

      // 3) Mirror minimal data locally too (for UI listing)
      const newQRCode: QRCode = {
        id: editingQR ? editingQR.id : `qr_${Date.now()}`,
        name: formData.name,
        upi_id: formData.upi_id,
        qr_code_url: uploadedUrl,
        is_active: formData.is_active,
        created_at: editingQR ? editingQR.created_at : new Date().toISOString()
      };
      const updatedCodes = editingQR ? qrCodes.map(qr => qr.id === editingQR.id ? newQRCode : qr) : [newQRCode, ...qrCodes];
      saveQRCodes(updatedCodes);

      setShowForm(false);
      setEditingQR(null);
      setFormData({ name: '', upi_id: '', qr_code_file: null, is_active: true });
    } catch (error) {
      console.error('Error saving QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (qrCode: QRCode) => {
    setEditingQR(qrCode);
    setFormData({
      name: qrCode.name,
      upi_id: qrCode.upi_id,
      qr_code_file: null,
      is_active: qrCode.is_active
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this QR code?')) {
      const updatedCodes = qrCodes.filter(qr => qr.id !== id);
      saveQRCodes(updatedCodes);
    }
  };

  const toggleActive = (id: string) => {
    const updatedCodes = qrCodes.map(qr => 
      qr.id === id ? { ...qr, is_active: !qr.is_active } : qr
    );
    saveQRCodes(updatedCodes);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">QR Code Management</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingQR(null);
            setFormData({ name: '', upi_id: '', qr_code_file: null, is_active: true });
          }}
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition-colors duration-200 font-semibold"
        >
          + Add QR Code
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-lg mb-6 border"
        >
          <h3 className="text-xl font-bold mb-4">
            {editingQR ? 'Edit QR Code' : 'Add New QR Code'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                QR Code Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Main UPI QR Code"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                UPI ID *
              </label>
              <input
                type="text"
                value={formData.upi_id}
                onChange={(e) => setFormData(prev => ({ ...prev, upi_id: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., ratanagritech@axisbank"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                QR Code Image *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                required={!editingQR}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-sm text-gray-500 mt-1">
                Upload a PNG or JPG image of your QR code
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Active (use this QR code for payments)
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-white text-black border border-black rounded-md hover:bg-gray-100 disabled:opacity-50 font-extrabold"
              >
                {loading ? 'Saving...' : editingQR ? 'Update' : 'Add QR Code'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingQR(null);
                  setFormData({ name: '', upi_id: '', qr_code_file: null, is_active: true });
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {qrCodes.map((qrCode) => (
          <motion.div
            key={qrCode.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-lg shadow-lg border"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-lg text-gray-800">{qrCode.name}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(qrCode)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(qrCode.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">UPI ID:</p>
              <p className="font-mono text-sm bg-gray-100 p-2 rounded">{qrCode.upi_id}</p>
            </div>

            {qrCode.qr_code_url && (
              <div className="mb-4">
                <p className="text-sm text-black font-extrabold mb-2">QR Code</p>
                <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                  <img
                    src={qrCode.qr_code_url.startsWith('http') ? qrCode.qr_code_url : `${(import.meta.env.VITE_API_URL || window.location.origin)}${qrCode.qr_code_url.startsWith('/') ? qrCode.qr_code_url : `/${qrCode.qr_code_url}`}`}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/image/qr%20code.jpg'; }}
                    alt="QR Code"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${qrCode.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-gray-600">
                  {qrCode.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <button
                onClick={() => toggleActive(qrCode.id)}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  qrCode.is_active
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-green-200 text-green-700 hover:bg-green-300'
                }`}
              >
                {qrCode.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Created: {new Date(qrCode.created_at).toLocaleDateString()}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {qrCodes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📱</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No QR Codes Added</h3>
          <p className="text-gray-500 mb-4">Add your first QR code to start accepting payments</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition-colors duration-200 font-semibold"
          >
            Add QR Code
          </button>
        </div>
      )}
    </div>
  );
};

export default QRCodeManager;
