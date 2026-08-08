import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContent';
import { User, Mail, Lock, UserPlus, AlertCircle, Sprout, Store, ArrowRight } from 'lucide-react';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
            // Redirect user to login page with success message asking them to log in explicitly
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
        <div className="max-w-md mx-auto mt-10 px-4 mb-12">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <UserPlus className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create an Account</h2>
                    <p className="text-sm text-slate-500 mt-1">Join Kisan Netra as a Farmer or Licensed Dealer</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 mb-6 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-red-900 text-xs uppercase tracking-wider">Registration Error</h4>
                            <p className="mt-0.5">{error}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Role Selection Cards */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wider">
                            I am a:
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setRole('farmer')}
                                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                                    role === 'farmer'
                                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 font-semibold'
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                }`}
                            >
                                <Sprout className={`w-5 h-5 ${role === 'farmer' ? 'text-emerald-600' : 'text-slate-400'}`} />
                                <span className="text-xs font-medium">Farmer</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setRole('dealer')}
                                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                                    role === 'dealer'
                                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 font-semibold'
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                }`}
                            >
                                <Store className={`w-5 h-5 ${role === 'dealer' ? 'text-emerald-600' : 'text-slate-400'}`} />
                                <span className="text-xs font-medium">Agri Dealer</span>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                            Full Name
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <User className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                placeholder="e.g. Ramesh Kumar"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                            Email Address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Mail className="w-4 h-4" />
                            </div>
                            <input
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Lock className="w-4 h-4" />
                            </div>
                            <input
                                type="password"
                                placeholder="Min. 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-sm"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 flex justify-center items-center gap-2 text-sm"
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

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <p className="text-sm text-slate-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 hover:underline">
                            Sign in <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
}