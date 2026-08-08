import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Package, Plus, Trash2, AlertCircle, CheckCircle2, FilePlus, Save } from 'lucide-react';

export default function StockManager({ dealerId }) {
    const [stock, setStock] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantityAvailable, setQuantityAvailable] = useState('');
    const [unit, setUnit] = useState('liters');
    const [addingStock, setAddingStock] = useState(false);

    // Suggest new product form state
    const [showSuggestForm, setShowSuggestForm] = useState(false);
    const [newProductName, setNewProductName] = useState('');
    const [newProductCategory, setNewProductCategory] = useState('pesticide');
    const [newProductLicense, setNewProductLicense] = useState('');
    const [suggestMessage, setSuggestMessage] = useState('');

    const loadData = async () => {
        try {
            const [stockRes, productsRes] = await Promise.all([
                api.get(`/dealers/${dealerId}/stock`),
                api.get('/products'),
            ]);
            setStock(stockRes.data.stock);
            setProducts(productsRes.data.products);
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
                unit,
            });
            setSelectedProduct('');
            setQuantityAvailable('');
            setSuccessMsg('Product added to your store stock!');
            loadData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add product to your stock.');
        } finally {
            setAddingStock(false);
        }
    };

    const handleUpdateQuantity = async (stockId, newQuantity) => {
        setError('');
        setSuccessMsg('');
        try {
            await api.patch(`/dealers/${dealerId}/stock/${stockId}`, {
                quantityAvailable: Number(newQuantity),
            });
            setSuccessMsg('Stock quantity updated.');
            loadData();
        } catch (err) {
            setError('Failed to update stock quantity.');
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
            await api.post('/products', {
                name: newProductName,
                category: newProductCategory,
                licenseNumber: newProductLicense,
            });
            setSuggestMessage('New product added to catalog and live immediately!');
            setNewProductName('');
            setNewProductLicense('');
            setShowSuggestForm(false);
            loadData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add product.');
        }
    };

    const stockedProductIds = new Set(stock.map((s) => s.product._id));
    const availableToAdd = products.filter((p) => !stockedProductIds.has(p._id));

    if (loading) return <p className="text-center text-slate-500 py-6">Loading store inventory...</p>;

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mt-8">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Package className="w-5 h-5 text-emerald-600" />
                        <span>Manage Store Stock</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Control product quantities visible to farmers searching in your area.</p>
                </div>
            </div>

            {/* Notifications */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 mb-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p>{error}</p>
                </div>
            )}
            {successMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl p-4 mb-4 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <p>{successMsg}</p>
                </div>
            )}

            {/* Form: Add Existing Catalog Product to Stock */}
            <form onSubmit={handleAddStock} className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-5">
                    <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                        Catalog Product
                    </label>
                    <select
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    >
                        <option value="">Select a product to stock...</option>
                        {availableToAdd.map((p) => (
                            <option key={p._id} value={p._id}>
                                {p.name} ({p.category})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                        Available Qty
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="e.g. 50"
                        value={quantityAvailable}
                        onChange={(e) => setQuantityAvailable(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                </div>

                <div className="sm:col-span-4 flex gap-2">
                    <div className="flex-1">
                        <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                            Unit
                        </label>
                        <select
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        >
                            <option value="liters">Liters</option>
                            <option value="kg">Kg</option>
                            <option value="packets">Packets</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={addingStock}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1 flex-shrink-0 text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add</span>
                    </button>
                </div>
            </form>

            {/* Toggle Add New Catalog Product Modal/Form */}
            <div className="mb-6">
                <button
                    type="button"
                    onClick={() => setShowSuggestForm(!showSuggestForm)}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
                >
                    <FilePlus className="w-4 h-4" />
                    <span>{showSuggestForm ? 'Close Product Creation Form' : "Can't find your chemical product? Create new catalog product"}</span>
                </button>

                {suggestMessage && (
                    <div className="bg-emerald-50 text-emerald-800 text-xs rounded-xl p-3 mt-2 border border-emerald-200">
                        {suggestMessage}
                    </div>
                )}

                {showSuggestForm && (
                    <form onSubmit={handleAddNewProduct} className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                        <div className="sm:col-span-4">
                            <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">Product Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Coragen"
                                value={newProductName}
                                onChange={(e) => setNewProductName(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                            />
                        </div>
                        <div className="sm:col-span-3">
                            <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">Category</label>
                            <select
                                value={newProductCategory}
                                onChange={(e) => setNewProductCategory(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white capitalize"
                            >
                                <option value="pesticide">Pesticide</option>
                                <option value="fertilizer">Fertilizer</option>
                                <option value="fungicide">Fungicide</option>
                                <option value="herbicide">Herbicide</option>
                            </select>
                        </div>
                        <div className="sm:col-span-3">
                            <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">CIB License No.</label>
                            <input
                                type="text"
                                placeholder="e.g. CIB-REG-10023"
                                value={newProductLicense}
                                onChange={(e) => setNewProductLicense(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-mono"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <button
                                type="submit"
                                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-xs transition-colors shadow-xs"
                            >
                                Save Product
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Current Stock Table / Grid */}
            {stock.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-6 border border-dashed border-slate-200 rounded-xl">
                    No products added to your store stock yet. Select one above.
                </p>
            ) : (
                <div className="space-y-3">
                    {stock.map((item) => (
                        <div key={item._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors bg-white">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-slate-900 text-sm">{item.product?.name}</h4>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-800 capitalize">
                                        {item.product?.category}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-1 font-mono">
                                    License: {item.product?.licenseNumber}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-slate-500">Qty:</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        defaultValue={item.quantityAvailable}
                                        onBlur={(e) => handleUpdateQuantity(item._id, e.target.value)}
                                        className="w-20 px-2.5 py-1 border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 text-center focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                    <span className="text-xs font-medium text-slate-600">{item.unit}</span>
                                </div>

                                <button
                                    onClick={() => handleRemove(item._id)}
                                    className="p-1.5 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-700 rounded-lg transition-colors"
                                    title="Remove Stock"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}