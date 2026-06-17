'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { Eye, EyeOff, Activity, CheckCircle2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
    <div className="flex min-h-screen lg:h-screen bg-background lg:overflow-hidden">
      {/* Left Side - Visual/Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-teal-950 overflow-hidden items-center justify-center">
        {/* Abstract Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-emerald-950 via-teal-900 to-teal-950 opacity-90" />
        <div className="absolute top-20 left-20 w-[500px] h-[500px] rounded-full bg-teal-500/20 mix-blend-screen filter blur-[100px]" />
        <div className="absolute bottom-20 right-20 w-[400px] h-[400px] rounded-full bg-emerald-500/20 mix-blend-screen filter blur-[100px]" />

        {/* Content */}
        <div className="relative z-10 w-full max-w-lg p-12 text-white">
          <div className="flex items-center space-x-3 mb-10">
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/20 shadow-xl">
              <Activity className="w-8 h-8 text-teal-300" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">Pharma<span className="text-teal-400">Track</span></h1>
          </div>
          
          <h2 className="text-4xl font-bold mb-6 leading-tight text-white">Join the Next Generation of Pharmacies</h2>
          <p className="text-teal-100/80 text-lg mb-10 leading-relaxed">
            Create your store today and start managing your inventory with precision and ease. It takes less than 2 minutes.
          </p>

          <div className="space-y-6">
            <div className="flex items-center space-x-4 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm transition-transform hover:-translate-y-1">
              <div className="bg-teal-500/20 p-2 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-teal-300" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Easy Setup</h4>
                <p className="text-sm text-teal-100/70">No credit card required for the free trial.</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm transition-transform hover:-translate-y-1">
              <div className="bg-teal-500/20 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-teal-300" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Full Control</h4>
                <p className="text-sm text-teal-100/70">Super admin dashboards for multi-store management.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex flex-col lg:overflow-y-auto lg:h-full">
        <div className="flex-1 py-12 px-8 sm:px-12 lg:px-16 lg:py-20">
          <div className="w-full max-w-md mx-auto space-y-8">
            <div className="text-center lg:text-left mb-8">
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center items-center space-x-2 mb-8">
              <div className="bg-teal-100 dark:bg-teal-900/30 p-2 rounded-xl">
                <Activity className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <h1 className="text-2xl font-extrabold text-foreground">Pharma<span className="text-teal-600 dark:text-teal-400">Track</span></h1>
            </div>
            
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">
              {step === 1 ? 'Create an account' : 'Verify your email'}
            </h2>
            <p className="text-muted-foreground">
              {step === 1 ? 'Enter your details below to set up your store.' : 'Enter the OTP sent to your email.'}
            </p>
          </div>

          {error && (
            <div className="p-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-900 rounded-xl animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Full Name</label>
                <Input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="h-11 bg-muted/50 border-transparent focus:bg-background focus:border-teal-500 focus:ring-teal-500 transition-all shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Email Address</label>
                <Input
                  type="email"
                  name="email"
                  placeholder="admin@pharmacy.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-11 bg-muted/50 border-transparent focus:bg-background focus:border-teal-500 focus:ring-teal-500 transition-all shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="h-11 bg-muted/50 border-transparent focus:bg-background focus:border-teal-500 focus:ring-teal-500 transition-all shadow-sm pr-12"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 h-full px-4 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-border/50">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Store Details</h3>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Store Name</label>
                    <Input
                      type="text"
                      name="storeName"
                      placeholder="My Pharmacy Store"
                      value={formData.storeName}
                      onChange={handleChange}
                      required
                      className="h-11 bg-muted/50 border-transparent focus:bg-background focus:border-teal-500 focus:ring-teal-500 transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Store Phone</label>
                    <Input
                      type="tel"
                      name="phone"
                      placeholder="+91 XXXXXXX"
                      value={formData.phone}
                      onChange={handleChange}
                      className="h-11 bg-muted/50 border-transparent focus:bg-background focus:border-teal-500 focus:ring-teal-500 transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={otpSending}
                className="w-full h-12 mt-6 text-base font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/20 transition-all hover:-translate-y-0.5"
              >
                {otpSending ? 'Sending OTP...' : 'Verify Email'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="p-4 bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-800 text-teal-800 dark:text-teal-300 rounded-xl text-sm mb-6 flex items-start space-x-3">
                <Shield className="w-5 h-5 shrink-0 mt-0.5 text-teal-600 dark:text-teal-400" />
                <p>We sent a 6-digit verification code to <strong>{formData.email}</strong>.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground text-center block">Enter 6-Digit OTP</label>
                <Input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={6}
                  placeholder="000000"
                  className="w-full h-14 text-center tracking-[0.5em] text-2xl font-bold bg-muted/50 border-transparent focus:bg-background focus:border-teal-500 focus:ring-teal-500 transition-all shadow-sm"
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="w-1/3 h-12 font-semibold"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || otp.length !== 6}
                  className="w-2/3 h-12 font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/20 transition-all"
                >
                  {isSubmitting ? 'Creating Store...' : 'Complete Registration'}
                </Button>
              </div>
            </form>
          )}

          {step === 1 && (
            <p className="text-center text-sm text-muted-foreground mt-8">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-teal-600 hover:text-teal-500 transition-colors">
                Sign In
              </Link>
            </p>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
