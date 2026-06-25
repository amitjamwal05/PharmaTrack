'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { Eye, EyeOff, Activity, ShieldCheck, TrendingUp, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { forgotPassword, resetPassword } = useAuth();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await forgotPassword(email);
    if (result.success) {
      setStep(2);
    } else {
      setError(result.message);
    }
    setIsSubmitting(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await resetPassword({ email, otp, newPassword });
    if (result.success) {
      setStep(3);
    } else {
      setError(result.message);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-screen lg:h-screen bg-background lg:overflow-hidden">
      {/* Left Side - Visual/Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-teal-950 overflow-hidden items-center justify-center">
        {/* Abstract Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-teal-900 via-teal-950 to-emerald-950 opacity-90" />
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-teal-500/20 mix-blend-screen filter blur-[100px]" />
        <div className="absolute top-40 -right-40 w-96 h-96 rounded-full bg-emerald-500/20 mix-blend-screen filter blur-[100px]" />
        <div className="absolute -bottom-40 left-20 w-96 h-96 rounded-full bg-cyan-600/20 mix-blend-screen filter blur-[100px]" />

        {/* Content */}
        <div className="relative z-10 w-full max-w-lg p-12 text-white">
          <div className="flex items-center space-x-3 mb-10">
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/20 shadow-xl">
              <Activity className="w-8 h-8 text-teal-300" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">Pharma<span className="text-teal-400">Track</span></h1>
          </div>
          
          <h2 className="text-4xl font-bold mb-6 leading-tight text-white">Intelligent Pharmacy Management</h2>
          <p className="text-teal-100/80 text-lg mb-10 leading-relaxed">
            Streamline your inventory, automate billing, track expiries, and gain actionable insights all in one unified platform.
          </p>

          <div className="space-y-6">
            <div className="flex items-center space-x-4 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm transition-transform hover:-translate-y-1">
              <div className="bg-teal-500/20 p-2 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-teal-300" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Secure & Compliant</h4>
                <p className="text-sm text-teal-100/70">Bank-grade security for your data.</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm transition-transform hover:-translate-y-1">
              <div className="bg-teal-500/20 p-2 rounded-lg">
                <TrendingUp className="w-6 h-6 text-teal-300" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Actionable Analytics</h4>
                <p className="text-sm text-teal-100/70">Real-time reports to grow your business.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col lg:overflow-y-auto lg:h-full">
        <div className="flex-1 py-12 px-8 sm:px-12 lg:px-24 lg:py-32">
          <div className="w-full max-w-md mx-auto space-y-8">
            <div className="text-center lg:text-left mb-10">
              {/* Mobile Logo */}
              <div className="lg:hidden flex justify-center items-center space-x-2 mb-8">
                <div className="bg-teal-100 dark:bg-teal-900/30 p-2 rounded-xl">
                  <Activity className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <h1 className="text-2xl font-extrabold text-foreground">Pharma<span className="text-teal-600 dark:text-teal-400">Track</span></h1>
              </div>
              
              <h2 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">
                {step === 1 ? 'Reset your password' : step === 2 ? 'Enter Reset Code' : 'Password Reset Successfully'}
              </h2>
              <p className="text-muted-foreground">
                {step === 1 ? 'Enter your email address to receive a verification code.' : step === 2 ? 'We sent a 6-digit code to your email.' : 'You can now sign in with your new password.'}
              </p>
            </div>

            {error && (
              <div className="p-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-900 rounded-xl animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            {step === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-6 mt-8">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Email Address</label>
                  <Input
                    type="email"
                    placeholder="admin@pharmacy.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 bg-muted/50 border-transparent focus:bg-background focus:border-teal-500 focus:ring-teal-500 transition-all shadow-sm"
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 text-base font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/20 transition-all hover:-translate-y-0.5"
                >
                  {isSubmitting ? 'Sending Code...' : 'Send Verification Code'}
                </Button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleResetPassword} className="space-y-6 mt-8">
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
                
                <div className="space-y-2 pt-4">
                  <label className="text-sm font-semibold text-foreground">New Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      className="h-12 bg-muted/50 border-transparent focus:bg-background focus:border-teal-500 focus:ring-teal-500 transition-all shadow-sm pr-12"
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
                    disabled={isSubmitting || otp.length !== 6 || newPassword.length < 6}
                    className="w-2/3 h-12 font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/20 transition-all"
                  >
                    {isSubmitting ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </div>
              </form>
            )}

            {step === 3 && (
              <div className="mt-8 space-y-6">
                <div className="p-6 bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-800 text-teal-800 dark:text-teal-300 rounded-xl flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-teal-100 dark:bg-teal-800 rounded-full flex items-center justify-center">
                    <KeyRound className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                  </div>
                  <p>Your password has been reset successfully. You can now use your new password to sign in to your account.</p>
                </div>
                
                <Link href="/login" className="block w-full">
                  <Button className="w-full h-12 text-base font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/20 transition-all hover:-translate-y-0.5">
                    Return to Sign In
                  </Button>
                </Link>
              </div>
            )}

            {step !== 3 && (
              <p className="text-center text-sm text-muted-foreground mt-8">
                Remember your password?{' '}
                <Link href="/login" className="font-semibold text-teal-600 hover:text-teal-500 transition-colors">
                  Sign in
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
