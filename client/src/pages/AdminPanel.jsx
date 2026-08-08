import { useState, useEffect } from 'react';
import api from '../api/axios';
import { ShieldCheck, Clock, CheckCircle2, AlertCircle, Building2, User, Mail, FileText, Check } from 'lucide-react';

export default function AdminPanel() {
    const [pending, setPending] = useState([]);
    const [verified, setVerified] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const loadData = async () => {
        setLoading(true);
        try {
            const [pendingRes, verifiedRes] = await Promise.all([
                api.get('/admin/dealers/pending'),
                api.get('/admin/dealers/verified'),
            ]);
            setPending(pendingRes.data.dealers);
            setVerified(verifiedRes.data.dealers);
        } catch (err) {
            setError('Failed to load dealer data.');
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

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-12 text-center text-slate-500">
                Loading admin verification dashboard...
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center flex-shrink-0">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Approval Panel</h1>
                        <p className="text-slate-600 text-sm mt-0.5">Review dealer store applications, inspect government license credentials, and approve verified sellers.</p>
                    </div>
                </div>
            </div>

            {/* Notifications */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 mb-6 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p>{error}</p>
                </div>
            )}
            {message && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl p-4 mb-6 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <p>{message}</p>
                </div>
            )}

            {/* Section 1: Pending Verification */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-amber-600" />
                        <span>Pending Verification ({pending.length})</span>
                    </h2>
                    {pending.length > 0 && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Requires Action
                        </span>
                    )}
                </div>

                {pending.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                        <h4 className="font-bold text-slate-900 text-sm">All pending registrations processed</h4>
                        <p className="text-xs text-slate-500 mt-0.5">No new dealer store profiles waiting for approval.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {pending.map((dealer) => (
                            <div key={dealer._id} className="bg-amber-50/50 border border-amber-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-amber-700" />
                                        <h3 className="font-extrabold text-slate-900 text-lg">{dealer.storeName}</h3>
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
                                            Pending
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600">{dealer.address}</p>
                                    <p className="text-xs text-slate-700 font-mono font-semibold">
                                        License Number: <span className="text-amber-900">{dealer.licenseNumber}</span>
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
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
                                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5 text-sm flex-shrink-0"
                                >
                                    <Check className="w-4 h-4" />
                                    <span>Approve & Verify</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Section 2: Verified Stores */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        <span>Verified Active Stores ({verified.length})</span>
                    </h2>
                </div>

                {verified.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
                        No verified stores yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {verified.map((dealer) => (
                            <div key={dealer._id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-slate-900 text-base">{dealer.storeName}</h4>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                            <Check className="w-3 h-3" /> Verified
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500">{dealer.address}</p>
                                    <p className="text-xs text-slate-400 font-mono mt-2">
                                        License: {dealer.licenseNumber}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}