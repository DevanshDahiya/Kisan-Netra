import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function FarmerDashboard() {
    const [items, setItems] = useState([]);
    const [products, setProducts] = useState([]);
    const [alerts, setAlerts] = useState({ lowStock: [], expirySoon: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Add item form state
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantityPurchased, setQuantityPurchased] = useState('');
    const [unit, setUnit] = useState('liters');

    // Usage log form state - tracks which item's usage form is currently open
    const [usageFormItemId, setUsageFormItemId] = useState(null);
    const [usageQty, setUsageQty] = useState('');
    const [usageCrop, setUsageCrop] = useState('');

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
        try {
            await api.post('/inventory', {
                product: selectedProduct,
                quantityPurchased: Number(quantityPurchased),
                unit,
            });
            setSelectedProduct('');
            setQuantityPurchased('');
            loadData(); // refresh list + alerts after adding
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add item.');
        }
    };

    const handleLogUsage = async (itemId) => {
        setError('');
        try {
            await api.post(`/inventory/${itemId}/usage`, {
                quantityUsed: Number(usageQty),
                cropApplied: usageCrop,
            });
            setUsageFormItemId(null);
            setUsageQty('');
            setUsageCrop('');
            loadData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to log usage.');
        }
    };

    const handleDelete = async (itemId) => {
        if (!confirm('Remove this item from your inventory?')) return;
        try {
            await api.delete(`/inventory/${itemId}`);
            loadData();
        } catch (err) {
            setError('Failed to delete item.');
        }
    };

    if (loading) return <div className="text-center mt-16">Loading your inventory...</div>;

    return (
        <div className="max-w-3xl mx-auto mt-10 px-4">
            <h2 className="text-2xl font-semibold text-green-800 mb-4">My Inventory</h2>

            {error && <div className="bg-red-100 text-red-700 text-sm rounded px-3 py-2 mb-4">{error}</div>}

            {/* Alerts banner */}
            {((alerts.lowStock?.length > 0) || (alerts.expirySoon?.length > 0)) && (
                <div className="bg-yellow-50 border border-yellow-300 rounded p-4 mb-6">
                    {alerts.lowStock?.length > 0 && (
                        <p className="text-yellow-800 text-sm">
                            ⚠️ Low stock: {alerts.lowStock.map((i) => i.product?.name).join(', ')}
                        </p>
                    )}
                    {alerts.expirySoon?.length > 0 && (
                        <p className="text-yellow-800 text-sm mt-1">
                            ⏰ Expiring soon: {alerts.expirySoon.map((i) => i.product?.name).join(', ')}
                        </p>
                    )}
                </div>
            )}

            {/* Add new item form */}
            <form onSubmit={handleAddItem} className="bg-white p-4 rounded-lg shadow-sm mb-6 flex gap-3 flex-wrap items-end">
                <div className="flex-1 min-w-[180px]">
                    <label className="text-xs text-gray-500 block mb-1">Product</label>
                    <select
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        required
                        className="border border-gray-300 rounded px-3 py-2 w-full"
                    >
                        <option value="">Select a product</option>
                        {products.map((p) => (
                            <option key={p._id} value={p._id}>
                                {p.name} ({p.category})
                            </option>
                        ))}
                    </select>
                </div>
                <div className="w-28">
                    <label className="text-xs text-gray-500 block mb-1">Quantity</label>
                    <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={quantityPurchased}
                        onChange={(e) => setQuantityPurchased(e.target.value)}
                        required
                        className="border border-gray-300 rounded px-3 py-2 w-full"
                    />
                </div>
                <div className="w-28">
                    <label className="text-xs text-gray-500 block mb-1">Unit</label>
                    <select
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 w-full"
                    >
                        <option value="liters">Liters</option>
                        <option value="kg">Kg</option>
                        <option value="packets">Packets</option>
                    </select>
                </div>
                <button
                    type="submit"
                    className="bg-green-700 text-white rounded px-4 py-2 hover:bg-green-800 transition"
                >
                    Add
                </button>
            </form>

            {/* Inventory list */}
            {items.length === 0 ? (
                <p className="text-gray-500 text-center">No inventory items yet. Add one above.</p>
            ) : (
                <div className="flex flex-col gap-3">
                    {items.map((item) => (
                        <div key={item._id} className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-gray-800">{item.product?.name}</p>
                                    <p className="text-sm text-gray-500">
                                        {item.quantityRemaining} / {item.quantityPurchased} {item.unit} remaining
                                    </p>
                                    {item.purchasedFrom?.storeName && (
                                        <p className="text-xs text-gray-400">From: {item.purchasedFrom.storeName}</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setUsageFormItemId(usageFormItemId === item._id ? null : item._id)}
                                        className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded hover:bg-green-200 transition"
                                    >
                                        Log Usage
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item._id)}
                                        className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>

                            {usageFormItemId === item._id && (
                                <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2 items-end flex-wrap">
                                    <div className="w-24">
                                        <label className="text-xs text-gray-500 block mb-1">Qty used</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.1"
                                            value={usageQty}
                                            onChange={(e) => setUsageQty(e.target.value)}
                                            className="border border-gray-300 rounded px-2 py-1 w-full"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-[140px]">
                                        <label className="text-xs text-gray-500 block mb-1">Crop applied</label>
                                        <input
                                            type="text"
                                            value={usageCrop}
                                            onChange={(e) => setUsageCrop(e.target.value)}
                                            className="border border-gray-300 rounded px-2 py-1 w-full"
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleLogUsage(item._id)}
                                        className="bg-green-700 text-white rounded px-3 py-1 hover:bg-green-800 transition"
                                    >
                                        Save
                                    </button>
                                </div>
                            )}

                            {item.usageLog.length > 0 && (
                                <details className="mt-2 text-xs text-gray-500">
                                    <summary className="cursor-pointer">Usage history ({item.usageLog.length})</summary>
                                    <ul className="mt-1 list-disc list-inside">
                                        {item.usageLog.map((log) => (
                                            <li key={log._id}>
                                                {new Date(log.date).toLocaleDateString()} — {log.quantityUsed} {item.unit} on {log.cropApplied || 'unspecified crop'}
                                            </li>
                                        ))}
                                    </ul>
                                </details>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}