import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import api from '../api/axios';
import { Search, MapPin, Phone, Package, Navigation, Filter, AlertCircle, Store } from 'lucide-react';

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
            <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mx-auto mb-3 animate-bounce">
                    <Navigation className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Acquiring GPS Location...</h3>
                <p className="text-slate-500 text-sm mt-1">Finding authorized agri-input dealers near you.</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Find Nearby Dealers</h1>
                        <p className="text-slate-600 text-sm mt-0.5">Locate verified agri-dealers within your geographic radius stocking genuine inputs.</p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 mb-6 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p>{error}</p>
                </div>
            )}

            {/* Filter Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    
                    <div className="sm:col-span-6">
                        <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                            Required Product Filter (Optional)
                        </label>
                        <select
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        >
                            <option value="">Any Licensed Product</option>
                            {products.map((p) => (
                                <option key={p._id} value={p._id}>{p.name} ({p.category})</option>
                            ))}
                        </select>
                    </div>

                    <div className="sm:col-span-3">
                        <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                            Search Radius (km)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="500"
                            value={radius}
                            onChange={(e) => setRadius(e.target.value)}
                            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-mono"
                        />
                    </div>

                    <div className="sm:col-span-3">
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5 text-sm"
                        >
                            <Search className="w-4 h-4" />
                            <span>{loading ? 'Searching...' : 'Find Dealers'}</span>
                        </button>
                    </div>

                </div>
            </div>

            {/* Leaflet Map */}
            {myPosition && (
                <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm mb-8">
                    <div className="h-80 rounded-xl overflow-hidden">
                        <MapContainer center={myPosition} zoom={11} style={{ height: '100%', width: '100%' }}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; OpenStreetMap contributors'
                            />
                            <Marker position={myPosition}>
                                <Popup>
                                    <div className="text-center p-1">
                                        <strong className="text-emerald-700">Your Current Location</strong>
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
                                            <strong className="text-slate-900 text-sm">{dealer.storeName}</strong>
                                            <p className="text-xs text-slate-600 my-1">{dealer.address}</p>
                                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                                {dealer.distance != null ? (dealer.distance / 1000).toFixed(1) : 'N/A'} km away
                                            </span>
                                            {dealer.stockInfo && (
                                                <p className="text-xs font-medium text-indigo-700 mt-1">
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
            <div className="mb-4 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900">
                    Nearby Verified Stores ({results.length})
                </h3>
            </div>

            {results.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                    <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Store className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900">No verified dealers found in this radius</h4>
                    <p className="text-slate-500 text-sm mt-1">Try expanding your radius (e.g. 50 km) or selecting "Any Product".</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {results.map((dealer) => (
                        <div key={dealer._id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start gap-2 mb-2">
                                    <div>
                                        <h4 className="font-extrabold text-slate-900 text-base">{dealer.storeName}</h4>
                                        <p className="text-xs text-slate-500 mt-0.5">{dealer.address}</p>
                                    </div>
                                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex-shrink-0">
                                        {dealer.distance != null ? (dealer.distance / 1000).toFixed(1) : 'N/A'} km
                                    </span>
                                </div>

                                {dealer.contactPhone && (
                                    <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-2">
                                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                                        <span>{dealer.contactPhone}</span>
                                    </p>
                                )}

                                {dealer.stockInfo && (
                                    <div className="mt-3 bg-emerald-50 border border-emerald-200 text-emerald-900 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2">
                                        <Package className="w-4 h-4 text-emerald-600" />
                                        <span>In Stock: {dealer.stockInfo.quantityAvailable} {dealer.stockInfo.unit}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}