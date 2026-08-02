import { useState, useEffect } from 'react';
import api from '../api/axios';

const CATEGORIES = ['pesticide', 'fertilizer', 'fungicide', 'herbicide'];

export default function ProductCatalog() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [cropType, setCropType] = useState('');
    const [loading, setLoading] = useState(true);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const params = {};
            if (search) params.search = search;
            if (category) params.category = category;
            if (cropType) params.cropType = cropType;
            const res = await api.get('/products', { params });
            setProducts(res.data.products);
        } catch (err) {
            // fail quietly here - catalog browsing isn't critical path
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        loadProducts();
    };

    return (
        <div className="max-w-4xl mx-auto mt-10 px-4">
            <h2 className="text-2xl font-semibold text-green-800 mb-4">Product Catalog</h2>

            <form onSubmit={handleFilterSubmit} className="bg-white p-4 rounded-lg shadow-sm mb-6 flex gap-3 flex-wrap items-end">
                <div className="flex-1 min-w-[180px]">
                    <label className="text-xs text-gray-500 block mb-1">Search by name</label>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="e.g. Roundup"
                        className="border border-gray-300 rounded px-3 py-2 w-full"
                    />
                </div>
                <div className="w-40">
                    <label className="text-xs text-gray-500 block mb-1">Category</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 w-full"
                    >
                        <option value="">All</option>
                        {CATEGORIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
                <div className="w-40">
                    <label className="text-xs text-gray-500 block mb-1">Crop type</label>
                    <input
                        type="text"
                        value={cropType}
                        onChange={(e) => setCropType(e.target.value)}
                        placeholder="e.g. cotton"
                        className="border border-gray-300 rounded px-3 py-2 w-full"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-green-700 text-white rounded px-4 py-2 hover:bg-green-800 transition"
                >
                    Filter
                </button>
            </form>

            {loading ? (
                <p className="text-gray-500 text-center">Loading catalog...</p>
            ) : products.length === 0 ? (
                <p className="text-gray-500 text-center">No products match your filters.</p>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                    {products.map((p) => (
                        <div key={p._id} className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="flex justify-between items-start">
                                <p className="font-semibold text-gray-800">{p.name}</p>
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded capitalize">
                                    {p.category}
                                </span>
                            </div>
                            {p.activeIngredient && (
                                <p className="text-sm text-gray-500 mt-1">Active ingredient: {p.activeIngredient}</p>
                            )}
                            {p.manufacturer && (
                                <p className="text-xs text-gray-400">Manufacturer: {p.manufacturer}</p>
                            )}
                            <p className="text-xs text-gray-400">License: {p.licenseNumber}</p>
                            {p.cropTypes?.length > 0 && (
                                <p className="text-xs text-gray-400 mt-1">
                                    Crops: {p.cropTypes.join(', ')}
                                </p>
                            )}
                            {p.isBanned && (
                                <p className="text-xs text-red-600 font-semibold mt-1">⚠️ Banned</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}