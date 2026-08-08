import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Package, AlertTriangle, Clock, Plus, Trash2, History, Sprout, CheckCircle2, AlertCircle } from 'lucide-react';

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
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-slate-200 rounded w-1/4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="h-24 bg-slate-200 rounded-xl"></div>
                        <div className="h-24 bg-slate-200 rounded-xl"></div>
                        <div className="h-24 bg-slate-200 rounded-xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    const lowStockCount = alerts.lowStock?.length || 0;
    const expiryCount = alerts.expirySoon?.length || 0;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Farm Inventory</h1>
                <p className="text-slate-600 mt-1">Track your chemical stock levels, log field applications, and get automated alerts.</p>
            </div>

            {/* Error / Success Notifications */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 mb-6 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p>{error}</p>
                </div>
            )}
            {successMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl p-4 mb-6 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <p>{successMsg}</p>
                </div>
            )}

            {/* Summary Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Package className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tracked Products</span>
                        <h3 className="text-2xl font-extrabold text-slate-900">{items.length}</h3>
                    </div>
                </div>

                <div className={`border rounded-2xl p-5 shadow-xs flex items-center gap-4 ${
                    lowStockCount > 0 ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-white border-slate-200'
                }`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        lowStockCount > 0 ? 'bg-amber-200 text-amber-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Low Stock Warnings</span>
                        <h3 className="text-2xl font-extrabold">{lowStockCount}</h3>
                    </div>
                </div>

                <div className={`border rounded-2xl p-5 shadow-xs flex items-center gap-4 ${
                    expiryCount > 0 ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-white border-slate-200'
                }`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        expiryCount > 0 ? 'bg-amber-200 text-amber-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Expiring Soon</span>
                        <h3 className="text-2xl font-extrabold">{expiryCount}</h3>
                    </div>
                </div>

            </div>

            {/* Alert Banner Callout */}
            {(lowStockCount > 0 || expiryCount > 0) && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-amber-900 text-sm">Inventory Alerts Require Attention</h4>
                            {alerts.lowStock?.length > 0 && (
                                <p className="text-xs text-amber-800 mt-1">
                                    <span className="font-semibold">Low stock on:</span> {alerts.lowStock.map((i) => i.product?.name).join(', ')}
                                </p>
                            )}
                            {alerts.expirySoon?.length > 0 && (
                                <p className="text-xs text-amber-800 mt-1">
                                    <span className="font-semibold">Expiring registration:</span> {alerts.expirySoon.map((i) => i.product?.name).join(', ')}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Item Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-emerald-600" />
                    <span>Add Chemical or Fertilizer to Inventory</span>
                </h3>

                <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                    
                    <div className="sm:col-span-6">
                        <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                            Select Product
                        </label>
                        <select
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                            required
                            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
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
                        <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
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
                            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <div className="sm:col-span-3">
                        <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                            Unit
                        </label>
                        <div className="flex gap-2">
                            <select
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            >
                                <option value="liters">Liters</option>
                                <option value="kg">Kg</option>
                                <option value="packets">Packets</option>
                            </select>
                            <button
                                type="submit"
                                disabled={adding}
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center flex-shrink-0"
                            >
                                {adding ? 'Adding...' : 'Add'}
                            </button>
                        </div>
                    </div>

                </form>
            </div>

            {/* Inventory List Header */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-900">Current Inventory ({items.length})</h3>
            </div>

            {/* Inventory Items List */}
            {items.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                    <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Package className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900">No inventory items added yet</h4>
                    <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
                        Use the form above to add your first chemical purchase and start tracking crop usage.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((item) => {
                        const pctRemaining = Math.max(0, Math.min(100, (item.quantityRemaining / item.quantityPurchased) * 100));
                        const isLow = item.quantityRemaining <= 1;

                        return (
                            <div key={item._id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col justify-between">
                                
                                <div>
                                    {/* Title & Badge */}
                                    <div className="flex justify-between items-start gap-2 mb-2">
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-base">{item.product?.name}</h4>
                                            <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-100 text-indigo-800 capitalize mt-1">
                                                {item.product?.category}
                                            </span>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                            isLow ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                                        }`}>
                                            {item.quantityRemaining} {item.unit} left
                                        </span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="my-3">
                                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                                            <span>Stock Remaining</span>
                                            <span className="font-medium text-slate-700">
                                                {item.quantityRemaining} / {item.quantityPurchased} {item.unit}
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-300 ${
                                                    isLow ? 'bg-red-500' : 'bg-emerald-500'
                                                }`}
                                                style={{ width: `${pctRemaining}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {item.purchasedFrom?.storeName && (
                                        <p className="text-xs text-slate-400 mb-3">
                                            Purchased from: <span className="font-medium text-slate-600">{item.purchasedFrom.storeName}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Actions & Log Form */}
                                <div>
                                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100 mt-2">
                                        <button
                                            onClick={() => setUsageFormItemId(usageFormItemId === item._id ? null : item._id)}
                                            className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                                        >
                                            <Sprout className="w-3.5 h-3.5" />
                                            <span>{usageFormItemId === item._id ? 'Cancel' : 'Log Field Usage'}</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            className="px-3 py-1.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                                            title="Delete Item"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {/* Inline Usage Form */}
                                    {usageFormItemId === item._id && (
                                        <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                                            <h5 className="text-xs font-bold text-slate-800">Record Field Application</h5>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="block text-[10px] uppercase font-semibold text-slate-500">Qty Used ({item.unit})</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.1"
                                                        placeholder="0.5"
                                                        value={usageQty}
                                                        onChange={(e) => setUsageQty(e.target.value)}
                                                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] uppercase font-semibold text-slate-500">Crop Applied</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. Wheat"
                                                        value={usageCrop}
                                                        onChange={(e) => setUsageCrop(e.target.value)}
                                                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleLogUsage(item._id)}
                                                disabled={loggingUsage}
                                                className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs transition-colors disabled:opacity-50"
                                            >
                                                {loggingUsage ? 'Saving...' : 'Save Usage Log'}
                                            </button>
                                        </div>
                                    )}

                                    {/* Usage History Expander */}
                                    {item.usageLog.length > 0 && (
                                        <details className="mt-3 text-xs text-slate-500">
                                            <summary className="cursor-pointer font-medium hover:text-slate-700 flex items-center gap-1">
                                                <History className="w-3.5 h-3.5 text-slate-400" />
                                                <span>Usage history ({item.usageLog.length})</span>
                                            </summary>
                                            <div className="mt-2 space-y-1 pl-4 border-l-2 border-slate-200 text-[11px]">
                                                {item.usageLog.map((log) => (
                                                    <div key={log._id} className="flex justify-between text-slate-600">
                                                        <span>{new Date(log.date).toLocaleDateString()}</span>
                                                        <span className="font-semibold text-slate-800">
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