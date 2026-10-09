import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import api from '../api/axios';
import StockManager from '../components/StockManager';
import {
    Store,
    MapPin,
    Phone,
    FileText,
    CheckCircle2,
    AlertCircle,
    Save,
    Navigation,
    Check,
    XCircle,
    Power,
    Sun,
    BookOpen,
    X,
    ShieldCheck,
    KeyRound,
    Send,
    Sparkles,
} from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });

    return position === null ? null : <Marker position={position} />;
}

export default function DealerDashboard() {
    const [dealer, setDealer] = useState(null);
    const [dealerId, setDealerId] = useState(null);
    const [storeName, setStoreName] = useState('');
    // Structured address fields
    const [addrLine1, setAddrLine1] = useState('');
    const [addrLine2, setAddrLine2] = useState('');
    const [addrCity, setAddrCity] = useState('');
    const [addrPincode, setAddrPincode] = useState('');
    const [addrState, setAddrState] = useState('Odisha');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [position, setPosition] = useState([20.2961, 85.8245]); // default: Odisha / Bhubaneswar
    const [locating, setLocating] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    // Feature 2: Dismissible Guide Banner
    const [showGuideBanner, setShowGuideBanner] = useState(() => {
        try {
            return localStorage.getItem('dismiss_dealer_guide_banner') !== 'true';
        } catch (e) {
            return true;
        }
    });

    // Feature 1: Registry Auto-fill & Verification
    const [registryMatched, setRegistryMatched] = useState(false);
    const [registryOtpSent, setRegistryOtpSent] = useState(false);
    const [registryOtp, setRegistryOtp] = useState('');
    const [registryVerifying, setRegistryVerifying] = useState(false);
    const [registrySending, setRegistrySending] = useState(false);
    const [registryCooldown, setRegistryCooldown] = useState(0);
    const [isRegistryVerified, setIsRegistryVerified] = useState(false);
    const [registryError, setRegistryError] = useState('');

    const dismissGuideBanner = () => {
        setShowGuideBanner(false);
        try {
            localStorage.setItem('dismiss_dealer_guide_banner', 'true');
        } catch (e) {}
    };

    // Build address string from structured fields
    const buildAddress = () => {
        const parts = [addrLine1, addrLine2, addrCity, addrPincode, addrState].filter(Boolean);
        return parts.join(', ');
    };

    // Parse stored address string back into structured fields (best-effort)
    const parseAddressIntoFields = (addr) => {
        if (!addr) return;
        // Try to extract pincode (6 digits)
        const pincodeMatch = addr.match(/\b(\d{6})\b/);
        if (pincodeMatch) setAddrPincode(pincodeMatch[1]);
        // Remove pincode and split remaining
        const withoutPin = addr.replace(/\b\d{6}\b/, '').replace(/,\s*,/g, ',').trim();
        const parts = withoutPin.split(',').map(s => s.trim()).filter(Boolean);
        if (parts.length >= 1) setAddrLine1(parts[0]);
        if (parts.length >= 2) setAddrLine2(parts[1]);
        if (parts.length >= 3) setAddrCity(parts[parts.length - 2] || '');
    };

    const loadExistingProfile = async () => {
        try {
            const res = await api.get('/dealers/me');
            if (res.data.dealer) {
                const d = res.data.dealer;
                setDealer(d);
                setDealerId(d._id);
                setStoreName(d.storeName);
                parseAddressIntoFields(d.address);
                setLicenseNumber(d.licenseNumber);
                setContactPhone(d.contactPhone || '');
                if (d.verificationSource === 'registry' || d.isVerified) {
                    setIsRegistryVerified(true);
                } else {
                    checkRegistry();
                }
                if (d.location?.coordinates) {
                    setPosition([d.location.coordinates[1], d.location.coordinates[0]]);
                }
            }
        } catch (err) {
            // Profile doesn't exist yet -> check for registry match
            checkRegistry();
        } finally {
            setPageLoading(false);
        }
    };

    const checkRegistry = async () => {
        try {
            const res = await api.get('/dealers/registry/match');
            if (res.data.matched && !res.data.isVerified) {
                setRegistryMatched(true);
            }
        } catch (err) {}
    };

    useEffect(() => {
        loadExistingProfile();
    }, []);

    // Cooldown countdown timer
    useEffect(() => {
        if (registryCooldown <= 0) return;
        const timer = setInterval(() => {
            setRegistryCooldown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [registryCooldown]);

    const handleSendRegistryOTP = async () => {
        setRegistrySending(true);
        setRegistryError('');
        try {
            await api.post('/dealers/registry/send-otp');
            setRegistryOtpSent(true);
            setRegistryCooldown(60);
            setMessage('A 6-digit verification code was sent to your registered email.');
        } catch (err) {
            setRegistryError(err.response?.data?.message || 'Failed to send verification code.');
        } finally {
            setRegistrySending(false);
        }
    };

    const handleVerifyRegistryOTP = async (e) => {
        e.preventDefault();
        if (!registryOtp) return;
        setRegistryVerifying(true);
        setRegistryError('');
        try {
            const res = await api.post('/dealers/registry/verify-otp', { otp: registryOtp });
            const prefill = res.data.prefill;
            if (prefill) {
                if (prefill.businessName) setStoreName(prefill.businessName);
                if (prefill.licenseNumber) setLicenseNumber(prefill.licenseNumber);
                if (prefill.address) {
                    // Store raw address from registry in Line 1; dealer can edit
                    setAddrLine1(prefill.address);
                    setAddrCity(prefill.district || '');
                    setAddrState('Odisha');
                }
                if (prefill.phone) setContactPhone(prefill.phone);
            }
            setIsRegistryVerified(true);
            setRegistryMatched(false);
            setMessage('Email verified against licensed registry! Your store details are auto-filled. Please complete the remaining fields and pin your location on the map.');
        } catch (err) {
            setRegistryError(err.response?.data?.message || 'Invalid or expired verification code.');
        } finally {
            setRegistryVerifying(false);
        }
    };

    const validatePhone = (val) => {
        if (!val) return ''; // optional field
        const digits = val.replace(/\D/g, '');
        if (digits.length !== 10) return 'Phone number must be exactly 10 digits.';
        if (!/^[6-9]\d{9}$/.test(digits)) return 'Enter a valid Indian mobile number starting with 6–9.';
        return '';
    };

    const handlePhoneChange = (val) => {
        setContactPhone(val);
        setPhoneError(validatePhone(val));
    };

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            return;
        }
        setLocating(true);
        setError('');
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setPosition([pos.coords.latitude, pos.coords.longitude]);
                setLocating(false);
            },
            () => {
                setError('Could not get your location.');
                setLocating(false);
            }
        );
    };

    const handleOpenToday = async () => {
        if (!dealerId) return;
        setStatusUpdating(true);
        setError('');
        setMessage('');
        try {
            const res = await api.patch(`/dealers/${dealerId}/open-today`);
            setDealer(res.data.dealer);
            setMessage('Your store is now marked as OPEN for today and visible to nearby farmers!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to open store for today.');
        } finally {
            setStatusUpdating(false);
        }
    };

    const handleCloseToday = async () => {
        if (!dealerId) return;
        setStatusUpdating(true);
        setError('');
        setMessage('');
        try {
            const res = await api.patch(`/dealers/${dealerId}/close-today`);
            setDealer(res.data.dealer);
            setMessage('Your store is now marked as CLOSED.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to close store.');
        } finally {
            setStatusUpdating(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        // Phone validation before submit
        const phoneErr = validatePhone(contactPhone);
        if (phoneErr) {
            setPhoneError(phoneErr);
            return;
        }

        setSubmitting(true);

        const fullAddress = buildAddress();
        const payload = {
            storeName,
            address: fullAddress,
            licenseNumber,
            contactPhone: contactPhone.replace(/\D/g, ''), // store digits only
            latitude: position[0],
            longitude: position[1],
        };

        try {
            if (dealerId) {
                const res = await api.patch(`/dealers/${dealerId}`, payload);
                setDealer(res.data.dealer);
                if (res.data.verification === 'registry' || res.data.dealer?.isVerified) {
                    setIsRegistryVerified(true);
                    setRegistryMatched(false);
                    setMessage('Your store is verified and live! You can now add products and prices.');
                } else {
                    setMessage('Store profile updated successfully!');
                }
            } else {
                const res = await api.post('/dealers', payload);
                setDealer(res.data.dealer);
                setDealerId(res.data.dealer._id);
                if (res.data.verification === 'registry' || res.data.dealer?.isVerified) {
                    setIsRegistryVerified(true);
                    setRegistryMatched(false);
                    setMessage('Your store is verified and live! You can now add products and prices.');
                } else {
                    setMessage('Submitted: an admin will review your store before it appears in search.');
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save store profile.');
        } finally {
            setSubmitting(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16 text-center text-neutral-500 dark:text-neutral-400">
                <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm">Loading store profile...</p>
            </div>
        );
    }

    const todayDateString = new Date().toISOString().slice(0, 10);
    const isOpenToday = Boolean(dealer?.isOpenToday && dealer?.lastOpenedDate === todayDateString);

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            {/* Guide Banner */}
            {showGuideBanner && (
                <div className="bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800/60 rounded-xl p-4 flex items-center justify-between gap-3 text-xs sm:text-sm text-primary-950 dark:text-primary-200 shadow-2xs">
                    <div className="flex items-center gap-2.5">
                        <BookOpen className="w-4 h-4 text-primary-700 dark:text-primary-400 flex-shrink-0" />
                        <span>
                            New here?{' '}
                            <Link to="/guide#dealer" className="font-semibold underline hover:text-primary-800 dark:hover:text-primary-300">
                                Read the Dealer Setup Guide
                            </Link>{' '}
                            to learn about store verification, pricing, and daily store status.
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={dismissGuideBanner}
                        className="text-primary-700 dark:text-primary-400 hover:text-primary-900 dark:hover:text-white p-1 rounded-md"
                        aria-label="Dismiss banner"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                    <h1 className="font-display text-2xl sm:text-3xl font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight">
                        Agri-Dealer Dashboard
                    </h1>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-1">
                        Manage daily store availability, license verification, pricing, and inventory.
                    </p>
                </div>
                {dealer && (
                    <div>
                        {dealer.isVerified ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{dealer.verificationSource === 'registry' ? 'Registry Verified' : 'Admin Verified'}</span>
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                                <span>Pending Admin Review</span>
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Notifications */}
            {error && (
                <div className="bg-accent-50 dark:bg-accent-950/40 border border-accent-200 dark:border-accent-800/60 text-accent-900 dark:text-accent-200 text-sm rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-accent-600 dark:text-accent-400 flex-shrink-0 mt-0.5" />
                    <p>{error}</p>
                </div>
            )}
            {message && (
                <div className="bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800/60 text-primary-900 dark:text-primary-200 text-sm rounded-xl p-4 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                    <p>{message}</p>
                </div>
            )}

            {/* Daily Store Open / Close Status Card */}
            {dealerId && (
                <div className={`rounded-2xl p-6 border transition-all duration-200 ${
                    isOpenToday
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/60'
                        : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800/60'
                }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2.5">
                                <span className={`font-display font-semibold text-lg ${
                                    isOpenToday ? 'text-emerald-950 dark:text-emerald-100' : 'text-amber-950 dark:text-amber-100'
                                }`}>
                                    Daily Store Status:
                                </span>
                                {isOpenToday ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-2xs">
                                        <Check className="w-3.5 h-3.5" /> Open Today
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-600 text-white shadow-2xs">
                                        <XCircle className="w-3.5 h-3.5" /> Closed — Not Opened Today
                                    </span>
                                )}
                            </div>
                            <p className={`text-xs sm:text-sm ${
                                isOpenToday ? 'text-emerald-800 dark:text-emerald-300' : 'text-amber-800 dark:text-amber-300'
                            }`}>
                                {isOpenToday
                                    ? `Your store is currently open for today (${todayDateString}). Farmers can discover your store and pricing in nearby search.`
                                    : 'Your store is currently hidden from farmer geo-discovery. Open your store today so nearby farmers can find your products.'}
                            </p>
                        </div>

                        <div className="flex-shrink-0">
                            {isOpenToday ? (
                                <button
                                    type="button"
                                    onClick={handleCloseToday}
                                    disabled={statusUpdating}
                                    className="px-4 py-2.5 bg-white dark:bg-darkSurface-card hover:bg-emerald-100 dark:hover:bg-darkSurface-hover text-emerald-900 dark:text-emerald-200 font-medium rounded-btn text-xs sm:text-sm transition-colors border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
                                >
                                    <Power className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                    <span>{statusUpdating ? 'Updating...' : 'Close Store Early'}</span>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleOpenToday}
                                    disabled={statusUpdating}
                                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-btn text-xs sm:text-sm transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                                >
                                    <Sun className="w-4 h-4" />
                                    <span>{statusUpdating ? 'Opening...' : 'Open My Store Today'}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Feature 1: Registry Auto-Fill Banner */}
            {registryMatched && !isRegistryVerified && (
                <div className="bg-primary-900 text-white rounded-2xl p-6 sm:p-7 shadow-md space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-primary-800 rounded-xl flex items-center justify-center flex-shrink-0 border border-primary-700">
                            <Sparkles className="w-5 h-5 text-accent-400" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-display text-base sm:text-lg font-bold">
                                Official Licensed Dealer Record Found!
                            </h3>
                            <p className="text-xs sm:text-sm text-primary-200 leading-relaxed">
                                We found a licensed-dealer record linked to your email in the state registry. Verify your email with a one-time code to fill in your store details automatically and verify your store instantly.
                            </p>
                        </div>
                    </div>

                    {registryError && (
                        <div className="p-3 rounded-xl bg-red-900/80 border border-red-700 text-red-200 text-xs">
                            {registryError}
                        </div>
                    )}

                    {!registryOtpSent ? (
                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={handleSendRegistryOTP}
                                disabled={registrySending || registryCooldown > 0}
                                className="px-5 py-2.5 bg-accent-600 hover:bg-accent-700 text-white font-semibold rounded-btn text-xs sm:text-sm transition-colors shadow-xs flex items-center gap-2 disabled:opacity-50"
                            >
                                <Send className="w-4 h-4" />
                                <span>{registrySending ? 'Sending Code...' : registryCooldown > 0 ? `Resend Code in ${registryCooldown}s` : 'Send Verification Code'}</span>
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleVerifyRegistryOTP} className="flex flex-col sm:flex-row items-end gap-3 pt-2">
                            <div className="w-full sm:w-60">
                                <label className="block text-xs text-primary-200 font-semibold mb-1">
                                    Enter 6-Digit Code:
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        maxLength="6"
                                        placeholder="123456"
                                        value={registryOtp}
                                        onChange={(e) => setRegistryOtp(e.target.value)}
                                        className="w-full px-3.5 py-2.5 pl-9 rounded-btn bg-primary-800 border border-primary-700 text-white text-sm font-mono tracking-widest focus:ring-2 focus:ring-accent-400 focus:outline-none"
                                    />
                                    <KeyRound className="w-4 h-4 text-primary-400 absolute left-3 top-3" />
                                </div>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button
                                    type="submit"
                                    disabled={registryVerifying || registryOtp.length < 6}
                                    className="px-5 py-2.5 bg-accent-600 hover:bg-accent-700 text-white font-semibold rounded-btn text-xs sm:text-sm transition-colors shadow-xs disabled:opacity-50"
                                >
                                    {registryVerifying ? 'Verifying...' : 'Verify Code'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSendRegistryOTP}
                                    disabled={registrySending || registryCooldown > 0}
                                    className="px-3.5 py-2.5 bg-primary-800 hover:bg-primary-700 text-primary-200 rounded-btn text-xs transition-colors disabled:opacity-50"
                                >
                                    {registryCooldown > 0 ? `${registryCooldown}s` : 'Resend'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {/* Store Profile Card */}
            <div className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-6 sm:p-8 shadow-xs">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-100 dark:border-darkSurface-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-50 dark:bg-darkSurface-surface text-primary-700 dark:text-primary-400 rounded-xl flex items-center justify-center flex-shrink-0 border border-primary-100 dark:border-darkSurface-border">
                            <Store className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="font-display text-xl font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight">
                                    {dealerId ? 'Store Profile Settings' : 'Register Your Agri-Input Store'}
                                </h2>
                                {isRegistryVerified && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-100 text-primary-800 dark:bg-primary-950/80 dark:text-primary-300 border border-primary-300 dark:border-primary-800 flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3 text-primary-600" /> Registry Verified
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                                {!dealerId && !isRegistryVerified
                                    ? 'Your store will be reviewed by an admin before it appears in search.'
                                    : 'Provide your registered license details and pin GPS coordinates for discovery by farmers.'}
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 uppercase tracking-wider">
                                Store Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                                    <Store className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="e.g. Kisan Krishi Seva Kendra"
                                    value={storeName}
                                    onChange={(e) => setStoreName(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-3.5 py-2.5 border border-neutral-300 dark:border-darkSurface-border rounded-btn bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                                    License Number (CIB/FCO)
                                </label>
                                {isRegistryVerified && (
                                    <span className="text-[11px] text-neutral-400 font-medium italic">
                                        Verified (Locked)
                                    </span>
                                )}
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="e.g. CIB-2024-99999"
                                    value={licenseNumber}
                                    onChange={(e) => setLicenseNumber(e.target.value)}
                                    readOnly={isRegistryVerified}
                                    required
                                    className={`w-full pl-10 pr-3.5 py-2.5 border border-neutral-300 dark:border-darkSurface-border rounded-btn text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all ${
                                        isRegistryVerified
                                            ? 'bg-neutral-100 dark:bg-darkSurface-card text-neutral-600 dark:text-neutral-400 cursor-not-allowed'
                                            : 'bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100'
                                    }`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Structured Address */}
                    <div className="space-y-3">
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                            Store Address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                                <MapPin className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                placeholder="Address Line 1 (Shop No., Street, Locality)*"
                                value={addrLine1}
                                onChange={(e) => setAddrLine1(e.target.value)}
                                required
                                className="w-full pl-10 pr-3.5 py-2.5 border border-neutral-300 dark:border-darkSurface-border rounded-btn bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                            />
                        </div>
                        <input
                            type="text"
                            placeholder="Address Line 2 (Block, GP, Village — optional)"
                            value={addrLine2}
                            onChange={(e) => setAddrLine2(e.target.value)}
                            className="w-full px-3.5 py-2.5 border border-neutral-300 dark:border-darkSurface-border rounded-btn bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                        />
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <input
                                type="text"
                                placeholder="City / Town*"
                                value={addrCity}
                                onChange={(e) => setAddrCity(e.target.value)}
                                required
                                className="w-full px-3.5 py-2.5 border border-neutral-300 dark:border-darkSurface-border rounded-btn bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                            />
                            <input
                                type="text"
                                placeholder="Pincode*"
                                value={addrPincode}
                                onChange={(e) => setAddrPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                required
                                maxLength={6}
                                pattern="\d{6}"
                                className="w-full px-3.5 py-2.5 border border-neutral-300 dark:border-darkSurface-border rounded-btn bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                            />
                            <input
                                type="text"
                                placeholder="State"
                                value={addrState}
                                onChange={(e) => setAddrState(e.target.value)}
                                className="w-full px-3.5 py-2.5 border border-neutral-300 dark:border-darkSurface-border rounded-btn bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all col-span-2 sm:col-span-1"
                            />
                        </div>
                    </div>

                    {/* Contact Phone with Validation */}
                    <div>
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 uppercase tracking-wider">
                            Contact Phone
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                                <Phone className="w-4 h-4" />
                            </div>
                            <input
                                type="tel"
                                placeholder="10-digit Indian mobile (e.g. 9876543210)"
                                value={contactPhone}
                                onChange={(e) => handlePhoneChange(e.target.value)}
                                maxLength={10}
                                className={`w-full pl-10 pr-3.5 py-2.5 border rounded-btn text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100 ${
                                    phoneError
                                        ? 'border-red-400 dark:border-red-600 focus:ring-red-400'
                                        : 'border-neutral-300 dark:border-darkSurface-border focus:ring-primary-600'
                                }`}
                            />
                        </div>
                        {phoneError && (
                            <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                {phoneError}
                            </p>
                        )}
                    </div>

                    {/* Geolocation Map Picker */}
                    <div className="pt-2">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                                Pin Store Location on Map *
                            </label>
                            <button
                                type="button"
                                onClick={handleUseCurrentLocation}
                                disabled={locating}
                                className="px-3 py-1.5 bg-neutral-100 dark:bg-darkSurface-surface hover:bg-neutral-200 dark:hover:bg-darkSurface-hover text-neutral-800 dark:text-neutral-200 text-xs font-medium rounded-btn transition-colors flex items-center gap-1.5 border border-neutral-200 dark:border-darkSurface-border"
                            >
                                <Navigation className="w-3.5 h-3.5 text-accent-600" />
                                <span>{locating ? 'Locating...' : 'Use current location'}</span>
                            </button>
                        </div>

                        <div className="h-64 rounded-xl overflow-hidden border border-neutral-300 dark:border-darkSurface-border shadow-inner">
                            <MapContainer
                                center={position}
                                zoom={13}
                                style={{ height: '100%', width: '100%' }}
                                key={position.join(',')}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution="&copy; OpenStreetMap contributors"
                                />
                                <LocationMarker position={position} setPosition={setPosition} />
                            </MapContainer>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 font-mono">
                            Coordinates: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{position[0].toFixed(5)}°N, {position[1].toFixed(5)}°E</span>
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-btn transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 text-sm mt-4"
                    >
                        <Save className="w-4 h-4" />
                        <span>{submitting ? 'Saving...' : dealerId ? 'Update Store Profile' : 'Save & Publish Store Profile'}</span>
                    </button>
                </form>
            </div>

            {/* Embedded Stock Manager */}
            {dealerId && <StockManager dealerId={dealerId} />}
        </div>
    );
}