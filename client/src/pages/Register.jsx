import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContent';
import Logo from '../components/Logo';
import { User, Mail, Lock, UserPlus, AlertCircle, Store, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState('farmer');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await register(name, email, password, role);
            // Redirect user to login page with explicit success message
            navigate('/login', {
                state: { message: 'Registration successful! Please sign in with your email and password.' },
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 px-4 mb-14">
            <div className="bg-white dark:bg-darkSurface-card p-8 rounded-2xl shadow-xs border border-neutral-200 dark:border-darkSurface-border">
                
                {/* Header */}
                <div className="text-center mb-8 flex flex-col items-center">
                    <div className="mb-3">
                        <Logo size="lg" showSubtitle={false} link={false} />
                    </div>
                    <h2 className="font-display text-2xl font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight mt-2">Create an Account</h2>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Join Kisan Netra as a Farmer or Licensed Dealer</p>
                </div>

                {error && (
                    <div className="bg-accent-50 dark:bg-accent-950/40 border border-accent-200 dark:border-accent-800/60 text-accent-900 dark:text-accent-200 text-xs sm:text-sm rounded-xl p-4 mb-6 flex items-start gap-3">
                        <AlertCircle className="w-4 h-4 text-accent-600 dark:text-accent-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold uppercase tracking-wider text-[10px]">Registration Error</h4>
                            <p className="mt-0.5">{error}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Role Selection Cards */}
                    <div>
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2 uppercase tracking-wider">
                            I am registering as:
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setRole('farmer')}
                                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                                    role === 'farmer'
                                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-950/60 text-primary-900 dark:text-primary-200 ring-2 ring-primary-500/20 font-semibold'
                                        : 'border-neutral-200 dark:border-darkSurface-border bg-white dark:bg-darkSurface-surface text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
                                }`}
                            >
                                <User className={`w-5 h-5 ${role === 'farmer' ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-400'}`} />
                                <span className="text-xs font-medium">Farmer</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setRole('dealer')}
                                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                                    role === 'dealer'
                                        ? 'border-accent-600 bg-accent-50 dark:bg-accent-950/60 text-accent-900 dark:text-accent-200 ring-2 ring-accent-500/20 font-semibold'
                                        : 'border-neutral-200 dark:border-darkSurface-border bg-white dark:bg-darkSurface-surface text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
                                }`}
                            >
                                <Store className={`w-5 h-5 ${role === 'dealer' ? 'text-accent-600 dark:text-accent-400' : 'text-neutral-400'}`} />
                                <span className="text-xs font-medium">Agri Dealer</span>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 uppercase tracking-wider">
                            Full Name
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                                <User className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                placeholder="e.g. Ramesh Kumar"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full pl-10 pr-3.5 py-2.5 border border-neutral-300 dark:border-darkSurface-border rounded-btn bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all text-sm"
                            />
                        </div>
                    </div>

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
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 uppercase tracking-wider">
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                                <Lock className="w-4 h-4" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Min. 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                            <span>Creating account...</span>
                        ) : (
                            <>
                                <UserPlus className="w-4 h-4" />
                                <span>Create Account</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-darkSurface-borderSubtle text-center">
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-accent-700 dark:text-accent-400 hover:text-accent-800 dark:hover:text-accent-300 inline-flex items-center gap-1 hover:underline">
                            Sign in <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
}