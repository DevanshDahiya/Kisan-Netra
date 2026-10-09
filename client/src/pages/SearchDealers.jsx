import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import api from '../api/axios';
import { getGoogleMapsUrl } from '../utils/maps';
import {
    Search,
    MapPin,
    Phone,
    Package,
    Navigation,
    AlertCircle,
    Store,
    Check,
    Clock,
    XCircle,
    SlidersHorizontal,
    Tag,
    IndianRupee,
    Sparkles,
    ExternalLink,
} from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Format currency in Indian Rupees
const currencyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
});

function formatPriceUpdated(dateString) {
    if (!dateString) return null;
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Price updated today';
    if (diffDays === 1) return 'Price updated 1 day ago';
    return `Price updated ${diffDays} days ago`;
}

export default function SearchDealers() {
    const [myPosition, setMyPosition] = useState(null);
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [radius, setRadius] = useState(20);
    const [sortMode, setSortMode] = useState('best');
    const [results, setResults] = useState([]);
    const [meta, setMeta] = useState({ sort: 'best', primaryUnit: null });
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
        api.get('/products').then((res) => setProducts(res.data.products || [])).catch(() => {});
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
                sort: sortMode,
            };
            if (selectedProduct) params.productId = selectedProduct;

            const res = await api.get('/dealers/nearby', { params });
            setResults(res.data.dealers || []);
            setMeta(res.data.meta || { sort: sortMode, primaryUnit: null });
        } catch (err) {
            setError('Search failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (myPosition) handleSearch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [myPosition, sortMode]);

    // Compute price summary
    const getPriceSummary = () => {
        if (!selectedProduct || !meta.primaryUnit) return null;
        const comparablePriced = results.filter(
            (d) =>
                d.stockInfo &&
                d.stockInfo.unit === meta.primaryUnit &&
                typeof d.stockInfo.price === 'number' &&
                Number.isFinite(d.stockInfo.price)
        );
        if (comparablePriced.length === 0) return null;

        const prices = comparablePriced.map((d) => d.stockInfo.price);
        const minP = Math.min(...prices);
        const maxP = Math.max(...prices);

        if (minP === maxP) {
            return `Prices fixed at ${currencyFormatter.format(minP)} per ${meta.primaryUnit} across ${comparablePriced.length} store${comparablePriced.length > 1 ? 's' : ''}`;
        }

        return `Prices from ${currencyFormatter.format(minP)} to ${currencyFormatter.format(maxP)} per ${meta.primaryUnit} across ${comparablePriced.length} comparable store${comparablePriced.length > 1 ? 's' : ''}`;
    };

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

    const priceSummary = getPriceSummary();

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
                            Locate verified agri-dealers within your radius, inspect store open/closed status, compare pricing, and get directions.
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
            <div className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-5 shadow-2xs space-y-4">
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
                                <option key={p._id} value={p._id}>
                                    {p.name} ({p.category})
                                </option>
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

                {/* Smart Ranking Mode & Summary */}
                {selectedProduct ? (
                    <div className="pt-3 border-t border-neutral-100 dark:border-darkSurface-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                                <SlidersHorizontal className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                                <span>Sort:</span>
                            </span>
                            <div className="inline-flex rounded-lg bg-neutral-100 dark:bg-darkSurface-surface p-0.5 border border-neutral-200 dark:border-darkSurface-border">
                                <button
                                    type="button"
                                    onClick={() => setSortMode('best')}
                                    className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                                        sortMode === 'best'
                                            ? 'bg-white dark:bg-darkSurface-card text-primary-800 dark:text-primary-300 shadow-2xs font-semibold'
                                            : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                                    }`}
                                >
                                    Best Match
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSortMode('price')}
                                    className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                                        sortMode === 'price'
                                            ? 'bg-white dark:bg-darkSurface-card text-primary-800 dark:text-primary-300 shadow-2xs font-semibold'
                                            : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                                    }`}
                                >
                                    Lowest Price
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSortMode('distance')}
                                    className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                                        sortMode === 'distance'
                                            ? 'bg-white dark:bg-darkSurface-card text-primary-800 dark:text-primary-300 shadow-2xs font-semibold'
                                            : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                                    }`}
                                >
                                    Nearest
                                </button>
                            </div>
                        </div>

                        {priceSummary && (
                            <span className="font-medium text-primary-800 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800/60 px-3 py-1 rounded-full">
                                {priceSummary}
                            </span>
                        )}
                    </div>
                ) : (
                    <div className="pt-2 border-t border-neutral-100 dark:border-darkSurface-border text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-accent-600 dark:text-accent-400" />
                        <span>Select a product to compare store prices and see smart rankings.</span>
                    </div>
                )}
            </div>

            {/* Leaflet Map */}
            {myPosition && (
                <div className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-2 shadow-2xs">
                    <div className="h-80 sm:h-96 rounded-xl overflow-hidden">
                        <MapContainer center={myPosition} zoom={11} style={{ height: '100%', width: '100%' }}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution="&copy; OpenStreetMap contributors"
                            />
                            <Marker position={myPosition}>
                                <Popup>
                                    <div className="text-center p-1">
                                        <strong className="text-primary-700">Your Current GPS Location</strong>
                                    </div>
                                </Popup>
                            </Marker>
                            {results.map((dealer) => {
                                const mapsUrl = getGoogleMapsUrl(dealer);
                                return (
                                    <Marker
                                        key={dealer._id}
                                        position={[dealer.location.coordinates[1], dealer.location.coordinates[0]]}
                                    >
                                        <Popup>
                                            <div className="p-1 space-y-1">
                                                <strong className="text-neutral-900 text-sm block">{dealer.storeName}</strong>
                                                <p className="text-xs text-neutral-600">{dealer.address}</p>
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

                                                {selectedProduct && dealer.stockInfo && (
                                                    <p className="text-xs font-semibold text-accent-700">
                                                        {dealer.stockInfo.price != null
                                                            ? `${currencyFormatter.format(dealer.stockInfo.price)} / ${dealer.stockInfo.unit}`
                                                            : 'Price not listed'}
                                                    </p>
                                                )}

                                                {mapsUrl && (
                                                    <div className="pt-2 border-t border-neutral-200 mt-2">
                                                        <a
                                                            href={mapsUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            aria-label={`Open ${dealer.storeName} in Google Maps`}
                                                            title="Open in Google Maps"
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded text-xs font-semibold transition-colors w-full justify-center"
                                                        >
                                                            <Navigation className="w-3.5 h-3.5" />
                                                            <span>Get Directions</span>
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </Popup>
                                    </Marker>
                                );
                            })}
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
                        {results.map((dealer) => {
                            const mapsUrl = getGoogleMapsUrl(dealer);
                            const isLowestPrice = dealer.badges?.includes('lowest_price');
                            const isNearest = dealer.badges?.includes('nearest');
                            const priceUpdatedText = dealer.stockInfo?.priceUpdatedAt
                                ? formatPriceUpdated(dealer.stockInfo.priceUpdatedAt)
                                : null;

                            return (
                                <div
                                    key={dealer._id}
                                    className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                                >
                                    <div>
                                        <div className="flex justify-between items-start gap-2 mb-2">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {dealer.rank && selectedProduct && (
                                                        <span className="w-5 h-5 rounded-full bg-neutral-100 dark:bg-darkSurface-surface text-neutral-700 dark:text-neutral-300 text-[10px] font-bold flex items-center justify-center border border-neutral-300 dark:border-darkSurface-border">
                                                            #{dealer.rank}
                                                        </span>
                                                    )}
                                                    <h4 className="font-display font-semibold text-neutral-900 dark:text-neutral-50 text-base">
                                                        {dealer.storeName}
                                                    </h4>
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

                                        {/* Badges */}
                                        {(isLowestPrice || isNearest) && (
                                            <div className="flex flex-wrap items-center gap-1.5 my-2">
                                                {isLowestPrice && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800">
                                                        <Tag className="w-3 h-3" /> Lowest Price
                                                    </span>
                                                )}
                                                {isNearest && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-900 dark:bg-indigo-950/80 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-800">
                                                        <MapPin className="w-3 h-3" /> Nearest Store
                                                    </span>
                                                )}
                                            </div>
                                        )}

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

                                        {/* Stock & Pricing Details */}
                                        {selectedProduct && dealer.stockInfo && (
                                            <div className="mt-3 bg-neutral-50 dark:bg-darkSurface-surface border border-neutral-200 dark:border-darkSurface-border rounded-xl p-3 space-y-1.5 text-xs">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                                                        <Package className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                                                        <span>In Stock:</span>
                                                        <strong className="text-neutral-900 dark:text-neutral-100">
                                                            {dealer.stockInfo.quantityAvailable} {dealer.stockInfo.unit}
                                                        </strong>
                                                    </span>

                                                    {dealer.stockInfo.price != null ? (
                                                        <div className="text-right">
                                                            <span className="text-sm font-bold text-primary-800 dark:text-primary-300 font-display">
                                                                {currencyFormatter.format(dealer.stockInfo.price)}
                                                            </span>
                                                            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                                                                {' '}/ {dealer.stockInfo.unit}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-neutral-400 italic text-[11px]">Price not listed</span>
                                                    )}
                                                </div>

                                                {dealer.stockInfo.price != null && meta.primaryUnit && dealer.stockInfo.unit !== meta.primaryUnit && (
                                                    <p className="text-[11px] text-amber-700 dark:text-amber-400">
                                                        Priced per {dealer.stockInfo.unit} (other unit)
                                                    </p>
                                                )}

                                                {priceUpdatedText && (
                                                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
                                                        {priceUpdatedText}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    {mapsUrl && (
                                        <div className="pt-2 border-t border-neutral-100 dark:border-darkSurface-border flex justify-end">
                                            <a
                                                href={mapsUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={`Open ${dealer.storeName} in Google Maps`}
                                                title="Open in Google Maps"
                                                className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-primary-50 dark:bg-darkSurface-surface hover:bg-primary-100 dark:hover:bg-darkSurface-hover text-primary-800 dark:text-primary-300 font-semibold rounded-btn text-xs border border-primary-200 dark:border-darkSurface-border transition-colors shadow-2xs"
                                            >
                                                <Navigation className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                                                <span>Open in Maps</span>
                                                <ExternalLink className="w-3 h-3 text-neutral-400" />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}