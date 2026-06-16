'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    storeName: '',
    phone: '',
  });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  
  const { register, sendOtp } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOtpSending(true);

    const result = await sendOtp(formData.email);
    if (result.success) {
      setStep(2);
    } else {
      setError(result.message);
    }
    setOtpSending(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await register({ ...formData, otp });
    if (!result.success) {
      setError(result.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-8 space-y-6 bg-card border border-border rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-teal-600 dark:text-teal-400">PharmaTrack</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {step === 1 ? 'Create a new account' : 'Verify your email address'}
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-100 rounded-md">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 mt-1 border border-input bg-background text-foreground rounded-md focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 mt-1 border border-input bg-background text-foreground rounded-md focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 mt-1 border border-input bg-background text-foreground rounded-md focus:ring-teal-500 focus:border-teal-500 pr-10"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Store Name</label>
              <input
                type="text"
                name="storeName"
                value={formData.storeName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 mt-1 border border-input bg-background text-foreground rounded-md focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Store Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 mt-1 border border-input bg-background text-foreground rounded-md focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            
            <button
              type="submit"
              disabled={otpSending}
              className="w-full px-4 py-2 font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:opacity-50"
            >
              {otpSending ? 'Sending OTP...' : 'Verify Email'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="p-4 bg-teal-50 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 rounded-lg text-sm mb-4">
              We sent a 6-digit verification code to <strong>{formData.email}</strong>.
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">6-Digit OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
                placeholder="Enter 6-digit code"
                className="w-full px-3 py-3 mt-1 text-center tracking-widest text-lg font-bold border border-input bg-background text-foreground rounded-md focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 px-4 py-2 font-medium text-foreground bg-muted border border-border rounded-md hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting || otp.length !== 6}
                className="w-2/3 px-4 py-2 font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating Store...' : 'Complete Registration'}
              </button>
            </div>
          </form>
        )}

        {step === 1 && (
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-teal-600 dark:text-teal-400 hover:underline">
              Login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
