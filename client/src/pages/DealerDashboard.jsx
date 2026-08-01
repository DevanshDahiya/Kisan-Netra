import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import api from '../api/axios';

// if leafLet's  default marker icon (a common gotcha with bundlers like vite)
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
    return position ? <Marker position={position} /> : null;
}

export default function DealerDashboard() {
    const [storeName, setStoreName] = useState('');
    const [address, setAddress] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [position, setPosition] = useState([23.0225, 72.5714]); // default: Ahmedabad
    const [locating, setLocating] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [dealerId, setDealerId] = useState(null);
    const [pageLoading, setPageLoading] = useState(true);

    // omn mount , check if this dealer already has a profile - if so , load it for editing 
    useEffect(() => {
        const loadExistingProfile = async () => {
            try {
                const res = await api.get('/dealers/me');
                const dealer = res.data.dealer;
                setDealerId(dealer._id);
                setStoreName(dealer.storeName);
                setAddress(dealer.address);
                setLicenseNumber(dealer.licenseNumber);
                setContactPhone(dealer.contactPhone || '');
                // dealer.location.coordinates is [lng, lat] - Leaflet wants [lat, lng]
                setPosition([dealer.location.coordinates[1], dealer.location.coordinates[0]]);
            } catch (err) {
                // 404 just means no profile yet - that's fine, stay in create mode
            } finally {
                setPageLoading(false);
            }
        };
        loadExistingProfile();
    }, []);





    // Uses the browsers'  Geolocation API to jump the pin to the dealer's current location 
    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            return;
        }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setPosition([pos.coords.latitude, pos.coords.longitude]);
                setLocating(false);
            },
            () => {
                setError('Could not get your location. Please place the pin manually.');
                setLocating(false);
            }
        );
    };

    // Handles form submission to save dealer info 
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
                // edit mode - update existing profile 
                const res = await api.patch(`/dealers/${dealerId}`, payload);
                setMessage('Store profile updated successfully!');
            }
            else {
                // create mode - first time profile creation 
                const res = await api.post('/dealers', payload);
                setDealerId(res.data.dealer._id); // switch into edit mode form now on 
                setMessage('Store profile created successfully!');
            }
        }
        catch (err) {
            setError(err.response?.data?.message || 'Failed to create store profile');
        }
        finally {
            setSubmitting(false);
        }
    };

    if (pageLoading) {
        return <div className='text-center mt-16'>Loading your store profile...</div>
    }

    return (
        <div className="max-w-2xl mx-auto mt-10 bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-green-800 mb-6">
                {dealerId ? 'Edit Your Store Profile' : 'Create Your Store Profile'}
            </h2>

            {error && <div className="bg-red-100 text-red-700 text-sm rounded px-3 py-2 mb-4">{error}</div>}
            {message && <div className="bg-green-100 text-green-700 text-sm rounded px-3 py-2 mb-4">{message}</div>}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    type="text"
                    placeholder="Store Name"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    required
                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                />
                <input
                    type="text"
                    placeholder="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                />
                <input
                    type="text"
                    placeholder="License Number"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    required
                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                />
                <input
                    type="tel"
                    placeholder="Contact Phone"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                />

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm text-gray-600">
                            Click the map to set your store location, or:
                        </label>
                        <button
                            type="button"
                            onClick={handleUseCurrentLocation}
                            disabled={locating}
                            className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded hover:bg-green-200 transition disabled:opacity-50"
                        >
                            {locating ? 'Locating...' : 'Use my current location'}
                        </button>
                    </div>

                    <div className="h-64 rounded overflow-hidden border border-gray-300">
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
                    <p className="text-xs text-gray-500 mt-1">
                        Pin: {position[0].toFixed(5)}, {position[1].toFixed(5)}
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="bg-green-700 text-white rounded py-2 hover:bg-green-800 transition disabled:opacity-50"
                >
                    {submitting ? 'Saving...' : dealerId ? 'Update Store Profile' : 'Save Store Profile'}
                </button>
            </form>
        </div>
    );

}