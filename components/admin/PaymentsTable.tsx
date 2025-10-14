import React, { useEffect, useState } from 'react';

interface PaymentRow {
  id: number;
  transaction_id: string;
  invoice_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  product_name: string;
  amount: number;
  gst_rate: number;
  utr: string;
  upi_id: string;
  created_at: string;
  status: string;
}

const PaymentsTable: React.FC = () => {
  const [rows, setRows] = useState<PaymentRow[]>([]);

  useEffect(() => {
    const key = 'admin_payments';
    const existing = localStorage.getItem(key);
    setRows(existing ? JSON.parse(existing) : []);
  }, []);

  return (
    <div className="overflow-x-auto">
      {rows.length === 0 ? (
        <p className="text-gray-500">No payments yet. Confirm a payment from the checkout to see it here.</p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-bold text-gray-900 uppercase">Date</th>
              <th className="px-4 py-2 text-left text-xs font-bold text-gray-900 uppercase">Customer</th>
              <th className="px-4 py-2 text-left text-xs font-bold text-gray-900 uppercase">Email</th>
              <th className="px-4 py-2 text-left text-xs font-bold text-gray-900 uppercase">Phone</th>
              <th className="px-4 py-2 text-left text-xs font-bold text-gray-900 uppercase">Product</th>
              <th className="px-4 py-2 text-right text-xs font-bold text-gray-900 uppercase">Amount</th>
              <th className="px-4 py-2 text-left text-xs font-bold text-gray-900 uppercase">UTR</th>
              <th className="px-4 py-2 text-left text-xs font-bold text-gray-900 uppercase">UPI ID</th>
              <th className="px-4 py-2 text-left text-xs font-bold text-gray-900 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{new Date(r.created_at).toLocaleString()}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 font-semibold">{r.customer_name}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{r.customer_email}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{r.customer_phone || '-'}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{r.product_name}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-bold text-gray-900">₹{r.amount.toLocaleString('en-IN')}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-mono text-gray-700">{r.utr}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-mono text-gray-700">{r.upi_id}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-green-700 font-semibold">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PaymentsTable;

