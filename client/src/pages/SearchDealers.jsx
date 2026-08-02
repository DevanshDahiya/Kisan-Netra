import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import api from '../api/axios';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function SearchDealers() {
    const [myPosition, setMyPosition] = useState(null); // [lat, lng]
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [radius, setRadius] = useState(20);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [locating, setLocating] = useState(true);
    const [error, setError] = useState('');

    // Get farmer's location on page load
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

    // Load product catalog for the filter dropdown
    useEffect(() => {
        api.get('/products').then((res) => setProducts(res.data.products));
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

    // Run an initial search once we have a location
    useEffect(() => {
        if (myPosition) handleSearch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [myPosition]);

    if (locating) {
        return <div className="text-center mt-16">Getting your location...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto mt-10 px-4">
            <h2 className="text-2xl font-semibold text-green-800 mb-4">Find Nearby Dealers</h2>

            {error && <div className="bg-red-100 text-red-700 text-sm rounded px-3 py-2 mb-4">{error}</div>}

            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex gap-3 flex-wrap items-end">
                <div className="flex-1 min-w-[180px]">
                    <label className="text-xs text-gray-500 block mb-1">Product (optional)</label>
                    <select
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 w-full"
                    >
                        <option value="">Any product</option>
                        {products.map((p) => (
                            <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                    </select>
                </div>
                <div className="w-32">
                    <label className="text-xs text-gray-500 block mb-1">Radius (km)</label>
                    <input
                        type="number"
                        min="1"
                        value={radius}
                        onChange={(e) => setRadius(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 w-full"
                    />
                </div>
                <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="bg-green-700 text-white rounded px-4 py-2 hover:bg-green-800 transition disabled:opacity-50"
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>

            {myPosition && (
                <div className="h-72 rounded overflow-hidden border border-gray-300 mb-6">
                    <MapContainer center={myPosition} zoom={11} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; OpenStreetMap contributors'
                        />
                        <Marker position={myPosition}>
                            <Popup>You are here</Popup>
                        </Marker>
                        {results.map((dealer) => (
                            <Marker
                                key={dealer._id}
                                position={[dealer.location.coordinates[1], dealer.location.coordinates[0]]}
                            >
                                <Popup>
                                    <strong>{dealer.storeName}</strong>
                                    <br />
                                    {dealer.address}
                                    <br />
                                    {dealer.distance != null ? (dealer.distance / 1000).toFixed(1) : 'N/A'} km away
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            )}

            {results.length === 0 ? (
                <p className="text-gray-500 text-center">No dealers found in this radius.</p>
            ) : (
                <div className="flex flex-col gap-3">
                    {results.map((dealer) => (
                        <div key={dealer._id} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-gray-800">{dealer.storeName}</p>
                                <p className="text-sm text-gray-500">{dealer.address}</p>
                                {dealer.contactPhone && (
                                    <p className="text-xs text-gray-400">📞 {dealer.contactPhone}</p>
                                )}
                            </div>
                            <span className="text-sm font-medium text-green-700">
                                {dealer.distance != null ? (dealer.distance / 1000).toFixed(1) : 'N/A'} km
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}