import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContent';
import api from '../api/axios';
import { ShieldAlert, AlertTriangle, Trash2, X, Lock, KeyRound, User, Store } from 'lucide-react';

export default function AccountSettings() {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const modalRef = useRef(null);
    const passwordInputRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isModalOpen) {
                closeModal();
            }
        };
        if (isModalOpen) {
            window.addEventListener('keydown', handleKeyDown);
            // Focus input on open
            setTimeout(() => passwordInputRef.current?.focus(), 50);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen]);

    const openModal = () => {
        setConfirmText('');
        setPassword('');
        setError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        if (loading) return;
        setIsModalOpen(false);
        setConfirmText('');
        setPassword('');
        setError('');
    };

    const handleDeleteAccount = async (e) => {
        e.preventDefault();
        if (confirmText !== 'DELETE') {
            setError('Please type DELETE in capital letters to confirm.');
            return;
        }
        if (!password) {
            setError('Please enter your password.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.delete('/auth/account', {
                data: { password },
            });

            // Clear auth state and navigate to home
            setUser(null);
            navigate('/', {
                state: { message: 'Your account has been permanently deleted.' },
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete account. Please verify your password.');
        } finally {
            setLoading(false);
        }
    };

    const roleSpecificExplanation =
        user?.role === 'dealer'
            ? "Your store profile, product listings and prices will be removed and you will disappear from search. Farmers' inventory records that mention your store keep their quantities but lose the store link."
            : 'Your inventory and usage history will be permanently removed.';

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
            {/* Header */}
            <div className="border-b border-neutral-200 dark:border-darkSurface-border pb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-50 dark:bg-darkSurface-surface text-primary-700 dark:text-primary-400 rounded-xl flex items-center justify-center border border-primary-100 dark:border-darkSurface-border">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="font-display text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                            Account Settings
                        </h1>
                        <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm mt-0.5">
                            Manage your personal profile and account credentials.
                        </p>
                    </div>
                </div>
            </div>

            {/* Profile Information Summary */}
            <div className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-6 shadow-2xs space-y-4">
                <h3 className="font-display text-base font-semibold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                    {user?.role === 'dealer' ? <Store className="w-4 h-4 text-accent-600" /> : <User className="w-4 h-4 text-primary-600" />}
                    <span>Account Profile</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                    <div>
                        <span className="text-neutral-500 dark:text-neutral-400 block text-xs font-semibold uppercase tracking-wider mb-1">
                            Full Name
                        </span>
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">{user?.name}</p>
                    </div>
                    <div>
                        <span className="text-neutral-500 dark:text-neutral-400 block text-xs font-semibold uppercase tracking-wider mb-1">
                            Registered Email
                        </span>
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">{user?.email}</p>
                    </div>
                    <div>
                        <span className="text-neutral-500 dark:text-neutral-400 block text-xs font-semibold uppercase tracking-wider mb-1">
                            Account Role
                        </span>
                        <p className="font-medium text-neutral-900 dark:text-neutral-100 capitalize">{user?.role}</p>
                    </div>
                    <div>
                        <span className="text-neutral-500 dark:text-neutral-400 block text-xs font-semibold uppercase tracking-wider mb-1">
                            Contact Phone
                        </span>
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">{user?.phone || 'Not provided'}</p>
                    </div>
                </div>
            </div>

            {/* Danger Zone Card */}
            <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/60 rounded-2xl p-6 sm:p-8 space-y-4">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300 rounded-xl flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-display text-lg font-bold text-red-950 dark:text-red-200">
                            Danger Zone — Account Deletion
                        </h3>
                        <p className="text-xs sm:text-sm text-red-900/80 dark:text-red-300/80 leading-relaxed">
                            {roleSpecificExplanation}
                        </p>
                    </div>
                </div>

                <div className="pt-2 flex justify-start">
                    <button
                        type="button"
                        onClick={openModal}
                        className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-btn text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete My Account</span>
                    </button>
                </div>
            </div>

            {/* Accessible Confirmation Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                    <div
                        ref={modalRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="modal-title"
                        className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl max-w-md w-full p-6 shadow-xl space-y-5"
                    >
                        <div className="flex justify-between items-start gap-3">
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                <ShieldAlert className="w-5 h-5" />
                                <h3 id="modal-title" className="font-display text-lg font-bold text-neutral-900 dark:text-neutral-50">
                                    Permanently Delete Account
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={loading}
                                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 rounded-lg"
                                aria-label="Close dialog"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                            This action is <strong>irreversible</strong>. All your data will be permanently wiped.
                        </p>

                        {error && (
                            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-900 dark:text-red-200 text-xs">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleDeleteAccount} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                                    Type <span className="font-mono text-red-600 font-bold">DELETE</span> to confirm:
                                </label>
                                <input
                                    type="text"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    placeholder="DELETE"
                                    disabled={loading}
                                    className="w-full px-3.5 py-2.5 border border-neutral-300 dark:border-darkSurface-border rounded-btn bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100 text-xs font-mono focus:ring-2 focus:ring-red-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                                    Enter your account password:
                                </label>
                                <div className="relative">
                                    <input
                                        ref={passwordInputRef}
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        disabled={loading}
                                        className="w-full px-3.5 py-2.5 pl-9 border border-neutral-300 dark:border-darkSurface-border rounded-btn bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                                    />
                                    <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={loading}
                                    className="flex-1 py-2.5 bg-neutral-100 dark:bg-darkSurface-surface hover:bg-neutral-200 dark:hover:bg-darkSurface-hover text-neutral-700 dark:text-neutral-300 font-medium rounded-btn text-xs transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || confirmText !== 'DELETE' || !password}
                                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-btn text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                                >
                                    {loading ? 'Deleting...' : 'Permanently Delete'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
