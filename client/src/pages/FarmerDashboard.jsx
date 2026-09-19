import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Package, AlertTriangle, Clock, Plus, Trash2, History, CheckCircle2, AlertCircle, Sprout, Tag } from 'lucide-react';

export default function FarmerDashboard() {
    const [items, setItems] = useState([]);
    const [products, setProducts] = useState([]);
    const [alerts, setAlerts] = useState({ lowStock: [], expirySoon: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Add item form state
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantityPurchased, setQuantityPurchased] = useState('');
    const [unit, setUnit] = useState('liters');
    const [adding, setAdding] = useState(false);

    // Usage log form state
    const [usageFormItemId, setUsageFormItemId] = useState(null);
    const [usageQty, setUsageQty] = useState('');
    const [usageCrop, setUsageCrop] = useState('');
    const [loggingUsage, setLoggingUsage] = useState(false);

    const loadData = async () => {
        try {
            const [inventoryRes, productsRes, alertsRes] = await Promise.all([
                api.get('/inventory'),
                api.get('/products'),
                api.get('/inventory/alerts'),
            ]);
            setItems(inventoryRes.data.items);
            setProducts(productsRes.data.products);
            setAlerts(alertsRes.data);
        } catch (err) {
            setError('Failed to load inventory data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAddItem = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setAdding(true);
        try {
            await api.post('/inventory', {
                product: selectedProduct,
                quantityPurchased: Number(quantityPurchased),
                unit,
            });
            setSelectedProduct('');
            setQuantityPurchased('');
            setSuccessMsg('Product added to your farm inventory!');
            loadData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add item to inventory.');
        } finally {
            setAdding(false);
        }
    };

    const handleLogUsage = async (itemId) => {
        setError('');
        setSuccessMsg('');
        setLoggingUsage(true);
        try {
            await api.post(`/inventory/${itemId}/usage`, {
                quantityUsed: Number(usageQty),
                cropApplied: usageCrop,
            });
            setUsageFormItemId(null);
            setUsageQty('');
            setUsageCrop('');
            setSuccessMsg('Usage recorded successfully!');
            loadData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to log usage.');
        } finally {
            setLoggingUsage(false);
        }
    };

    const handleDelete = async (itemId) => {
        if (!confirm('Remove this item from your inventory?')) return;
        setError('');
        setSuccessMsg('');
        try {
            await api.delete(`/inventory/${itemId}`);
            setSuccessMsg('Item removed from inventory.');
            loadData();
        } catch (err) {
            setError('Failed to delete item.');
        }
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center text-neutral-500 dark:text-neutral-400">
                <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm">Loading your farm inventory...</p>
            </div>
        );
    }

    const lowStockCount = alerts.lowStock?.length || 0;
    const expiryCount = alerts.expirySoon?.length || 0;

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
            
            {/* Header */}
            <div>
                <h1 className="font-display text-2xl sm:text-3xl font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight">
                    Farm Input Inventory
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-0.5">
                    Track your chemical stock levels, record crop spray applications, and prevent stockouts.
                </p>
            </div>

            {/* Error / Success Notifications */}
            {error && (
                <div className="bg-accent-50 dark:bg-accent-950/40 border border-accent-200 dark:border-accent-800/60 text-accent-900 dark:text-accent-200 text-sm rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-accent-600 dark:text-accent-400 flex-shrink-0 mt-0.5" />
                    <p>{error}</p>
                </div>
            )}
            {successMsg && (
                <div className="bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800/60 text-primary-900 dark:text-primary-200 text-sm rounded-xl p-4 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                    <p>{successMsg}</p>
                </div>
            )}

            {/* Summary Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-5 shadow-2xs flex items-center gap-4">
                    <div className="w-11 h-11 bg-primary-50 dark:bg-darkSurface-surface text-primary-700 dark:text-primary-400 rounded-xl flex items-center justify-center flex-shrink-0 border border-primary-100 dark:border-darkSurface-border">
                        <Package className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Tracked Products</span>
                        <h3 className="font-display text-2xl font-semibold text-neutral-900 dark:text-neutral-50">{items.length}</h3>
                    </div>
                </div>

                <div className={`rounded-2xl p-5 shadow-2xs flex items-center gap-4 border ${
                    lowStockCount > 0
                        ? 'bg-accent-50/80 dark:bg-accent-950/40 border-accent-200 dark:border-accent-800/60 text-accent-900 dark:text-accent-200'
                        : 'bg-white dark:bg-darkSurface-card border-neutral-200 dark:border-darkSurface-border text-neutral-900 dark:text-neutral-50'
                }`}>
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        lowStockCount > 0
                            ? 'bg-accent-100 dark:bg-accent-900/60 text-accent-700 dark:text-accent-300'
                            : 'bg-neutral-100 dark:bg-darkSurface-surface text-neutral-500 dark:text-neutral-400'
                    }`}>
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Low Stock Warnings</span>
                        <h3 className="font-display text-2xl font-semibold">{lowStockCount}</h3>
                    </div>
                </div>

                <div className={`rounded-2xl p-5 shadow-2xs flex items-center gap-4 border ${
                    expiryCount > 0
                        ? 'bg-accent-50/80 dark:bg-accent-950/40 border-accent-200 dark:border-accent-800/60 text-accent-900 dark:text-accent-200'
                        : 'bg-white dark:bg-darkSurface-card border-neutral-200 dark:border-darkSurface-border text-neutral-900 dark:text-neutral-50'
                }`}>
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        expiryCount > 0
                            ? 'bg-accent-100 dark:bg-accent-900/60 text-accent-700 dark:text-accent-300'
                            : 'bg-neutral-100 dark:bg-darkSurface-surface text-neutral-500 dark:text-neutral-400'
                    }`}>
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Expiring Soon</span>
                        <h3 className="font-display text-2xl font-semibold">{expiryCount}</h3>
                    </div>
                </div>

            </div>

            {/* Alert Banner Callout */}
            {(lowStockCount > 0 || expiryCount > 0) && (
                <div className="bg-accent-50 dark:bg-accent-950/40 border border-accent-200 dark:border-accent-800/60 rounded-2xl p-5">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-accent-600 dark:text-accent-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-accent-900 dark:text-accent-200 text-sm">Farm Inventory Attention Required</h4>
                            {alerts.lowStock?.length > 0 && (
                                <p className="text-xs text-accent-800 dark:text-accent-300 mt-1">
                                    <span className="font-semibold">Low stock on:</span> {alerts.lowStock.map((i) => i.product?.name).join(', ')}
                                </p>
                            )}
                            {alerts.expirySoon?.length > 0 && (
                                <p className="text-xs text-accent-800 dark:text-accent-300 mt-1">
                                    <span className="font-semibold">Expiring registration:</span> {alerts.expirySoon.map((i) => i.product?.name).join(', ')}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Item Card */}
            <div className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-6 shadow-2xs">
                <h3 className="font-display text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                    <span>Add Chemical or Fertilizer to Inventory</span>
                </h3>

                <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                    
                    <div className="sm:col-span-6">
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 uppercase tracking-wider">
                            Select Product
                        </label>
                        <select
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                            required
                            className="w-full px-3.5 py-2.5 border border-neutral-300 dark:border-darkSurface-border rounded-btn bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                        >
                            <option value="">Choose a product from catalog...</option>
                            {products.map((p) => (
                                <option key={p._id} value={p._id}>
                                    {p.name} ({p.category}) {p.activeIngredient ? `- ${p.activeIngredient}` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="sm:col-span-3">
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 uppercase tracking-wider">
                            Quantity Purchased
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.1"
                            placeholder="e.g. 5"
                            value={quantityPurchased}
                            onChange={(e) => setQuantityPurchased(e.target.value)}
                            required
                            className="w-full px-3.5 py-2.5 border border-neutral-300 dark:border-darkSurface-border rounded-btn bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                        />
                    </div>

                    <div className="sm:col-span-3">
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 uppercase tracking-wider">
                            Unit
                        </label>
                        <div className="flex gap-2">
                            <select
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                                className="w-full px-3.5 py-2.5 border border-neutral-300 dark:border-darkSurface-border rounded-btn bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                            >
                                <option value="liters">Liters</option>
                                <option value="kg">Kg</option>
                                <option value="packets">Packets</option>
                            </select>
                            <button
                                type="submit"
                                disabled={adding}
                                className="px-5 py-2.5 bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-btn transition-colors shadow-2xs disabled:opacity-50 flex items-center justify-center flex-shrink-0 text-sm"
                            >
                                {adding ? 'Adding...' : 'Add'}
                            </button>
                        </div>
                    </div>

                </form>
            </div>

            {/* Inventory List Header */}
            <div className="flex justify-between items-center">
                <h3 className="font-display text-xl font-semibold text-neutral-900 dark:text-neutral-50">Current Inventory ({items.length})</h3>
            </div>

            {/* Inventory Items List */}
            {items.length === 0 ? (
                <div className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-12 text-center">
                    <div className="w-12 h-12 bg-neutral-100 dark:bg-darkSurface-surface text-neutral-400 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Package className="w-6 h-6" />
                    </div>
                    <h4 className="font-display text-base font-semibold text-neutral-900 dark:text-neutral-100">No inventory items added yet</h4>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1 max-w-sm mx-auto">
                        Use the form above to add your first chemical purchase and begin tracking crop usage.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((item) => {
                        const pctRemaining = Math.max(0, Math.min(100, (item.quantityRemaining / item.quantityPurchased) * 100));
                        const isLow = item.quantityRemaining <= 1;

                        return (
                            <div key={item._id} className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col justify-between">
                                
                                <div>
                                    {/* Title & Badge */}
                                    <div className="flex justify-between items-start gap-2 mb-2">
                                        <div>
                                            <h4 className="font-display font-semibold text-neutral-900 dark:text-neutral-50 text-base">{item.product?.name}</h4>
                                            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-darkSurface-surface text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-darkSurface-border capitalize mt-1">
                                                {item.product?.category}
                                            </span>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                            isLow
                                                ? 'bg-accent-50 dark:bg-accent-950/60 text-accent-800 dark:text-accent-300 border-accent-200 dark:border-accent-800/60'
                                                : 'bg-primary-50 dark:bg-primary-950/60 text-primary-800 dark:text-primary-300 border-primary-200 dark:border-primary-800/60'
                                        }`}>
                                            {item.quantityRemaining} {item.unit} left
                                        </span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="my-3">
                                        <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                                            <span>Stock Remaining</span>
                                            <span className="font-medium text-neutral-800 dark:text-neutral-200">
                                                {item.quantityRemaining} / {item.quantityPurchased} {item.unit}
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-neutral-100 dark:bg-darkSurface-surface rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-300 ${
                                                    isLow ? 'bg-accent-600' : 'bg-primary-600'
                                                }`}
                                                style={{ width: `${pctRemaining}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {item.purchasedFrom?.storeName && (
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
                                            Purchased from: <span className="font-medium text-neutral-700 dark:text-neutral-300">{item.purchasedFrom.storeName}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Actions & Log Form */}
                                <div>
                                    <div className="flex items-center gap-2 pt-3 border-t border-neutral-100 dark:border-darkSurface-borderSubtle mt-2">
                                        <button
                                            onClick={() => setUsageFormItemId(usageFormItemId === item._id ? null : item._id)}
                                            className="flex-1 py-1.5 bg-neutral-100 dark:bg-darkSurface-surface hover:bg-neutral-200 dark:hover:bg-darkSurface-hover text-neutral-800 dark:text-neutral-200 text-xs font-medium rounded-btn transition-colors flex items-center justify-center gap-1.5 border border-neutral-200 dark:border-darkSurface-border"
                                        >
                                            <Sprout className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                                            <span>{usageFormItemId === item._id ? 'Cancel' : 'Log Field Application'}</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            className="px-3 py-1.5 bg-neutral-100 dark:bg-darkSurface-surface hover:bg-accent-50 dark:hover:bg-accent-950/40 text-neutral-600 dark:text-neutral-400 hover:text-accent-700 dark:hover:text-accent-300 text-xs font-medium rounded-btn transition-colors flex items-center gap-1 border border-neutral-200 dark:border-darkSurface-border"
                                            title="Delete Item"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {/* Inline Usage Form */}
                                    {usageFormItemId === item._id && (
                                        <div className="mt-3 p-3 bg-neutral-50 dark:bg-darkSurface-surface border border-neutral-200 dark:border-darkSurface-border rounded-xl space-y-2">
                                            <h5 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">Record Field Application</h5>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="block text-[10px] uppercase font-semibold text-neutral-500 dark:text-neutral-400">Qty Used ({item.unit})</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.1"
                                                        placeholder="0.5"
                                                        value={usageQty}
                                                        onChange={(e) => setUsageQty(e.target.value)}
                                                        className="w-full px-2.5 py-1.5 border border-neutral-300 dark:border-darkSurface-border rounded-btn text-xs bg-white dark:bg-darkSurface-card text-neutral-900 dark:text-neutral-100"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] uppercase font-semibold text-neutral-500 dark:text-neutral-400">Crop Applied</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. Wheat"
                                                        value={usageCrop}
                                                        onChange={(e) => setUsageCrop(e.target.value)}
                                                        className="w-full px-2.5 py-1.5 border border-neutral-300 dark:border-darkSurface-border rounded-btn text-xs bg-white dark:bg-darkSurface-card text-neutral-900 dark:text-neutral-100"
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleLogUsage(item._id)}
                                                disabled={loggingUsage}
                                                className="w-full py-1.5 bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-btn text-xs transition-colors disabled:opacity-50"
                                            >
                                                {loggingUsage ? 'Saving...' : 'Save Usage Log'}
                                            </button>
                                        </div>
                                    )}

                                    {/* Usage History Expander */}
                                    {item.usageLog.length > 0 && (
                                        <details className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
                                            <summary className="cursor-pointer font-medium hover:text-neutral-700 dark:hover:text-neutral-300 flex items-center gap-1">
                                                <History className="w-3.5 h-3.5 text-neutral-400" />
                                                <span>Usage history ({item.usageLog.length})</span>
                                            </summary>
                                            <div className="mt-2 space-y-1 pl-4 border-l-2 border-neutral-200 dark:border-darkSurface-border text-[11px]">
                                                {item.usageLog.map((log) => (
                                                    <div key={log._id} className="flex justify-between text-neutral-600 dark:text-neutral-400">
                                                        <span>{new Date(log.date).toLocaleDateString()}</span>
                                                        <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                                                            {log.quantityUsed} {item.unit} on {log.cropApplied || 'crop'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </details>
                                    )}
                                </div>

                            </div>
                        );
                    })}
                </div>
            )}

        </div>
    );
}