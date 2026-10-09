import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Package, Plus, Trash2, AlertCircle, CheckCircle2, FilePlus, IndianRupee, AlertTriangle, TrendingUp } from 'lucide-react';

export default function StockManager({ dealerId }) {
    const [stock, setStock] = useState([]);
    const [products, setProducts] = useState([]);
    const [analytics, setAnalytics] = useState({
        totalProducts: 0,
        totalInventoryValue: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantityAvailable, setQuantityAvailable] = useState('');
    const [price, setPrice] = useState('');
    const [minimumStockThreshold, setMinimumStockThreshold] = useState('10');
    const [unit, setUnit] = useState('liters');
    const [addingStock, setAddingStock] = useState(false);

    // Suggest new product form state
    const [showSuggestForm, setShowSuggestForm] = useState(false);
    const [newProductName, setNewProductName] = useState('');
    const [newProductCategory, setNewProductCategory] = useState('pesticide');
    const [newProductLicense, setNewProductLicense] = useState('');
    const [newProductActiveIngredient, setNewProductActiveIngredient] = useState('');
    const [newProductManufacturer, setNewProductManufacturer] = useState('');
    const [newProductCropTypes, setNewProductCropTypes] = useState('');
    const [newProductRegistrationExpiry, setNewProductRegistrationExpiry] = useState('');
    const [suggestMessage, setSuggestMessage] = useState('');

    const loadData = async () => {
        try {
            const [stockRes, productsRes, analyticsRes] = await Promise.all([
                api.get(`/dealers/${dealerId}/stock`),
                api.get('/products'),
                api.get('/dealers/analytics').catch(() => ({ data: null })),
            ]);
            setStock(stockRes.data.stock || []);
            setProducts(productsRes.data.products || []);
            if (analyticsRes.data) {
                setAnalytics(analyticsRes.data);
            }
        } catch (err) {
            setError('Failed to load stock data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dealerId]);

    const handleAddStock = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setAddingStock(true);
        try {
            await api.post(`/dealers/${dealerId}/stock`, {
                product: selectedProduct,
                quantityAvailable: Number(quantityAvailable),
                price: price ? Number(price) : 0,
                minimumStockThreshold: minimumStockThreshold ? Number(minimumStockThreshold) : 10,
                unit,
            });
            setSelectedProduct('');
            setQuantityAvailable('');
            setPrice('');
            setMinimumStockThreshold('10');
            setSuccessMsg('Product added to your store stock!');
            loadData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add product to your stock.');
        } finally {
            setAddingStock(false);
        }
    };

    const handleUpdateStockItem = async (stockId, fields) => {
        setError('');
        setSuccessMsg('');
        try {
            await api.patch(`/dealers/${dealerId}/stock/${stockId}`, fields);
            setSuccessMsg('Stock updated successfully.');
            loadData();
        } catch (err) {
            setError('Failed to update stock details.');
        }
    };

    const handleRemove = async (stockId) => {
        if (!confirm('Remove this product from your store listing?')) return;
        setError('');
        setSuccessMsg('');
        try {
            await api.delete(`/dealers/${dealerId}/stock/${stockId}`);
            setSuccessMsg('Product removed from store inventory.');
            loadData();
        } catch (err) {
            setError('Failed to remove product.');
        }
    };

    const handleAddNewProduct = async (e) => {
        e.preventDefault();
        setError('');
        setSuggestMessage('');
        try {
            const cropTypesArray = newProductCropTypes
                ? newProductCropTypes.split(',').map((s) => s.trim()).filter(Boolean)
                : [];

            await api.post('/products', {
                name: newProductName,
                category: newProductCategory,
                licenseNumber: newProductLicense,
                activeIngredient: newProductActiveIngredient,
                manufacturer: newProductManufacturer,
                cropTypes: cropTypesArray,
                registrationExpiry: newProductRegistrationExpiry ? new Date(newProductRegistrationExpiry) : undefined,
            });
            setSuggestMessage('New product added to catalog and live immediately!');
            setNewProductName('');
            setNewProductLicense('');
            setNewProductActiveIngredient('');
            setNewProductManufacturer('');
            setNewProductCropTypes('');
            setNewProductRegistrationExpiry('');
            setShowSuggestForm(false);
            loadData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add product.');
        }
    };

    const stockedProductIds = new Set(stock.map((s) => s.product?._id));
    const availableToAdd = products.filter((p) => !stockedProductIds.has(p._id));

    if (loading) return <p className="text-center text-neutral-500 dark:text-neutral-400 py-6 text-sm">Loading store inventory...</p>;

    return (
        <div className="space-y-6">
            
            {/* Analytics Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-5 shadow-2xs flex items-center gap-4">
                    <div className="w-11 h-11 bg-primary-50 dark:bg-darkSurface-surface text-primary-700 dark:text-primary-400 rounded-xl flex items-center justify-center flex-shrink-0 border border-primary-100 dark:border-darkSurface-border">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Total Stock Value</span>
                        <h3 className="font-display text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
                            ₹{analytics.totalInventoryValue.toLocaleString()}
                        </h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-5 shadow-2xs flex items-center gap-4">
                    <div className="w-11 h-11 bg-primary-50 dark:bg-darkSurface-surface text-primary-700 dark:text-primary-400 rounded-xl flex items-center justify-center flex-shrink-0 border border-primary-100 dark:border-darkSurface-border">
                        <Package className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Stocked Products</span>
                        <h3 className="font-display text-2xl font-semibold text-neutral-900 dark:text-neutral-50">{analytics.totalProducts}</h3>
                    </div>
                </div>

                <div className={`rounded-2xl p-5 shadow-2xs flex items-center gap-4 border ${
                    analytics.lowStockCount > 0
                        ? 'bg-accent-50/80 dark:bg-accent-950/40 border-accent-200 dark:border-accent-800/60 text-accent-900 dark:text-accent-200'
                        : 'bg-white dark:bg-darkSurface-card border-neutral-200 dark:border-darkSurface-border text-neutral-900 dark:text-neutral-50'
                }`}>
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        analytics.lowStockCount > 0
                            ? 'bg-accent-100 dark:bg-accent-900/60 text-accent-700 dark:text-accent-300'
                            : 'bg-neutral-100 dark:bg-darkSurface-surface text-neutral-500 dark:text-neutral-400'
                    }`}>
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Low Stock Alerts</span>
                        <h3 className="font-display text-2xl font-semibold">{analytics.lowStockCount}</h3>
                    </div>
                </div>
            </div>

            {/* Main Manager Container */}
            <div className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-6 sm:p-8 shadow-xs">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-display text-xl font-semibold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                            <Package className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            <span>Manage Store Stock & Pricing</span>
                        </h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                            Set product pricing, stock quantities, and minimum thresholds for automated inventory alerts.
                        </p>
                    </div>
                </div>

                {/* Notifications */}
                {error && (
                    <div className="bg-accent-50 dark:bg-accent-950/40 border border-accent-200 dark:border-accent-800/60 text-accent-900 dark:text-accent-200 text-sm rounded-xl p-4 mb-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-accent-600 dark:text-accent-400 flex-shrink-0 mt-0.5" />
                        <p>{error}</p>
                    </div>
                )}
                {successMsg && (
                    <div className="bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800/60 text-primary-900 dark:text-primary-200 text-sm rounded-xl p-4 mb-4 flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                        <p>{successMsg}</p>
                    </div>
                )}

                {/* Form: Add Stock */}
                <form onSubmit={handleAddStock} className="bg-neutral-50 dark:bg-darkSurface-surface border border-neutral-200 dark:border-darkSurface-border rounded-xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    <div className="sm:col-span-4">
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 uppercase tracking-wider">
                            Catalog Product
                        </label>
                        <select
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                            required
                            className="w-full px-3.5 py-2.5 border border-neutral-300 dark:border-darkSurface-border rounded-btn bg-white dark:bg-darkSurface-card text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                        >
                            <option value="">Select a product to stock...</option>
                            {availableToAdd.map((p) => (
                                <option key={p._id} value={p._id}>
                                    {p.name} ({p.category})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 uppercase tracking-wider">
                            Qty
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.1"
                            placeholder="50"
                            value={quantityAvailable}
                            onChange={(e) => setQuantityAvailable(e.target.value)}
                            required
                            className="w-full px-3.5 py-2.5 border border-neutral-300 dark:border-darkSurface-border rounded-btn bg-white dark:bg-darkSurface-card text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 uppercase tracking-wider">
                            Unit
                        </label>
                        <select
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            className="w-full px-3.5 py-2.5 border border-neutral-300 dark:border-darkSurface-border rounded-btn bg-white dark:bg-darkSurface-card text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                        >
                            <option value="liters">Liters</option>
                            <option value="kg">Kg</option>
                            <option value="packets">Packets</option>
                        </select>
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 uppercase tracking-wider">
                            Price (₹)
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="1"
                            placeholder="e.g. 450"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full px-3.5 py-2.5 border border-neutral-300 dark:border-darkSurface-border rounded-btn bg-white dark:bg-darkSurface-card text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                        />
                    </div>

                    <div className="sm:col-span-2 flex gap-2">
                        <button
                            type="submit"
                            disabled={addingStock}
                            className="w-full py-2.5 bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-btn transition-colors shadow-2xs disabled:opacity-50 flex items-center justify-center gap-1 text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            <span>{addingStock ? '...' : 'Add'}</span>
                        </button>
                    </div>
                </form>

                {/* Toggle Add New Catalog Product */}
                <div className="mb-6">
                    <button
                        type="button"
                        onClick={() => setShowSuggestForm(!showSuggestForm)}
                        className="text-xs font-semibold text-accent-700 dark:text-accent-400 hover:text-accent-800 dark:hover:text-accent-300 flex items-center gap-1 hover:underline"
                    >
                        <FilePlus className="w-4 h-4" />
                        <span>{showSuggestForm ? 'Close Product Registration Form' : "Can't find your chemical product in the list? Add new catalog product"}</span>
                    </button>

                    {suggestMessage && (
                        <div className="bg-primary-50 dark:bg-primary-950/40 text-primary-800 dark:text-primary-300 text-xs rounded-xl p-3 mt-2 border border-primary-200 dark:border-primary-800/60">
                            {suggestMessage}
                        </div>
                    )}

                    {showSuggestForm && (
                        <form onSubmit={handleAddNewProduct} className="mt-3 bg-neutral-50 dark:bg-darkSurface-surface border border-neutral-200 dark:border-darkSurface-border rounded-xl p-5 space-y-4">
                            <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 border-b border-neutral-200 dark:border-darkSurface-border pb-2">
                                Add Detailed Product Information
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 uppercase tracking-wider">Product Name *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Coragen"
                                        value={newProductName}
                                        onChange={(e) => setNewProductName(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 border border-neutral-300 dark:border-darkSurface-border rounded-btn text-xs bg-white dark:bg-darkSurface-card text-neutral-900 dark:text-neutral-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 uppercase tracking-wider">Category *</label>
                                    <select
                                        value={newProductCategory}
                                        onChange={(e) => setNewProductCategory(e.target.value)}
                                        className="w-full px-3 py-2 border border-neutral-300 dark:border-darkSurface-border rounded-btn text-xs bg-white dark:bg-darkSurface-card text-neutral-900 dark:text-neutral-100 capitalize"
                                    >
                                        <option value="pesticide">Pesticide</option>
                                        <option value="fertilizer">Fertilizer</option>
                                        <option value="fungicide">Fungicide</option>
                                        <option value="herbicide">Herbicide</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 uppercase tracking-wider">CIB / FCO License No. *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. CIB-REG-10023"
                                        value={newProductLicense}
                                        onChange={(e) => setNewProductLicense(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 border border-neutral-300 dark:border-darkSurface-border rounded-btn text-xs bg-white dark:bg-darkSurface-card text-neutral-900 dark:text-neutral-100 font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 uppercase tracking-wider">Active Ingredient</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Chlorantraniliprole 18.5% SC"
                                        value={newProductActiveIngredient}
                                        onChange={(e) => setNewProductActiveIngredient(e.target.value)}
                                        className="w-full px-3 py-2 border border-neutral-300 dark:border-darkSurface-border rounded-btn text-xs bg-white dark:bg-darkSurface-card text-neutral-900 dark:text-neutral-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 uppercase tracking-wider">Manufacturer</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. FMC Corporation"
                                        value={newProductManufacturer}
                                        onChange={(e) => setNewProductManufacturer(e.target.value)}
                                        className="w-full px-3 py-2 border border-neutral-300 dark:border-darkSurface-border rounded-btn text-xs bg-white dark:bg-darkSurface-card text-neutral-900 dark:text-neutral-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 uppercase tracking-wider">Registration Expiry Date</label>
                                    <input
                                        type="date"
                                        value={newProductRegistrationExpiry}
                                        onChange={(e) => setNewProductRegistrationExpiry(e.target.value)}
                                        className="w-full px-3 py-2 border border-neutral-300 dark:border-darkSurface-border rounded-btn text-xs bg-white dark:bg-darkSurface-card text-neutral-900 dark:text-neutral-100"
                                    />
                                </div>

                                <div className="sm:col-span-2 lg:col-span-3">
                                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 uppercase tracking-wider">Suitable Crop Types (comma-separated)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Cotton, Rice, Chilli, Sugarcane"
                                        value={newProductCropTypes}
                                        onChange={(e) => setNewProductCropTypes(e.target.value)}
                                        className="w-full px-3 py-2 border border-neutral-300 dark:border-darkSurface-border rounded-btn text-xs bg-white dark:bg-darkSurface-card text-neutral-900 dark:text-neutral-100"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-primary-700 hover:bg-primary-800 text-white font-medium rounded-btn text-xs transition-colors shadow-2xs flex items-center gap-1.5"
                                >
                                    <Plus className="w-4 h-4" /> Save & Publish Product
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Current Stock List Table */}
                {stock.length === 0 ? (
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm text-center py-8 border border-dashed border-neutral-300 dark:border-darkSurface-border rounded-xl">
                        No products added to your store stock yet. Select a catalog product above to add inventory.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {stock.map((item) => {
                            const threshold = item.minimumStockThreshold !== undefined ? item.minimumStockThreshold : 10;
                            const isLowStock = item.quantityAvailable <= threshold;
                            const hasPrice = item.price !== null && item.price !== undefined && item.price > 0;
                            const priceAge = item.priceUpdatedAt
                                ? Math.floor((Date.now() - new Date(item.priceUpdatedAt).getTime()) / (1000 * 60 * 60 * 24))
                                : null;
                            const priceUpdatedLabel =
                                priceAge === null
                                    ? null
                                    : priceAge <= 0
                                    ? 'Price updated today'
                                    : priceAge === 1
                                    ? 'Price updated 1 day ago'
                                    : `Price updated ${priceAge} days ago`;

                            return (
                                <div key={item._id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border rounded-xl p-4 transition-colors ${
                                    isLowStock
                                        ? 'bg-accent-50/50 dark:bg-accent-950/20 border-accent-300 dark:border-accent-800/60'
                                        : 'bg-white dark:bg-darkSurface-surface border-neutral-200 dark:border-darkSurface-border'
                                }`}>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">{item.product?.name}</h4>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 dark:bg-darkSurface-card text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-darkSurface-border capitalize">
                                                {item.product?.category}
                                            </span>
                                            {isLowStock && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent-600 text-white">
                                                    <AlertTriangle className="w-3 h-3" /> Low Stock Warning
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                                            <span className="font-mono">License: {item.product?.licenseNumber}</span>
                                            {hasPrice ? (
                                                <span className="text-primary-700 dark:text-primary-400 font-medium">
                                                    {priceUpdatedLabel || 'Price set'}
                                                </span>
                                            ) : (
                                                <span className="text-amber-600 dark:text-amber-400 font-medium">
                                                    Not set: add a price to rank higher
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs text-neutral-500 dark:text-neutral-400">Qty:</span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.1"
                                                defaultValue={item.quantityAvailable}
                                                onBlur={(e) => handleUpdateStockItem(item._id, { quantityAvailable: Number(e.target.value) })}
                                                className="w-20 px-2 py-1 border border-neutral-300 dark:border-darkSurface-border rounded-btn text-sm font-semibold text-neutral-900 dark:text-neutral-100 bg-white dark:bg-darkSurface-card text-center focus:ring-2 focus:ring-primary-600 focus:outline-none"
                                            />
                                            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">{item.unit}</span>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <span className="text-xs text-neutral-500 dark:text-neutral-400">₹ / {item.unit}:</span>
                                            <input
                                                type="number"
                                                min="0"
                                                max="1000000"
                                                step="0.01"
                                                placeholder="e.g. 450"
                                                defaultValue={item.price != null ? item.price : ''}
                                                onBlur={(e) => {
                                                    const val = e.target.value.trim();
                                                    handleUpdateStockItem(item._id, { price: val === '' ? null : Number(val) });
                                                }}
                                                className="w-24 px-2 py-1 border border-neutral-300 dark:border-darkSurface-border rounded-btn text-sm font-semibold text-neutral-900 dark:text-neutral-100 bg-white dark:bg-darkSurface-card text-center focus:ring-2 focus:ring-primary-600 focus:outline-none font-mono"
                                            />
                                        </div>

                                        <button
                                            onClick={() => handleRemove(item._id)}
                                            className="p-1.5 bg-neutral-100 dark:bg-darkSurface-card hover:bg-accent-50 dark:hover:bg-accent-950/40 text-neutral-500 dark:text-neutral-400 hover:text-accent-700 dark:hover:text-accent-300 rounded-btn transition-colors border border-neutral-200 dark:border-darkSurface-border"
                                            title="Remove Stock"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

            </div>
        </div>
    );
}