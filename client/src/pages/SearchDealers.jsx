import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import api from '../api/axios';
import { Search, MapPin, Phone, Package, Navigation, AlertCircle, Store, Check, Clock, XCircle } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function SearchDealers() {
    const [myPosition, setMyPosition] = useState(null);
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [radius, setRadius] = useState(20);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [locating, setLocating] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            setLocating(false);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setMyPosition([pos.coords.latitude, pos.coords.longitude]);
                setLocating(false);
            },
            () => {
                setError('Could not get your location. Please enable location access and refresh.');
                setLocating(false);
            }
        );
    }, []);

    useEffect(() => {
        api.get('/products').then((res) => setProducts(res.data.products)).catch(() => {});
    }, []);

    const handleSearch = async () => {
        if (!myPosition) return;
        setLoading(true);
        setError('');
        try {
            const params = {
                lng: myPosition[1],
                lat: myPosition[0],
                radius,
            };
            if (selectedProduct) params.productId = selectedProduct;

            const res = await api.get('/dealers/nearby', { params });
            setResults(res.data.dealers);
        } catch (err) {
            setError('Search failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (myPosition) handleSearch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [myPosition]);

    if (locating) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                <div className="w-12 h-12 bg-primary-50 dark:bg-darkSurface-card text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary-200 dark:border-darkSurface-border animate-bounce">
                    <Navigation className="w-6 h-6" />
                </div>
                <h3 className="font-display text-xl font-semibold text-neutral-900 dark:text-neutral-50">Acquiring GPS Location...</h3>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">Locating verified agricultural input dealers in your area.</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
            
            {/* Header */}
            <div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-50 dark:bg-darkSurface-surface text-primary-700 dark:text-primary-400 rounded-xl flex items-center justify-center flex-shrink-0 border border-primary-100 dark:border-darkSurface-border">
                        <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight">
                            Find Nearby Dealers
                        </h1>
                        <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-0.5">
                            Locate verified agri-dealers within your radius, inspect store open/closed status, and verify stock.
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-accent-50 dark:bg-accent-950/40 border border-accent-200 dark:border-accent-800/60 text-accent-900 dark:text-accent-200 text-sm rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-accent-600 dark:text-accent-400 flex-shrink-0 mt-0.5" />
                    <p>{error}</p>
                </div>
            )}

            {/* Filter Bar */}
            <div className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-5 shadow-2xs">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    
                    <div className="sm:col-span-6">
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 uppercase tracking-wider">
                            Required Chemical / Fertilizer Filter
                        </label>
                        <select
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                            className="w-full px-3.5 py-2.5 border border-neutral-300 dark:border-darkSurface-border rounded-btn bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                        >
                            <option value="">Any Licensed Product in Stock</option>
                            {products.map((p) => (
                                <option key={p._id} value={p._id}>{p.name} ({p.category})</option>
                            ))}
                        </select>
                    </div>

                    <div className="sm:col-span-3">
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 uppercase tracking-wider">
                            Search Radius (km)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="500"
                            value={radius}
                            onChange={(e) => setRadius(e.target.value)}
                            className="w-full px-3.5 py-2.5 border border-neutral-300 dark:border-darkSurface-border rounded-btn bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all font-mono"
                        />
                    </div>

                    <div className="sm:col-span-3">
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="w-full py-2.5 bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-btn transition-colors shadow-2xs disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                        >
                            <Search className="w-4 h-4" />
                            <span>{loading ? 'Searching...' : 'Find Dealers'}</span>
                        </button>
                    </div>

                </div>
            </div>

            {/* Leaflet Map */}
            {myPosition && (
                <div className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-2 shadow-2xs">
                    <div className="h-80 sm:h-96 rounded-xl overflow-hidden">
                        <MapContainer center={myPosition} zoom={11} style={{ height: '100%', width: '100%' }}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; OpenStreetMap contributors'
                            />
                            <Marker position={myPosition}>
                                <Popup>
                                    <div className="text-center p-1">
                                        <strong className="text-primary-700">Your Current GPS Location</strong>
                                    </div>
                                </Popup>
                            </Marker>
                            {results.map((dealer) => (
                                <Marker
                                    key={dealer._id}
                                    position={[dealer.location.coordinates[1], dealer.location.coordinates[0]]}
                                >
                                    <Popup>
                                        <div className="p-1">
                                            <strong className="text-neutral-900 text-sm">{dealer.storeName}</strong>
                                            <p className="text-xs text-neutral-600 my-1">{dealer.address}</p>
                                            <div className="flex items-center gap-1.5 my-1">
                                                <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                                                    {dealer.distance != null ? (dealer.distance / 1000).toFixed(1) : 'N/A'} km away
                                                </span>
                                                {dealer.isOpenToday ? (
                                                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                                                        Open Today
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                                                        Closed Today
                                                    </span>
                                                )}
                                            </div>
                                            {dealer.stockInfo && (
                                                <p className="text-xs font-medium text-accent-700 mt-1">
                                                    In Stock: {dealer.stockInfo.quantityAvailable} {dealer.stockInfo.unit}
                                                </p>
                                            )}
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                </div>
            )}

            {/* Results Grid */}
            <div>
                <div className="mb-4 flex justify-between items-center">
                    <h3 className="font-display text-xl font-semibold text-neutral-900 dark:text-neutral-50">
                        Nearby Verified Stores ({results.length})
                    </h3>
                </div>

                {results.length === 0 ? (
                    <div className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-12 text-center">
                        <div className="w-12 h-12 bg-neutral-100 dark:bg-darkSurface-surface text-neutral-400 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <Store className="w-6 h-6" />
                        </div>
                        <h4 className="font-display text-base font-semibold text-neutral-900 dark:text-neutral-100">
                            No verified dealers found nearby
                        </h4>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1 max-w-md mx-auto">
                            Try expanding your search radius (e.g. 50 km) or clearing product filters to see agri-dealers.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {results.map((dealer) => (
                            <div key={dealer._id} className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start gap-2 mb-2">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-display font-semibold text-neutral-900 dark:text-neutral-50 text-base">{dealer.storeName}</h4>
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-50 dark:bg-primary-950/60 text-primary-800 dark:text-primary-300 border border-primary-200 dark:border-primary-800/60 flex items-center gap-1">
                                                    <Check className="w-3 h-3" /> Verified
                                                </span>
                                            </div>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{dealer.address}</p>
                                        </div>
                                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-darkSurface-surface text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-darkSurface-border flex-shrink-0">
                                            {dealer.distance != null ? (dealer.distance / 1000).toFixed(1) : 'N/A'} km
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3 mt-3 text-xs">
                                        {dealer.isOpenToday ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                                                <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                <span>Open Today</span>
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                                                <XCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                                <span>Closed Today</span>
                                            </span>
                                        )}
                                        {dealer.contactPhone && (
                                            <span className="text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                                                <Phone className="w-3.5 h-3.5 text-neutral-400" />
                                                <span>{dealer.contactPhone}</span>
                                            </span>
                                        )}
                                    </div>

                                    {dealer.stockInfo && (
                                        <div className="mt-3 bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800/60 text-primary-900 dark:text-primary-200 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2">
                                            <Package className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                            <span>In Stock: {dealer.stockInfo.quantityAvailable} {dealer.stockInfo.unit}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}