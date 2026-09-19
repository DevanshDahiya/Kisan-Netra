import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContent';
import Logo from '../components/Logo';
import { Mail, Lock, LogIn, AlertCircle, CheckCircle2, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const infoMessage = location.state?.message;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials and try again.');
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
                    <h2 className="font-display text-2xl font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight mt-2">Welcome Back</h2>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Sign in to access your farm inventory or dealer store</p>
                </div>

                {infoMessage && (
                    <div className="bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800/60 text-primary-900 dark:text-primary-200 text-xs sm:text-sm rounded-xl p-4 mb-6 flex items-start gap-3">
                        <CheckCircle2 className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold uppercase tracking-wider text-[10px]">Registration Complete</h4>
                            <p className="mt-0.5">{infoMessage}</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-accent-50 dark:bg-accent-950/40 border border-accent-200 dark:border-accent-800/60 text-accent-900 dark:text-accent-200 text-xs sm:text-sm rounded-xl p-4 mb-6 flex items-start gap-3">
                        <AlertCircle className="w-4 h-4 text-accent-600 dark:text-accent-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold uppercase tracking-wider text-[10px]">Authentication Error</h4>
                            <p className="mt-0.5">{error}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
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

                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                                Password
                            </label>
                            <Link to="/forgot-password" className="text-xs font-medium text-accent-700 dark:text-accent-400 hover:text-accent-800 dark:hover:text-accent-300 hover:underline">
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                                <Lock className="w-4 h-4" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
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
                            <span>Signing in...</span>
                        ) : (
                            <>
                                <LogIn className="w-4 h-4" />
                                <span>Sign In</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-darkSurface-borderSubtle text-center">
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                        Don't have an account yet?{' '}
                        <Link to="/register" className="font-semibold text-accent-700 dark:text-accent-400 hover:text-accent-800 dark:hover:text-accent-300 inline-flex items-center gap-1 hover:underline">
                            Create account <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
}