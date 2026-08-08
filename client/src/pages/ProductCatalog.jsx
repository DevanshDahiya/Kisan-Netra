import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Package, Search, Filter, AlertTriangle, ShieldCheck, Tag } from 'lucide-react';

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
            // quiet fail
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
        <div className="max-w-6xl mx-auto px-4 py-8">
            
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Package className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Product Catalog</h1>
                        <p className="text-slate-600 text-sm mt-0.5">Explore licensed chemicals, active ingredients, and crop application guidelines.</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-8">
                <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    
                    <div className="sm:col-span-4">
                        <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                            Search by Name
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Search className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="e.g. Roundup, Nativo, Urea"
                                className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-3">
                        <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                            Category
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all capitalize"
                        >
                            <option value="">All Categories</option>
                            {CATEGORIES.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div className="sm:col-span-3">
                        <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                            Crop Type
                        </label>
                        <input
                            type="text"
                            value={cropType}
                            onChange={(e) => setCropType(e.target.value)}
                            placeholder="e.g. cotton, wheat"
                            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <button
                            type="submit"
                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5 text-sm"
                        >
                            <Filter className="w-4 h-4" />
                            <span>Filter</span>
                        </button>
                    </div>

                </form>
            </div>

            {/* Catalog Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 animate-pulse">
                            <div className="h-5 bg-slate-200 rounded w-1/2 mb-3"></div>
                            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                        </div>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                    <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Package className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900">No matching products found</h4>
                    <p className="text-slate-500 text-sm mt-1">Try broadening your search term or clearing filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {products.map((p) => (
                        <div key={p._id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow flex flex-col justify-between">
                            
                            <div>
                                <div className="flex justify-between items-start gap-2 mb-2">
                                    <h3 className="font-extrabold text-slate-900 text-lg">{p.name}</h3>
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 capitalize border border-indigo-200">
                                        {p.category}
                                    </span>
                                </div>

                                {p.activeIngredient && (
                                    <p className="text-xs text-slate-600 mb-1">
                                        <span className="font-semibold text-slate-700">Active Ingredient:</span> {p.activeIngredient}
                                    </p>
                                )}

                                {p.manufacturer && (
                                    <p className="text-xs text-slate-500 mb-1">
                                        <span className="font-semibold text-slate-700">Manufacturer:</span> {p.manufacturer}
                                    </p>
                                )}

                                <p className="text-xs text-slate-400 font-mono mb-3">
                                    License: {p.licenseNumber}
                                </p>
                            </div>

                            <div>
                                {p.cropTypes?.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-100 mt-2">
                                        <Tag className="w-3.5 h-3.5 text-slate-400" />
                                        {p.cropTypes.map((crop) => (
                                            <span key={crop} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium capitalize">
                                                {crop}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {p.isBanned && (
                                    <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                                        <AlertTriangle className="w-4 h-4 text-red-600" />
                                        <span>Banned / Restricted Input</span>
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