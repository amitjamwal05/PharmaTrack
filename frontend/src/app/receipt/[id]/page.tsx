'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Receipt as ReceiptIcon, MapPin, Phone, Mail, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';

export default function PublicReceiptPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [bill, setBill] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const res = await api.get(`/bills/public/${id}`);
        setBill(res.data);
      } catch (err: any) {
        console.error('Error fetching receipt:', err);
        setError('Receipt not found or invalid link.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchBill();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4 text-center">
        <Card className="p-8 max-w-sm w-full">
          <div className="text-red-500 mb-4 flex justify-center">
            <ReceiptIcon className="w-12 h-12 opacity-50" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-500">{error}</p>
        </Card>
      </div>
    );
  }

  const store = bill.storeId || {};

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 flex flex-col justify-start items-center font-sans">
      <Card className="w-full max-w-md bg-white shadow-xl rounded-xl overflow-hidden relative shrink-0">
        
        {/* Header Ribbon */}
        <div className="bg-teal-600 h-3 w-full absolute top-0 left-0"></div>

        <div className="p-8 pb-6 text-center border-b border-gray-100 mt-2">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-teal-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-wide uppercase mb-1">
            {store.name || 'PharmaTrack'}
          </h1>
          <p className="text-sm text-gray-500 mb-4 flex items-center justify-center gap-1">
            <ReceiptIcon className="w-4 h-4" /> E-Receipt
          </p>

          {(store.address || store.phone) && (
            <div className="inline-flex flex-col items-center bg-gray-50 rounded-lg p-3 w-full text-xs text-gray-600 space-y-1">
              {store.address && (
                <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {store.address}</div>
              )}
              {store.phone && (
                <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {store.phone}</div>
              )}
            </div>
          )}
        </div>

        <div className="p-8 pt-6">
          <div className="flex justify-between items-center mb-6 text-sm">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Billed To</p>
              <p className="font-semibold text-gray-800">{bill.customerName || 'Cash Walk-in'}</p>
              {bill.customerPhone && <p className="text-gray-600 text-xs mt-0.5">{bill.customerPhone}</p>}
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Invoice Date</p>
              <p className="font-medium text-gray-800">{new Date(bill.createdAt).toLocaleDateString()}</p>
              <p className="text-gray-500 text-xs mt-0.5">{new Date(bill.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 border-b border-gray-200 pb-2">
              <span className="flex-1">Item</span>
              <span className="w-12 text-center">Qty</span>
              <span className="w-20 text-right">Amount</span>
            </div>

            <div className="space-y-3">
              {bill.items.map((item: any, i: number) => (
                <div key={i} className="flex justify-between text-sm">
                  <div className="flex-1 pr-2">
                    <p className="font-medium text-gray-800">{item.productName}</p>
                    <p className="text-xs text-gray-500">₹{item.sellingPrice.toFixed(2)} / unit</p>
                  </div>
                  <div className="w-12 text-center text-gray-600 font-medium">{item.quantity}</div>
                  <div className="w-20 text-right font-medium text-gray-800">₹{item.total.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 text-sm border-t border-gray-100 pt-4 mb-6">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{bill.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>GST</span>
              <span>₹{bill.totalGst.toFixed(2)}</span>
            </div>
            {bill.discountAmount > 0 && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Discount</span>
                <span>-₹{bill.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-lg font-bold text-gray-800 pt-3 border-t border-gray-100 mt-2">
              <span>Total Paid</span>
              <span className="text-teal-600">₹{bill.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-400 bg-gray-50 rounded-full py-2 px-4 inline-block">
              Paid via {bill.paymentMethod?.toUpperCase()}
            </p>
          </div>
        </div>
        
        {/* Zig-zag bottom edge effect for receipt feel */}
        <div className="w-full h-4 bg-repeat-x" style={{ 
          backgroundImage: 'linear-gradient(45deg, transparent 33.333%, #f9fafb 33.333%, #f9fafb 66.667%, transparent 66.667%), linear-gradient(-45deg, transparent 33.333%, #f9fafb 33.333%, #f9fafb 66.667%, transparent 66.667%)',
          backgroundSize: '12px 24px',
          backgroundPosition: '0 -12px'
        }}></div>

      </Card>
      
      {/* Footer Branding */}
      <div className="w-full max-w-md mt-6 text-center text-xs text-gray-400 pb-8">
        <p>Powered by <strong>PharmaTrack</strong></p>
      </div>
    </div>
  );
}
