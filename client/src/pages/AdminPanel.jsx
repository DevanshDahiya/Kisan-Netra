import { useState, useEffect } from 'react';
import api from '../api/axios';
import { ShieldCheck, Clock, CheckCircle2, AlertCircle, Building2, User, Mail, FileText, Check, Package, Trash2, Tag, AlertTriangle, XCircle, MessageSquare, RefreshCw } from 'lucide-react';

export default function AdminPanel() {
    const [pending, setPending] = useState([]);
    const [verified, setVerified] = useState([]);
    const [products, setProducts] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [productActionLoading, setProductActionLoading] = useState(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [pendingRes, verifiedRes, productsRes, feedbackRes] = await Promise.all([
                api.get('/admin/dealers/pending'),
                api.get('/admin/dealers/verified'),
                api.get('/products'),
                api.get('/feedback'),
            ]);
            setPending(pendingRes.data.dealers);
            setVerified(verifiedRes.data.dealers);
            setProducts(productsRes.data.products);
            setFeedbacks(feedbackRes.data.feedbacks || []);
        } catch (err) {
            setError('Failed to load admin dashboard data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleApprove = async (dealerId) => {
        setError('');
        setMessage('');
        try {
            await api.patch(`/dealers/${dealerId}/verify`);
            setMessage('Dealer store approved and verified successfully!');
            loadData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to approve dealer.');
        }
    };

    const handleUnverify = async (dealerId, storeName) => {
        if (!confirm(`Are you sure you want to revoke verification for "${storeName}"?`)) return;
        setError('');
        setMessage('');
        try {
            await api.patch(`/dealers/${dealerId}/unverify`);
            setMessage(`Verification for "${storeName}" has been revoked.`);
            loadData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to unverify dealer.');
        }
    };

    const handleUpdateFeedbackStatus = async (feedbackId, currentStatus) => {
        const nextStatus = currentStatus === 'pending' ? 'reviewed' : currentStatus === 'reviewed' ? 'resolved' : 'pending';
        setError('');
        try {
            await api.patch(`/feedback/${feedbackId}/status`, { status: nextStatus });
            setMessage(`Feedback status updated to ${nextStatus}.`);
            loadData();
        } catch (err) {
            setError('Failed to update feedback status.');
        }
    };

    const handleDeleteProduct = async (productId, productName) => {
        if (!confirm(`Are you sure you want to delete "${productName}" from the catalog?`)) {
            return;
        }

        setError('');
        setMessage('');
        setProductActionLoading(productId);

        try {
            const res = await api.delete(`/products/${productId}`);
            setMessage(res.data.message || `Product "${productName}" deleted successfully.`);
            loadData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete product from catalog.');
        } finally {
            setProductActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-16 text-center text-neutral-500 dark:text-neutral-400">
                <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm">Loading admin dashboard...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
            
            {/* Header */}
            <div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-50 dark:bg-darkSurface-surface text-primary-700 dark:text-primary-400 rounded-xl flex items-center justify-center flex-shrink-0 border border-primary-100 dark:border-darkSurface-border">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight">
                            Admin Control Panel
                        </h1>
                        <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-0.5">
                            Inspect dealer licenses, approve sellers, review user concerns, and manage catalog.
                        </p>
                    </div>
                </div>
            </div>

            {/* Notifications */}
            {error && (
                <div className="bg-accent-50 dark:bg-accent-950/40 border border-accent-200 dark:border-accent-800/60 text-accent-900 dark:text-accent-200 text-sm rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-accent-600 dark:text-accent-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-xs uppercase tracking-wider text-accent-900 dark:text-accent-200">Notice</h4>
                        <p className="mt-0.5">{error}</p>
                    </div>
                </div>
            )}
            {message && (
                <div className="bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800/60 text-primary-900 dark:text-primary-200 text-sm rounded-xl p-4 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                    <p>{message}</p>
                </div>
            )}

            {/* Section 1: Pending Dealer Verification */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-xl font-semibold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                        <span>Pending Dealer Verifications ({pending.length})</span>
                    </h2>
                    {pending.length > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-50 dark:bg-accent-950/60 text-accent-800 dark:text-accent-300 border border-accent-200 dark:border-accent-800/60">
                            Action Needed
                        </span>
                    )}
                </div>

                {pending.length === 0 ? (
                    <div className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-8 text-center text-neutral-500 dark:text-neutral-400">
                        <CheckCircle2 className="w-8 h-8 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
                        <h4 className="font-semibold text-neutral-900 dark:text-neutral-50 text-sm">All pending registrations verified</h4>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">No new dealer store profiles currently waiting for approval.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {pending.map((dealer) => (
                            <div key={dealer._id} className="bg-white dark:bg-darkSurface-card border border-accent-200/80 dark:border-accent-800/50 rounded-2xl p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-accent-600 dark:text-accent-400" />
                                        <h3 className="font-display font-semibold text-neutral-900 dark:text-neutral-50 text-lg">{dealer.storeName}</h3>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent-50 dark:bg-accent-950/60 text-accent-800 dark:text-accent-300 border border-accent-200 dark:border-accent-800/50 uppercase tracking-wider">
                                            Pending
                                        </span>
                                    </div>
                                    <p className="text-xs text-neutral-600 dark:text-neutral-400">{dealer.address}</p>
                                    <p className="text-xs text-neutral-800 dark:text-neutral-200 font-mono font-medium">
                                        License: <span className="text-accent-800 dark:text-accent-400 font-semibold">{dealer.licenseNumber}</span>
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400 pt-1">
                                        <span className="flex items-center gap-1">
                                            <User className="w-3.5 h-3.5" /> {dealer.user?.name}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Mail className="w-3.5 h-3.5" /> {dealer.user?.email}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleApprove(dealer._id)}
                                    className="px-4 py-2.5 bg-primary-700 hover:bg-primary-800 text-white font-medium rounded-btn transition-colors shadow-2xs flex items-center justify-center gap-1.5 text-xs sm:text-sm flex-shrink-0"
                                >
                                    <Check className="w-4 h-4" />
                                    <span>Approve & Verify</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Section 2: Verified Active Stores */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-xl font-semibold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        <span>Verified Active Stores ({verified.length})</span>
                    </h2>
                </div>

                {verified.length === 0 ? (
                    <div className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-8 text-center text-neutral-500 dark:text-neutral-400">
                        No verified stores yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {verified.map((dealer) => (
                            <div key={dealer._id} className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-5 shadow-2xs flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-semibold text-neutral-900 dark:text-neutral-50 text-base">{dealer.storeName}</h4>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-50 dark:bg-primary-950/60 text-primary-800 dark:text-primary-300 border border-primary-200 dark:border-primary-800/60 flex items-center gap-1">
                                            <Check className="w-3 h-3" /> Verified
                                        </span>
                                    </div>
                                    <p className="text-xs text-neutral-600 dark:text-neutral-400">{dealer.address}</p>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono mt-2">
                                        License: {dealer.licenseNumber}
                                    </p>
                                </div>

                                <button
                                    onClick={() => handleUnverify(dealer._id, dealer.storeName)}
                                    className="px-3 py-1.5 bg-neutral-50 dark:bg-darkSurface-surface hover:bg-red-50 dark:hover:bg-red-950/40 text-neutral-600 dark:text-neutral-300 hover:text-status-danger border border-neutral-200 dark:border-darkSurface-border hover:border-red-300 rounded-btn text-xs font-medium transition-colors flex items-center gap-1 shrink-0"
                                    title="Revoke dealer verification status"
                                >
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span>Unverify</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Section 3: Farmer & Dealer Concerns / Feedback */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="font-display text-xl font-semibold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                            <span>Farmer & Dealer Feedback ({feedbacks.length})</span>
                        </h2>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                            Review support requests, complaints, and feature feedback submitted by platform users.
                        </p>
                    </div>
                </div>

                {feedbacks.length === 0 ? (
                    <div className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-8 text-center text-neutral-500 dark:text-neutral-400">
                        No feedback items submitted yet.
                    </div>
                ) : (
                    <div className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl overflow-hidden shadow-2xs">
                        <div className="divide-y divide-neutral-100 dark:divide-darkSurface-borderSubtle">
                            {feedbacks.map((fb) => (
                                <div key={fb._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/50 dark:hover:bg-darkSurface-hover/40 transition-colors">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-neutral-100 dark:bg-darkSurface-surface text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-darkSurface-border">
                                                {fb.type}
                                            </span>
                                            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">{fb.subject}</h4>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                                                fb.status === 'resolved'
                                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200'
                                                    : fb.status === 'reviewed'
                                                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200'
                                                    : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200'
                                            }`}>
                                                {fb.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">{fb.message}</p>
                                        <div className="flex items-center gap-3 text-[11px] text-neutral-400 dark:text-neutral-500 pt-1">
                                            <span>User: <strong className="text-neutral-600 dark:text-neutral-300">{fb.user?.name || 'Guest/Anonymous'}</strong> ({fb.user?.email || 'N/A'})</span>
                                            <span>Role: <strong className="capitalize text-neutral-600 dark:text-neutral-300">{fb.user?.role || 'User'}</strong></span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleUpdateFeedbackStatus(fb._id, fb.status)}
                                        className="px-3 py-1.5 bg-neutral-50 dark:bg-darkSurface-surface hover:bg-neutral-100 dark:hover:bg-darkSurface-hover text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-darkSurface-border rounded-btn text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-center"
                                        title="Change feedback status"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5 text-primary-600" />
                                        <span>Status: {fb.status}</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Section 4: Product Catalog Management (Spec Part 4) */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="font-display text-xl font-semibold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                            <Package className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            <span>Product Catalog Management ({products.length})</span>
                        </h2>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                            Admin-gated deletion. Deletion is blocked if a product is actively tracked in dealer stocks or farmer inventories.
                        </p>
                    </div>
                </div>

                {products.length === 0 ? (
                    <div className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-8 text-center text-neutral-500 dark:text-neutral-400">
                        No products in catalog.
                    </div>
                ) : (
                    <div className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl overflow-hidden shadow-2xs">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-neutral-50 dark:bg-darkSurface-surface border-b border-neutral-200 dark:border-darkSurface-border text-neutral-600 dark:text-neutral-400 font-semibold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-5 py-3">Product Name</th>
                                        <th className="px-4 py-3">Category</th>
                                        <th className="px-4 py-3">Active Ingredient / Details</th>
                                        <th className="px-4 py-3">License No.</th>
                                        <th className="px-5 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-darkSurface-borderSubtle">
                                    {products.map((p) => (
                                        <tr key={p._id} className="hover:bg-neutral-50/60 dark:hover:bg-darkSurface-hover/40 transition-colors">
                                            <td className="px-5 py-3.5">
                                                <div className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                                                    {p.name}
                                                </div>
                                                {p.manufacturer && (
                                                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                                                        {p.manufacturer}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-neutral-100 dark:bg-darkSurface-surface text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-darkSurface-border capitalize">
                                                    {p.category}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-neutral-600 dark:text-neutral-400">
                                                <span>{p.activeIngredient || '—'}</span>
                                                {p.isBanned && (
                                                    <span className="ml-2 inline-flex items-center gap-1 text-accent-700 dark:text-accent-400 font-semibold text-[10px]">
                                                        <AlertTriangle className="w-3 h-3" /> Restricted
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 font-mono text-neutral-600 dark:text-neutral-400">
                                                {p.licenseNumber || '—'}
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <button
                                                    onClick={() => handleDeleteProduct(p._id, p.name)}
                                                    disabled={productActionLoading === p._id}
                                                    className="px-3 py-1.5 bg-neutral-50 dark:bg-darkSurface-surface hover:bg-accent-50 dark:hover:bg-accent-950/40 text-neutral-600 dark:text-neutral-300 hover:text-accent-700 dark:hover:text-accent-300 font-medium rounded-btn text-xs border border-neutral-200 dark:border-darkSurface-border hover:border-accent-300 dark:hover:border-accent-700 transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
                                                    title="Delete product from catalog"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    <span>{productActionLoading === p._id ? 'Deleting...' : 'Delete'}</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}