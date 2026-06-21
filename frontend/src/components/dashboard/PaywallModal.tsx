import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface PaywallModalProps {
  onClose: () => void;
  message?: string;
  preventClose?: boolean;
}

export function PaywallModal({ onClose, message = "Upgrade Your Plan to Unlock Features", preventClose = false }: PaywallModalProps) {
  const { user, refreshUser } = useAuth();
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (planId: string) => {
    try {
      setProcessingPlan(planId);
      
      const res = await loadRazorpay();
      if (!res) {
        toast.error('Razorpay SDK failed to load');
        setProcessingPlan(null);
        return;
      }
      
      const { data } = await api.post('/payments/create-order', { planId });
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_T4A7frxFe07CHZ', 
        amount: data.amount,
        currency: data.currency,
        name: "PharmaTrack",
        description: `Subscription for ${planId} plan`,
        order_id: data.order_id,
        handler: async function (response: any) {
          const verifyPromise = api.post('/payments/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            planId
          }).then(async () => {
            if (refreshUser) await refreshUser();
            onClose();
          });

          toast.promise(verifyPromise, {
            loading: 'Payment completed! Verifying...',
            success: 'Subscription updated successfully!',
            error: 'Payment verification failed'
          });
        },
        prefill: {
          name: user?.name || "Store Owner",
          email: user?.email,
          contact: user?.storeId?.phone || "9999999999"
        },
        theme: {
          color: "#0d9488"
        }
      };
      
      const rzp1 = new (window as any).Razorpay(options);
      rzp1.on('payment.failed', function (response: any) {
        toast.error(response.error.description || "Payment failed");
      });
      rzp1.open();
      
    } catch (error: any) {
      console.error('Payment error:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to process payment';
      toast.error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setProcessingPlan(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-card border border-border w-full max-w-4xl p-8 rounded-2xl shadow-2xl relative overflow-y-auto max-h-[90vh]">
        {!preventClose && (
          <Button 
            variant="ghost" 
            className="absolute top-4 right-4 rounded-full w-8 h-8 p-0"
            onClick={onClose}
          >
            ✕
          </Button>
        )}
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-foreground mb-2">{message}</h2>
          <p className="text-muted-foreground text-lg">Choose a plan below to unlock full access to PharmaTrack.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-4">
          {/* Monthly */}
          <div 
            onClick={() => setSelectedPlan('monthly')}
            className={`border rounded-xl p-8 flex flex-col transition-all cursor-pointer ${selectedPlan === 'monthly' ? 'border-2 border-teal-500 bg-teal-50 dark:bg-teal-900/20 transform md:-translate-y-4 shadow-xl' : 'border-border bg-background hover:border-teal-500 shadow-sm hover:shadow-md'}`}
          >
            <h3 className="text-2xl font-bold mb-2">Monthly</h3>
            <div className="text-4xl font-extrabold text-teal-600 mb-6">₹3,999<span className="text-sm text-muted-foreground font-normal">/mo</span></div>
            <ul className="space-y-3 mb-8 flex-1 text-base text-muted-foreground">
              <li className="flex items-center gap-2">✓ <span>Unlimited Products</span></li>
              <li className="flex items-center gap-2">✓ <span>Unlimited Bills</span></li>
              <li className="flex items-center gap-2">✓ <span>Advanced Analytics</span></li>
              <li className="flex items-center gap-2">✓ <span>Priority Support</span></li>
            </ul>
            <Button 
              className="w-full bg-teal-600 hover:bg-teal-700 h-12 text-lg" 
              onClick={(e) => { e.stopPropagation(); handlePayment('monthly'); }}
              disabled={processingPlan !== null}
            >
              {processingPlan === 'monthly' ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Pay Monthly
            </Button>
          </div>
          
          {/* Quarterly */}
          <div 
            onClick={() => setSelectedPlan('quarterly')}
            className={`border rounded-xl p-8 flex flex-col relative transition-all cursor-pointer ${selectedPlan === 'quarterly' ? 'border-2 border-teal-500 bg-teal-50 dark:bg-teal-900/20 transform md:-translate-y-4 shadow-xl' : 'border-border bg-background hover:border-teal-500 shadow-sm hover:shadow-md'}`}
          >
            <h3 className="text-2xl font-bold mb-2 text-teal-900 dark:text-teal-100">Quarterly</h3>
            <div className="text-4xl font-extrabold text-teal-600 mb-6">₹8,999<span className="text-sm text-teal-700/70 dark:text-teal-400/70 font-normal">/qtr</span></div>
            <ul className="space-y-3 mb-8 flex-1 text-base text-teal-800 dark:text-teal-300">
              <li className="flex items-center gap-2">✓ <span>Unlimited Products</span></li>
              <li className="flex items-center gap-2 font-semibold">✓ <span>Save ₹2,998/qtr</span></li>
            </ul>
            <Button 
              className="w-full bg-teal-600 hover:bg-teal-700 h-12 text-lg shadow-lg" 
              onClick={(e) => { e.stopPropagation(); handlePayment('quarterly'); }}
              disabled={processingPlan !== null}
            >
              {processingPlan === 'quarterly' ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Pay Quarterly
            </Button>
          </div>

          {/* Annually */}
          <div 
            onClick={() => setSelectedPlan('annually')}
            className={`border rounded-xl p-8 flex flex-col relative transition-all cursor-pointer ${selectedPlan === 'annually' ? 'border-2 border-teal-500 bg-teal-50 dark:bg-teal-900/20 transform md:-translate-y-4 shadow-xl' : 'border-border bg-background hover:border-teal-500 shadow-sm hover:shadow-md'}`}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-teal-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Best Value
            </div>
            <h3 className="text-2xl font-bold mb-2 text-teal-900 dark:text-teal-100">Annually</h3>
            <div className="text-4xl font-extrabold text-teal-600 mb-6">₹19,999<span className="text-sm text-teal-700/70 dark:text-teal-400/70 font-normal">/yr</span></div>
            <ul className="space-y-3 mb-8 flex-1 text-base text-teal-800 dark:text-teal-300">
              <li className="flex items-center gap-2">✓ <span>Unlimited Everything</span></li>
              <li className="flex items-center gap-2 font-semibold">✓ <span>Save ₹27,989/yr</span></li>
            </ul>
            <Button 
              className="w-full bg-teal-600 hover:bg-teal-700 h-12 text-lg shadow-lg" 
              onClick={(e) => { e.stopPropagation(); handlePayment('annually'); }}
              disabled={processingPlan !== null}
            >
              {processingPlan === 'annually' ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Pay Annually
            </Button>
          </div>
        </div>

        {/* Temporary Test Button */}
        <div className="mt-8 flex justify-center">
          <Button 
            variant="outline"
            className="border-dashed border-2 border-teal-500 text-teal-600 hover:bg-teal-50"
            onClick={(e) => { e.stopPropagation(); handlePayment('test'); }}
            disabled={processingPlan !== null}
          >
            {processingPlan === 'test' ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            Run ₹1 Test Payment
          </Button>
        </div>

      </div>
    </div>
  );
}
