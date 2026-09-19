import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Package, Plus, Trash2, AlertCircle, CheckCircle2, FilePlus } from 'lucide-react';

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

    // Suggest new product form state with all 7 fields
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
        <div className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-6 sm:p-8 shadow-xs">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="font-display text-xl font-semibold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                        <Package className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        <span>Manage Store Stock & Quantities</span>
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        Stock levels are displayed in real-time to farmers searching within your geographic radius.
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

            {/* Form: Add Existing Catalog Product to Stock */}
            <form onSubmit={handleAddStock} className="bg-neutral-50 dark:bg-darkSurface-surface border border-neutral-200 dark:border-darkSurface-border rounded-xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-5">
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

                <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 uppercase tracking-wider">
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
                        className="w-full px-3.5 py-2.5 border border-neutral-300 dark:border-darkSurface-border rounded-btn bg-white dark:bg-darkSurface-card text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                    />
                </div>

                <div className="sm:col-span-4 flex gap-2">
                    <div className="flex-1">
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
                    <button
                        type="submit"
                        disabled={addingStock}
                        className="px-4 py-2.5 bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-btn transition-colors shadow-2xs disabled:opacity-50 flex items-center justify-center gap-1 flex-shrink-0 text-sm"
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

            {/* Current Stock List */}
            {stock.length === 0 ? (
                <p className="text-neutral-500 dark:text-neutral-400 text-sm text-center py-8 border border-dashed border-neutral-300 dark:border-darkSurface-border rounded-xl">
                    No products added to your store stock yet. Select a catalog product above to add inventory.
                </p>
            ) : (
                <div className="space-y-3">
                    {stock.map((item) => (
                        <div key={item._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-neutral-200 dark:border-darkSurface-border rounded-xl p-4 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors bg-white dark:bg-darkSurface-surface">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">{item.product?.name}</h4>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 dark:bg-darkSurface-card text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-darkSurface-border capitalize">
                                        {item.product?.category}
                                    </span>
                                </div>
                                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1 font-mono">
                                    License: {item.product?.licenseNumber}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-neutral-500 dark:text-neutral-400">Qty:</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        defaultValue={item.quantityAvailable}
                                        onBlur={(e) => handleUpdateQuantity(item._id, e.target.value)}
                                        className="w-20 px-2.5 py-1 border border-neutral-300 dark:border-darkSurface-border rounded-btn text-sm font-semibold text-neutral-900 dark:text-neutral-100 bg-white dark:bg-darkSurface-card text-center focus:ring-2 focus:ring-primary-600 focus:outline-none"
                                    />
                                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">{item.unit}</span>
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
                    ))}
                </div>
            )}

        </div>
    );
}