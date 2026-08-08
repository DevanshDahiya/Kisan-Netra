import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import api from '../api/axios';
import StockManager from '../components/StockManager';
import { Store, MapPin, Phone, FileText, CheckCircle2, AlertCircle, Save, Navigation } from 'lucide-react';

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
    const [pageLoading, setPageLoading] = useState(true);

    useEffect(() => {
        const loadExistingProfile = async () => {
            try {
                const res = await api.get('/dealers/me');
                if (res.data.dealer) {
                    const d = res.data.dealer;
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
                await api.patch(`/dealers/${dealerId}`, payload);
                setMessage('Store profile updated successfully!');
            } else {
                const res = await api.post('/dealers', payload);
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
            <div className="max-w-4xl mx-auto px-4 py-12 text-center text-slate-500">
                Loading store profile...
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            
            {/* Store Profile Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Store className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                            {dealerId ? 'Edit Store Profile' : 'Register Your Agri-Input Store'}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Provide your registered license details and GPS location to allow farmers to discover your store.
                        </p>
                    </div>
                </div>

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

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                                Store Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Store className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="e.g. Kisan Krishi Seva Kendra"
                                    value={storeName}
                                    onChange={(e) => setStoreName(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                                License Number (CIB/FCO)
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="e.g. CIB-2024-99999"
                                    value={licenseNumber}
                                    onChange={(e) => setLicenseNumber(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                                Full Store Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="e.g. Main Market Road, District Indore"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                                Contact Phone
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <input
                                    type="tel"
                                    placeholder="e.g. 9876543210"
                                    value={contactPhone}
                                    onChange={(e) => setContactPhone(e.target.value)}
                                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Geolocation Map Picker */}
                    <div className="pt-2">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                Set Store Map Location Pin
                            </label>
                            <button
                                type="button"
                                onClick={handleUseCurrentLocation}
                                disabled={locating}
                                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                            >
                                <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{locating ? 'Locating...' : 'Use current location'}</span>
                            </button>
                        </div>

                        <div className="h-64 rounded-xl overflow-hidden border border-slate-300 shadow-inner">
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
                        <p className="text-xs text-slate-500 mt-1.5 font-mono">
                            Pin Coordinates: <span className="font-semibold text-slate-800">{position[0].toFixed(5)}°N, {position[1].toFixed(5)}°E</span>
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 text-sm mt-4"
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