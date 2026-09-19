import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Package, Search, Filter, AlertTriangle, Tag } from 'lucide-react';

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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
            
            {/* Header */}
            <div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-50 dark:bg-darkSurface-surface text-primary-700 dark:text-primary-400 rounded-xl flex items-center justify-center flex-shrink-0 border border-primary-100 dark:border-darkSurface-border">
                        <Package className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight">
                            Agri-Product Catalog
                        </h1>
                        <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-0.5">
                            Browse official licensed chemical formulations, active ingredients, and crop application guidelines.
                        </p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-5 shadow-2xs">
                <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    
                    <div className="sm:col-span-4">
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 uppercase tracking-wider">
                            Search by Name
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                                <Search className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="e.g. Roundup, Nativo, Urea"
                                className="w-full pl-9 pr-3.5 py-2.5 border border-neutral-300 dark:border-darkSurface-border rounded-btn bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-3">
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 uppercase tracking-wider">
                            Category
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-3.5 py-2.5 border border-neutral-300 dark:border-darkSurface-border rounded-btn bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all capitalize"
                        >
                            <option value="">All Categories</option>
                            {CATEGORIES.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div className="sm:col-span-3">
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 uppercase tracking-wider">
                            Crop Type
                        </label>
                        <input
                            type="text"
                            value={cropType}
                            onChange={(e) => setCropType(e.target.value)}
                            placeholder="e.g. cotton, wheat"
                            className="w-full px-3.5 py-2.5 border border-neutral-300 dark:border-darkSurface-border rounded-btn bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <button
                            type="submit"
                            className="w-full py-2.5 bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-btn transition-colors shadow-2xs flex items-center justify-center gap-1.5 text-sm"
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
                        <div key={i} className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-5 animate-pulse">
                            <div className="h-5 bg-neutral-200 dark:bg-darkSurface-hover rounded w-1/2 mb-3"></div>
                            <div className="h-4 bg-neutral-200 dark:bg-darkSurface-hover rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-neutral-200 dark:bg-darkSurface-hover rounded w-2/3"></div>
                        </div>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-12 text-center">
                    <div className="w-12 h-12 bg-neutral-100 dark:bg-darkSurface-surface text-neutral-400 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Package className="w-6 h-6" />
                    </div>
                    <h4 className="font-display text-base font-semibold text-neutral-900 dark:text-neutral-100">No matching products found</h4>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">Try broadening your search term or clearing active filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {products.map((p) => (
                        <div key={p._id} className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-6 hover:shadow-md transition-shadow flex flex-col justify-between">
                            
                            <div>
                                <div className="flex justify-between items-start gap-2 mb-2">
                                    <h3 className="font-display font-semibold text-neutral-900 dark:text-neutral-50 text-lg">{p.name}</h3>
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-50 dark:bg-primary-950/60 text-primary-800 dark:text-primary-300 capitalize border border-primary-200/80 dark:border-primary-800/60">
                                        {p.category}
                                    </span>
                                </div>

                                {p.activeIngredient && (
                                    <p className="text-xs text-neutral-600 dark:text-neutral-300 mb-1">
                                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">Active Ingredient:</span> {p.activeIngredient}
                                    </p>
                                )}

                                {p.manufacturer && (
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                                        <span className="font-semibold text-neutral-700 dark:text-neutral-300">Manufacturer:</span> {p.manufacturer}
                                    </p>
                                )}

                                <p className="text-xs text-neutral-400 dark:text-neutral-500 font-mono mb-3">
                                    License: {p.licenseNumber}
                                </p>
                            </div>

                            <div>
                                {p.cropTypes?.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-neutral-100 dark:border-darkSurface-borderSubtle mt-2">
                                        <Tag className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
                                        {p.cropTypes.map((crop) => (
                                            <span key={crop} className="px-2 py-0.5 bg-neutral-100 dark:bg-darkSurface-surface text-neutral-700 dark:text-neutral-300 rounded text-[11px] font-medium capitalize border border-neutral-200/60 dark:border-darkSurface-borderSubtle">
                                                {crop}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {p.isBanned && (
                                    <div className="mt-3 bg-accent-50 dark:bg-accent-950/40 border border-accent-200 dark:border-accent-800/60 text-accent-900 dark:text-accent-300 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                                        <AlertTriangle className="w-4 h-4 text-accent-600" />
                                        <span>Banned / Restricted Input Warning</span>
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