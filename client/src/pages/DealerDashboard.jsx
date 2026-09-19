import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import api from '../api/axios';
import StockManager from '../components/StockManager';
import { Store, MapPin, Phone, FileText, CheckCircle2, AlertCircle, Save, Navigation, Check, XCircle, Power, Sun } from 'lucide-react';

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
    const [address, setAddress] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [position, setPosition] = useState([23.0225, 72.5714]); // default: Ahmedabad
    const [locating, setLocating] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    const loadExistingProfile = async () => {
        try {
            const res = await api.get('/dealers/me');
            if (res.data.dealer) {
                const d = res.data.dealer;
                setDealer(d);
                setDealerId(d._id);
                setStoreName(d.storeName);
                setAddress(d.address);
                setLicenseNumber(d.licenseNumber);
                setContactPhone(d.contactPhone || '');
                if (d.location?.coordinates) {
                    setPosition([d.location.coordinates[1], d.location.coordinates[0]]);
                }
            }
        } catch (err) {
            // Profile doesn't exist yet - user stays in Create Mode
        } finally {
            setPageLoading(false);
        }
    };

    useEffect(() => {
        loadExistingProfile();
    }, []);

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
        setSubmitting(true);

        const payload = {
            storeName,
            address,
            licenseNumber,
            contactPhone,
            latitude: position[0],
            longitude: position[1],
        };

        try {
            if (dealerId) {
                const res = await api.patch(`/dealers/${dealerId}`, payload);
                setDealer(res.data.dealer);
                setMessage('Store profile updated successfully!');
            } else {
                const res = await api.post('/dealers', payload);
                setDealer(res.data.dealer);
                setDealerId(res.data.dealer._id);
                setMessage('Store profile created successfully!');
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
            
            {/* Header */}
            <div>
                <h1 className="font-display text-2xl sm:text-3xl font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight">
                    Agri-Dealer Dashboard
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-1">
                    Manage daily store availability, license verification, and inventory catalog.
                </p>
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

            {/* Part 3: Daily Store Open / Close Status Card (FIRST thing dealer sees) */}
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
                                    ? `Your store is currently marked as open for today (${todayDateString}). Farmers can discover you in nearby searches.`
                                    : 'Your store is currently hidden from farmer geo-discovery. Open your store today so nearby farmers can find your stock.'}
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

            {/* Store Profile Card */}
            <div className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-6 sm:p-8 shadow-xs">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-100 dark:border-darkSurface-border">
                    <div className="w-10 h-10 bg-primary-50 dark:bg-darkSurface-surface text-primary-700 dark:text-primary-400 rounded-xl flex items-center justify-center flex-shrink-0 border border-primary-100 dark:border-darkSurface-border">
                        <Store className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="font-display text-xl font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight">
                            {dealerId ? 'Edit Store Profile' : 'Register Your Agri-Input Store'}
                        </h2>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                            Provide your registered license details and GPS coordinates for discovery by farmers.
                        </p>
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
                            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 uppercase tracking-wider">
                                License Number (CIB/FCO)
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="e.g. CIB-2024-99999"
                                    value={licenseNumber}
                                    onChange={(e) => setLicenseNumber(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-3.5 py-2.5 border border-neutral-300 dark:border-darkSurface-border rounded-btn bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 uppercase tracking-wider">
                                Full Store Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="e.g. Main Market Road, District Indore"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-3.5 py-2.5 border border-neutral-300 dark:border-darkSurface-border rounded-btn bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

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
                                    placeholder="e.g. 9876543210"
                                    value={contactPhone}
                                    onChange={(e) => setContactPhone(e.target.value)}
                                    className="w-full pl-10 pr-3.5 py-2.5 border border-neutral-300 dark:border-darkSurface-border rounded-btn bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Geolocation Map Picker */}
                    <div className="pt-2">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                                Set Store GPS Location Pin
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
                                    attribution='&copy; OpenStreetMap contributors'
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
                        <span>{submitting ? 'Saving...' : dealerId ? 'Update Store Profile' : 'Save Store Profile'}</span>
                    </button>

                </form>
            </div>

            {/* Embedded Stock Manager */}
            {dealerId && <StockManager dealerId={dealerId} />}

        </div>
    );
}