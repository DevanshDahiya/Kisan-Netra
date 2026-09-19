import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Logo from '../components/Logo';
import { Mail, KeyRound, Lock, AlertCircle, CheckCircle2, ArrowLeft, Send, Eye, EyeOff } from 'lucide-react';

export default function ForgotPassword() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const res = await api.post('/auth/forgot-password', { email });
            setMessage(res.data.message);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await api.post('/auth/reset-password', { email, otp, newPassword });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Reset failed. Please check your OTP and try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-12 px-4 mb-14">
            <div className="bg-white dark:bg-darkSurface-card p-8 rounded-2xl shadow-xs border border-neutral-200 dark:border-darkSurface-border">
                
                {/* Header */}
                <div className="text-center mb-8 flex flex-col items-center">
                    <div className="mb-3">
                        <Logo size="lg" showSubtitle={false} link={false} />
                    </div>
                    <h2 className="font-display text-2xl font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight mt-2">
                        {step === 1 ? 'Forgot Password?' : 'Enter Verification OTP'}
                    </h2>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        {step === 1
                            ? 'Enter your registered email address to receive an OTP'
                            : `We sent a 6-digit code to ${email}`}
                    </p>
                </div>

                {error && (
                    <div className="bg-accent-50 dark:bg-accent-950/40 border border-accent-200 dark:border-accent-800/60 text-accent-900 dark:text-accent-200 text-xs sm:text-sm rounded-xl p-4 mb-6 flex items-start gap-3">
                        <AlertCircle className="w-4 h-4 text-accent-600 dark:text-accent-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold uppercase tracking-wider text-[10px]">Error</h4>
                            <p className="mt-0.5">{error}</p>
                        </div>
                    </div>
                )}

                {message && step === 2 && (
                    <div className="bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800/60 text-primary-900 dark:text-primary-200 text-xs sm:text-sm rounded-xl p-4 mb-6 flex items-start gap-3">
                        <CheckCircle2 className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold uppercase tracking-wider text-[10px]">OTP Dispatched</h4>
                            <p className="mt-0.5">{message}</p>
                        </div>
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleRequestOTP} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 uppercase tracking-wider">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-3.5 py-2.5 border border-neutral-300 dark:border-darkSurface-border rounded-btn bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all text-sm"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full mt-2 py-3 bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-btn transition-colors shadow-2xs hover:shadow-xs disabled:opacity-50 flex justify-center items-center gap-2 text-sm"
                        >
                            {submitting ? (
                                <span>Sending code...</span>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    <span>Send OTP Code</span>
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 uppercase tracking-wider">
                                6-Digit OTP Code
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                                    <KeyRound className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    maxLength={6}
                                    className="w-full pl-10 pr-3.5 py-2.5 border border-neutral-300 dark:border-darkSurface-border rounded-btn bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all text-sm font-mono tracking-widest text-center"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 uppercase tracking-wider">
                                New Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Min. 6 characters"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full pl-10 pr-10 py-2.5 border border-neutral-300 dark:border-darkSurface-border rounded-btn bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                                    title={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full mt-2 py-3 bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-btn transition-colors shadow-2xs hover:shadow-xs disabled:opacity-50 flex justify-center items-center gap-2 text-sm"
                        >
                            {submitting ? (
                                <span>Resetting...</span>
                            ) : (
                                <>
                                    <Lock className="w-4 h-4" />
                                    <span>Reset Password</span>
                                </>
                            )}
                        </button>
                    </form>
                )}

                <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-darkSurface-borderSubtle text-center">
                    <Link to="/login" className="font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white inline-flex items-center gap-1.5 text-xs sm:text-sm hover:underline">
                        <ArrowLeft className="w-4 h-4" /> Back to Login
                    </Link>
                </div>

            </div>
        </div>
    );
}