import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import {
    Package,
    AlertTriangle,
    Clock,
    Plus,
    Trash2,
    History,
    CheckCircle2,
    AlertCircle,
    Sprout,
    MapPin,
    Calendar,
    ChevronRight,
    Edit3,
    Compass,
    Layers,
    Info,
    BookOpen,
    X,
} from 'lucide-react';

const CROP_STAGES = ['Land Prep', 'Sowing', 'Vegetative', 'Flowering', 'Fruiting', 'Harvesting', 'Completed'];

export default function FarmerDashboard() {
    // Navigation tab: 'overview' | 'farms' | 'crops' | 'inventory'
    const [activeTab, setActiveTab] = useState('overview');

    // Core state
    const [items, setItems] = useState([]);
    const [products, setProducts] = useState([]);
    const [alerts, setAlerts] = useState({ lowStock: [], expirySoon: [] });
    const [farms, setFarms] = useState([]);
    const [crops, setCrops] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Feature 2: Dismissible Guide Banner
    const [showGuideBanner, setShowGuideBanner] = useState(() => {
        try {
            return localStorage.getItem('dismiss_farmer_guide_banner') !== 'true';
        } catch (e) {
            return true;
        }
    });

    const dismissGuideBanner = () => {
        setShowGuideBanner(false);
        try {
            localStorage.setItem('dismiss_farmer_guide_banner', 'true');
        } catch (e) {}
    };

    // Selected Farm filter
    const [selectedFarmId, setSelectedFarmId] = useState('');

    // --- Form States ---
    // Farm profile form
    const [showFarmModal, setShowFarmModal] = useState(false);
    const [editingFarmId, setEditingFarmId] = useState(null);
    const [farmName, setFarmName] = useState('');
    const [locationName, setLocationName] = useState('');
    const [totalArea, setTotalArea] = useState('');
    const [areaUnit, setAreaUnit] = useState('acres');
    const [soilType, setSoilType] = useState('Loam');
    const [irrigationType, setIrrigationType] = useState('Rainfed');
    const [farmNotes, setFarmNotes] = useState('');
    const [savingFarm, setSavingFarm] = useState(false);

    // Add inventory item form
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantityPurchased, setQuantityPurchased] = useState('');
    const [unit, setUnit] = useState('liters');
    const [assignFarmId, setAssignFarmId] = useState('');
    const [adding, setAdding] = useState(false);

    // Inventory usage form
    const [usageFormItemId, setUsageFormItemId] = useState(null);
    const [usageQty, setUsageQty] = useState('');
    const [usageCrop, setUsageCrop] = useState('');
    const [loggingUsage, setLoggingUsage] = useState(false);

    // Crop form state
    const [showCropModal, setShowCropModal] = useState(false);
    const [cropFarmId, setCropFarmId] = useState('');
    const [cropName, setCropName] = useState('');
    const [cropVariety, setCropVariety] = useState('');
    const [sowingDate, setSowingDate] = useState('');
    const [expectedHarvestDate, setExpectedHarvestDate] = useState('');
    const [currentStage, setCurrentStage] = useState('Sowing');
    const [cropNotes, setCropNotes] = useState('');
    const [savingCrop, setSavingCrop] = useState(false);

    // Crop activity modal state
    const [selectedCropForActivity, setSelectedCropForActivity] = useState(null);
    const [activityType, setActivityType] = useState('Fertilizer');
    const [activityDesc, setActivityDesc] = useState('');
    const [linkInventoryId, setLinkInventoryId] = useState('');
    const [activityQty, setActivityQty] = useState('');
    const [savingActivity, setSavingActivity] = useState(false);

    // Load data
    const loadData = async () => {
        try {
            const [inventoryRes, productsRes, alertsRes, farmsRes, cropsRes] = await Promise.all([
                api.get('/inventory'),
                api.get('/products'),
                api.get('/inventory/alerts'),
                api.get('/farms').catch(() => ({ data: { farms: [] } })),
                api.get('/crops').catch(() => ({ data: { crops: [] } })),
            ]);

            setItems(inventoryRes.data.items || []);
            setProducts(productsRes.data.products || []);
            setAlerts(alertsRes.data || { lowStock: [], expirySoon: [] });
            setFarms(farmsRes.data.farms || []);
            setCrops(cropsRes.data.crops || []);
        } catch (err) {
            setError('Failed to load farmer dashboard data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // --- Farm Handlers ---
    const handleSaveFarm = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setSavingFarm(true);

        const payload = {
            farmName,
            locationName,
            totalArea: Number(totalArea),
            areaUnit,
            soilType,
            irrigationType,
            notes: farmNotes,
        };

        try {
            if (editingFarmId) {
                await api.put(`/farms/${editingFarmId}`, payload);
                setSuccessMsg('Farm profile updated successfully!');
            } else {
                await api.post('/farms', payload);
                setSuccessMsg('New farm profile registered!');
            }
            setShowFarmModal(false);
            resetFarmForm();
            loadData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save farm profile.');
        } finally {
            setSavingFarm(false);
        }
    };

    const handleEditFarm = (farm) => {
        setEditingFarmId(farm._id);
        setFarmName(farm.farmName);
        setLocationName(farm.locationName || '');
        setTotalArea(farm.totalArea);
        setAreaUnit(farm.areaUnit || 'acres');
        setSoilType(farm.soilType || 'Loam');
        setIrrigationType(farm.irrigationType || 'Rainfed');
        setFarmNotes(farm.notes || '');
        setShowFarmModal(true);
    };

    const handleDeleteFarm = async (farmId) => {
        if (!confirm('Are you sure you want to delete this farm profile?')) return;
        try {
            await api.delete(`/farms/${farmId}`);
            setSuccessMsg('Farm profile removed.');
            loadData();
        } catch (err) {
            setError('Failed to delete farm profile.');
        }
    };

    const resetFarmForm = () => {
        setEditingFarmId(null);
        setFarmName('');
        setLocationName('');
        setTotalArea('');
        setAreaUnit('acres');
        setSoilType('Loam');
        setIrrigationType('Rainfed');
        setFarmNotes('');
    };

    // --- Inventory Handlers ---
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
                farm: assignFarmId || undefined,
            });
            setSelectedProduct('');
            setQuantityPurchased('');
            setAssignFarmId('');
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

    const handleDeleteInventory = async (itemId) => {
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

    // --- Crop Handlers ---
    const handleSaveCrop = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setSavingCrop(true);
        try {
            await api.post('/crops', {
                farm: cropFarmId,
                cropName,
                variety: cropVariety,
                sowingDate,
                expectedHarvestDate: expectedHarvestDate || undefined,
                currentStage,
                notes: cropNotes,
            });
            setSuccessMsg('Crop lifecycle tracking registered!');
            setShowCropModal(false);
            setCropName('');
            setCropVariety('');
            setSowingDate('');
            setExpectedHarvestDate('');
            setCropNotes('');
            loadData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add crop tracking record.');
        } finally {
            setSavingCrop(false);
        }
    };

    const handleUpdateCropStage = async (cropId, newStage) => {
        try {
            await api.put(`/crops/${cropId}`, { currentStage: newStage });
            setSuccessMsg('Crop growth stage updated!');
            loadData();
        } catch (err) {
            setError('Failed to update crop stage.');
        }
    };

    const handleAddCropActivity = async (e) => {
        e.preventDefault();
        if (!selectedCropForActivity) return;
        setSavingActivity(true);
        setError('');
        try {
            await api.post(`/crops/${selectedCropForActivity._id}/activities`, {
                activityType,
                description: activityDesc,
                inventoryItem: linkInventoryId || undefined,
                quantityUsed: activityQty ? Number(activityQty) : 0,
            });
            setSuccessMsg('Field activity logged successfully!');
            setSelectedCropForActivity(null);
            setActivityDesc('');
            setLinkInventoryId('');
            setActivityQty('');
            loadData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to log activity.');
        } finally {
            setSavingActivity(false);
        }
    };

    const handleDeleteCrop = async (cropId) => {
        if (!confirm('Delete this crop tracking record?')) return;
        try {
            await api.delete(`/crops/${cropId}`);
            setSuccessMsg('Crop record deleted.');
            loadData();
        } catch (err) {
            setError('Failed to delete crop.');
        }
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center text-neutral-500 dark:text-neutral-400">
                <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm">Loading your farm dashboard...</p>
            </div>
        );
    }

    const lowStockCount = alerts.lowStock?.length || 0;
    const expiryCount = alerts.expirySoon?.length || 0;

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
            {/* Guide Banner */}
            {showGuideBanner && (
                <div className="bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800/60 rounded-xl p-4 flex items-center justify-between gap-3 text-xs sm:text-sm text-primary-950 dark:text-primary-200 shadow-2xs">
                    <div className="flex items-center gap-2.5">
                        <BookOpen className="w-4 h-4 text-primary-700 dark:text-primary-400 flex-shrink-0" />
                        <span>
                            New here?{' '}
                            <Link to="/guide#farmer" className="font-semibold underline hover:text-primary-800 dark:hover:text-primary-300">
                                Read the Farmer Guide
                            </Link>{' '}
                            to learn how to track inventory, log usage, monitor crop stages, and find nearby dealers.
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={dismissGuideBanner}
                        className="text-primary-700 dark:text-primary-400 hover:text-primary-900 dark:hover:text-white p-1 rounded-md"
                        aria-label="Dismiss banner"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
            
            {/* Header & Subtitle */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-2xl sm:text-3xl font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight">
                        Farmer Advisory & Operations Hub
                    </h1>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-0.5">
                        Manage farm profiles, track crop stages, and control chemical inventory.
                    </p>
                </div>

                {/* Dashboard Tabs */}
                <div className="flex items-center bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border p-1 rounded-xl shadow-2xs text-xs font-medium self-start md:self-auto">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-3 py-1.5 rounded-lg transition-colors ${
                            activeTab === 'overview'
                                ? 'bg-primary-700 text-white shadow-2xs'
                                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                        }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('farms')}
                        className={`px-3 py-1.5 rounded-lg transition-colors ${
                            activeTab === 'farms'
                                ? 'bg-primary-700 text-white shadow-2xs'
                                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                        }`}
                    >
                        Farms ({farms.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('crops')}
                        className={`px-3 py-1.5 rounded-lg transition-colors ${
                            activeTab === 'crops'
                                ? 'bg-primary-700 text-white shadow-2xs'
                                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                        }`}
                    >
                        Crops ({crops.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('inventory')}
                        className={`px-3 py-1.5 rounded-lg transition-colors ${
                            activeTab === 'inventory'
                                ? 'bg-primary-700 text-white shadow-2xs'
                                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                        }`}
                    >
                        Inventory ({items.length})
                    </button>
                </div>
            </div>

            {/* Notifications */}
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

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
                <div className="space-y-6">

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-5 shadow-2xs flex items-center gap-4">
                            <div className="w-11 h-11 bg-primary-50 dark:bg-darkSurface-surface text-primary-700 dark:text-primary-400 rounded-xl flex items-center justify-center flex-shrink-0 border border-primary-100 dark:border-darkSurface-border">
                                <Compass className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Registered Farms</span>
                                <h3 className="font-display text-2xl font-semibold text-neutral-900 dark:text-neutral-50">{farms.length}</h3>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-5 shadow-2xs flex items-center gap-4">
                            <div className="w-11 h-11 bg-primary-50 dark:bg-darkSurface-surface text-primary-700 dark:text-primary-400 rounded-xl flex items-center justify-center flex-shrink-0 border border-primary-100 dark:border-darkSurface-border">
                                <Sprout className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Active Crops</span>
                                <h3 className="font-display text-2xl font-semibold text-neutral-900 dark:text-neutral-50">{crops.length}</h3>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-5 shadow-2xs flex items-center gap-4">
                            <div className="w-11 h-11 bg-primary-50 dark:bg-darkSurface-surface text-primary-700 dark:text-primary-400 rounded-xl flex items-center justify-center flex-shrink-0 border border-primary-100 dark:border-darkSurface-border">
                                <Package className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Inventory Items</span>
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
                                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Stock Warnings</span>
                                <h3 className="font-display text-2xl font-semibold">{lowStockCount}</h3>
                            </div>
                        </div>
                    </div>

                </div>
            )}

            {/* TAB 2: FARMS MANAGEMENT */}
            {(activeTab === 'overview' || activeTab === 'farms') && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-display text-xl font-semibold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                            <Compass className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            <span>Farm Profiles ({farms.length})</span>
                        </h3>
                        <button
                            onClick={() => {
                                resetFarmForm();
                                setShowFarmModal(true);
                            }}
                            className="px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white font-medium rounded-btn text-xs transition-colors shadow-2xs flex items-center gap-1.5"
                        >
                            <Plus className="w-4 h-4" /> Add New Farm Profile
                        </button>
                    </div>

                    {farms.length === 0 ? (
                        <div className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-8 text-center">
                            <Compass className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                            <h4 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">No Farm Profiles Registered Yet</h4>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
                                Register your farm profiles with land size, soil type, and irrigation source to track crops and inventory.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {farms.map((farm) => (
                                <div key={farm._id} className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start gap-2">
                                            <div>
                                                <h4 className="font-display font-semibold text-neutral-900 dark:text-neutral-50 text-base">{farm.farmName}</h4>
                                                {farm.locationName && (
                                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mt-0.5">
                                                        <MapPin className="w-3.5 h-3.5 text-accent-600" /> {farm.locationName}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleEditFarm(farm)}
                                                    className="p-1.5 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 rounded-btn transition-colors"
                                                    title="Edit Farm"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteFarm(farm._id)}
                                                    className="p-1.5 text-neutral-400 hover:text-accent-600 rounded-btn transition-colors"
                                                    title="Delete Farm"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 my-4 pt-3 border-t border-neutral-100 dark:border-darkSurface-border text-center text-xs">
                                            <div className="bg-neutral-50 dark:bg-darkSurface-surface p-2 rounded-xl">
                                                <span className="block text-[10px] uppercase font-semibold text-neutral-400">Total Area</span>
                                                <strong className="text-neutral-800 dark:text-neutral-200 text-sm">{farm.totalArea} {farm.areaUnit}</strong>
                                            </div>
                                            <div className="bg-neutral-50 dark:bg-darkSurface-surface p-2 rounded-xl">
                                                <span className="block text-[10px] uppercase font-semibold text-neutral-400">Soil Type</span>
                                                <strong className="text-neutral-800 dark:text-neutral-200 text-sm">{farm.soilType}</strong>
                                            </div>
                                            <div className="bg-neutral-50 dark:bg-darkSurface-surface p-2 rounded-xl">
                                                <span className="block text-[10px] uppercase font-semibold text-neutral-400">Irrigation</span>
                                                <strong className="text-neutral-800 dark:text-neutral-200 text-sm">{farm.irrigationType}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2"></div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 3: CROP LIFECYCLE TRACKING */}
            {(activeTab === 'overview' || activeTab === 'crops') && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-display text-xl font-semibold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                            <Sprout className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            <span>Crop Lifecycle & Growth Stages ({crops.length})</span>
                        </h3>
                        <button
                            onClick={() => setShowCropModal(true)}
                            disabled={farms.length === 0}
                            className="px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white font-medium rounded-btn text-xs transition-colors shadow-2xs flex items-center gap-1.5 disabled:opacity-50"
                        >
                            <Plus className="w-4 h-4" /> Track New Crop
                        </button>
                    </div>

                    {farms.length === 0 && (
                        <p className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-800/60">
                            Please add at least one Farm Profile above before tracking crop lifecycles.
                        </p>
                    )}

                    {crops.length === 0 ? (
                        <div className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-8 text-center">
                            <Sprout className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                            <h4 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">No Crop Lifecycles Tracked Yet</h4>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
                                Add crops to your farms to monitor growth stages, track field activities, and link chemical applications.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {crops.map((crop) => {
                                const currentStageIndex = CROP_STAGES.indexOf(crop.currentStage);

                                return (
                                    <div key={crop._id} className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-6 shadow-2xs space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-display font-semibold text-lg text-neutral-900 dark:text-neutral-50">{crop.cropName}</h4>
                                                    {crop.variety && (
                                                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-neutral-100 dark:bg-darkSurface-surface text-neutral-700 dark:text-neutral-300">
                                                            Var: {crop.variety}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                                                    Farm: <span className="font-semibold text-neutral-700 dark:text-neutral-300">{crop.farm?.farmName || 'My Farm'}</span> | Sown on: {new Date(crop.sowingDate).toLocaleDateString()}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setSelectedCropForActivity(crop)}
                                                    className="px-3 py-1.5 bg-neutral-100 dark:bg-darkSurface-surface hover:bg-neutral-200 dark:hover:bg-darkSurface-hover text-neutral-800 dark:text-neutral-200 text-xs font-medium rounded-btn transition-colors border border-neutral-200 dark:border-darkSurface-border flex items-center gap-1"
                                                >
                                                    <Plus className="w-3.5 h-3.5" /> Log Activity
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCrop(crop._id)}
                                                    className="p-1.5 text-neutral-400 hover:text-accent-600 rounded-btn transition-colors"
                                                    title="Delete Crop"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Stage Timeline */}
                                        <div className="pt-2">
                                            <span className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                                                Growth Stage Progress Timeline
                                            </span>
                                            <div className="grid grid-cols-2 sm:grid-cols-7 gap-1">
                                                {CROP_STAGES.map((stage, idx) => {
                                                    const isCompleted = idx < currentStageIndex;
                                                    const isCurrent = idx === currentStageIndex;

                                                    return (
                                                        <button
                                                            key={stage}
                                                            onClick={() => handleUpdateCropStage(crop._id, stage)}
                                                            className={`p-2 text-center rounded-xl text-xs font-semibold transition-all border ${
                                                                isCurrent
                                                                    ? 'bg-primary-700 text-white border-primary-800 shadow-2xs scale-105'
                                                                    : isCompleted
                                                                    ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-800 dark:text-primary-300 border-primary-200 dark:border-primary-800/60'
                                                                    : 'bg-neutral-50 dark:bg-darkSurface-surface text-neutral-400 border-neutral-200 dark:border-darkSurface-border hover:bg-neutral-100'
                                                            }`}
                                                        >
                                                            {stage}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Field Activity Log History */}
                                        {crop.activities?.length > 0 && (
                                            <details className="text-xs text-neutral-600 dark:text-neutral-400 pt-2 border-t border-neutral-100 dark:border-darkSurface-border">
                                                <summary className="cursor-pointer font-semibold text-neutral-800 dark:text-neutral-200 hover:underline">
                                                    View Field Activity Logs ({crop.activities.length})
                                                </summary>
                                                <div className="mt-2 space-y-2 pl-2">
                                                    {crop.activities.map((act, i) => (
                                                        <div key={i} className="bg-neutral-50 dark:bg-darkSurface-surface p-2.5 rounded-xl border border-neutral-200 dark:border-darkSurface-border flex justify-between items-center">
                                                            <div>
                                                                <span className="font-bold text-neutral-900 dark:text-neutral-100">{act.activityType}: </span>
                                                                <span>{act.description}</span>
                                                            </div>
                                                            <span className="text-[11px] text-neutral-400">{new Date(act.date).toLocaleDateString()}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </details>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 4: INVENTORY MANAGEMENT */}
            {(activeTab === 'overview' || activeTab === 'inventory') && (
                <div className="space-y-6">
                    {/* Add Item Card */}
                    <div className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-6 shadow-2xs">
                        <h3 className="font-display text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                            <span>Add Chemical or Fertilizer to Farm Stock</span>
                        </h3>

                        <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                            <div className="sm:col-span-5">
                                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 uppercase tracking-wider">
                                    Select Product Catalog
                                </label>
                                <select
                                    value={selectedProduct}
                                    onChange={(e) => setSelectedProduct(e.target.value)}
                                    required
                                    className="w-full px-3.5 py-2.5 border border-neutral-300 dark:border-darkSurface-border rounded-btn bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                                >
                                    <option value="">Choose a registered product...</option>
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

                            <div className="sm:col-span-4 flex gap-2">
                                <div className="flex-1">
                                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 uppercase tracking-wider">
                                        Unit
                                    </label>
                                    <select
                                        value={unit}
                                        onChange={(e) => setUnit(e.target.value)}
                                        className="w-full px-3.5 py-2.5 border border-neutral-300 dark:border-darkSurface-border rounded-btn bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                                    >
                                        <option value="liters">Liters</option>
                                        <option value="kg">Kg</option>
                                        <option value="packets">Packets</option>
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    disabled={adding}
                                    className="px-5 py-2.5 bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-btn transition-colors shadow-2xs disabled:opacity-50 flex items-center justify-center flex-shrink-0 text-sm"
                                >
                                    {adding ? 'Adding...' : 'Add'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Inventory Items Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {items.map((item) => {
                            const pctRemaining = Math.max(0, Math.min(100, (item.quantityRemaining / item.quantityPurchased) * 100));
                            const isLow = item.quantityRemaining <= 1;

                            return (
                                <div key={item._id} className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col justify-between">
                                    <div>
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

                                        <div className="my-3">
                                            <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                                                <span>Stock Remaining</span>
                                                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                                                    {item.quantityRemaining} / {item.quantityPurchased} {item.unit}
                                                </span>
                                            </div>
                                            <div className="w-full h-2 bg-neutral-100 dark:bg-darkSurface-surface rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-300 ${isLow ? 'bg-accent-600' : 'bg-primary-600'}`}
                                                    style={{ width: `${pctRemaining}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

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
                                                onClick={() => handleDeleteInventory(item._id)}
                                                className="px-3 py-1.5 bg-neutral-100 dark:bg-darkSurface-surface hover:bg-accent-50 dark:hover:bg-accent-950/40 text-neutral-600 dark:text-neutral-400 hover:text-accent-700 dark:hover:text-accent-300 text-xs font-medium rounded-btn transition-colors flex items-center gap-1 border border-neutral-200 dark:border-darkSurface-border"
                                                title="Delete Item"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

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
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* --- MODAL 1: ADD/EDIT FARM PROFILE --- */}
            {showFarmModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
                        <h3 className="font-display text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                            {editingFarmId ? 'Edit Farm Profile' : 'Register New Farm Profile'}
                        </h3>
                        <form onSubmit={handleSaveFarm} className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-neutral-700 dark:text-neutral-300 mb-1">Farm Name *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Green Valley Farm"
                                    value={farmName}
                                    onChange={(e) => setFarmName(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border border-neutral-300 dark:border-darkSurface-border rounded-btn text-xs bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-neutral-700 dark:text-neutral-300 mb-1">Village / Location</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Rampur Village"
                                    value={locationName}
                                    onChange={(e) => setLocationName(e.target.value)}
                                    className="w-full px-3 py-2 border border-neutral-300 dark:border-darkSurface-border rounded-btn text-xs bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-neutral-700 dark:text-neutral-300 mb-1">Total Area *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        placeholder="5"
                                        value={totalArea}
                                        onChange={(e) => setTotalArea(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 border border-neutral-300 dark:border-darkSurface-border rounded-btn text-xs bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-neutral-700 dark:text-neutral-300 mb-1">Unit</label>
                                    <select
                                        value={areaUnit}
                                        onChange={(e) => setAreaUnit(e.target.value)}
                                        className="w-full px-3 py-2 border border-neutral-300 dark:border-darkSurface-border rounded-btn text-xs bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100"
                                    >
                                        <option value="acres">Acres</option>
                                        <option value="hectares">Hectares</option>
                                        <option value="bigha">Bigha</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-neutral-700 dark:text-neutral-300 mb-1">Soil Type</label>
                                    <select
                                        value={soilType}
                                        onChange={(e) => setSoilType(e.target.value)}
                                        className="w-full px-3 py-2 border border-neutral-300 dark:border-darkSurface-border rounded-btn text-xs bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100"
                                    >
                                        <option value="Loam">Loam</option>
                                        <option value="Clay">Clay</option>
                                        <option value="Sandy">Sandy</option>
                                        <option value="Black">Black Soil</option>
                                        <option value="Red">Red Soil</option>
                                        <option value="Alluvial">Alluvial</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-neutral-700 dark:text-neutral-300 mb-1">Irrigation Source</label>
                                    <select
                                        value={irrigationType}
                                        onChange={(e) => setIrrigationType(e.target.value)}
                                        className="w-full px-3 py-2 border border-neutral-300 dark:border-darkSurface-border rounded-btn text-xs bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100"
                                    >
                                        <option value="Rainfed">Rainfed</option>
                                        <option value="Drip">Drip Irrigation</option>
                                        <option value="Canal">Canal</option>
                                        <option value="Well/Borewell">Borewell</option>
                                        <option value="Sprinkler">Sprinkler</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setShowFarmModal(false)}
                                    className="px-4 py-2 bg-neutral-100 dark:bg-darkSurface-surface hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300 text-xs rounded-btn font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingFarm}
                                    className="px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white text-xs rounded-btn font-medium disabled:opacity-50"
                                >
                                    {savingFarm ? 'Saving...' : 'Save Farm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL 2: ADD CROP TRACKING --- */}
            {showCropModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
                        <h3 className="font-display text-lg font-semibold text-neutral-900 dark:text-neutral-50">Track Crop Lifecycle</h3>
                        <form onSubmit={handleSaveCrop} className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-neutral-700 dark:text-neutral-300 mb-1">Select Farm Profile *</label>
                                <select
                                    value={cropFarmId}
                                    onChange={(e) => setCropFarmId(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border border-neutral-300 dark:border-darkSurface-border rounded-btn text-xs bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100"
                                >
                                    <option value="">Select Farm...</option>
                                    {farms.map((f) => (
                                        <option key={f._id} value={f._id}>{f.farmName} ({f.totalArea} {f.areaUnit})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-neutral-700 dark:text-neutral-300 mb-1">Crop Name *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Wheat, Paddy"
                                        value={cropName}
                                        onChange={(e) => setCropName(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 border border-neutral-300 dark:border-darkSurface-border rounded-btn text-xs bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-neutral-700 dark:text-neutral-300 mb-1">Variety</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. HD-2967"
                                        value={cropVariety}
                                        onChange={(e) => setCropVariety(e.target.value)}
                                        className="w-full px-3 py-2 border border-neutral-300 dark:border-darkSurface-border rounded-btn text-xs bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-neutral-700 dark:text-neutral-300 mb-1">Sowing Date *</label>
                                    <input
                                        type="date"
                                        value={sowingDate}
                                        onChange={(e) => setSowingDate(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 border border-neutral-300 dark:border-darkSurface-border rounded-btn text-xs bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-neutral-700 dark:text-neutral-300 mb-1">Current Stage</label>
                                    <select
                                        value={currentStage}
                                        onChange={(e) => setCurrentStage(e.target.value)}
                                        className="w-full px-3 py-2 border border-neutral-300 dark:border-darkSurface-border rounded-btn text-xs bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100"
                                    >
                                        {CROP_STAGES.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCropModal(false)}
                                    className="px-4 py-2 bg-neutral-100 dark:bg-darkSurface-surface hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300 text-xs rounded-btn font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingCrop}
                                    className="px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white text-xs rounded-btn font-medium disabled:opacity-50"
                                >
                                    {savingCrop ? 'Saving...' : 'Track Crop'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL 3: LOG FIELD ACTIVITY --- */}
            {selectedCropForActivity && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
                        <h3 className="font-display text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                            Log Field Activity — {selectedCropForActivity.cropName}
                        </h3>
                        <form onSubmit={handleAddCropActivity} className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-neutral-700 dark:text-neutral-300 mb-1">Activity Type</label>
                                <select
                                    value={activityType}
                                    onChange={(e) => setActivityType(e.target.value)}
                                    className="w-full px-3 py-2 border border-neutral-300 dark:border-darkSurface-border rounded-btn text-xs bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100"
                                >
                                    <option value="Fertilizer">Fertilizer Application</option>
                                    <option value="Pesticide">Pesticide Application</option>
                                    <option value="Irrigation">Irrigation</option>
                                    <option value="Weeding">Weeding</option>
                                    <option value="Harvesting">Harvesting</option>
                                    <option value="Other">Other Field Work</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-neutral-700 dark:text-neutral-300 mb-1">Description *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Applied 25kg Urea during tillering stage"
                                    value={activityDesc}
                                    onChange={(e) => setActivityDesc(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border border-neutral-300 dark:border-darkSurface-border rounded-btn text-xs bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-neutral-700 dark:text-neutral-300 mb-1">Deduct from Chemical Inventory (Optional)</label>
                                <select
                                    value={linkInventoryId}
                                    onChange={(e) => setLinkInventoryId(e.target.value)}
                                    className="w-full px-3 py-2 border border-neutral-300 dark:border-darkSurface-border rounded-btn text-xs bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100"
                                >
                                    <option value="">None (Don't auto-deduct)</option>
                                    {items.map((i) => (
                                        <option key={i._id} value={i._id}>
                                            {i.product?.name} ({i.quantityRemaining} {i.unit} available)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {linkInventoryId && (
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-neutral-700 dark:text-neutral-300 mb-1">Quantity Used</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        placeholder="e.g. 1"
                                        value={activityQty}
                                        onChange={(e) => setActivityQty(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 border border-neutral-300 dark:border-darkSurface-border rounded-btn text-xs bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100"
                                    />
                                </div>
                            )}

                            <div className="flex justify-end gap-2 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setSelectedCropForActivity(null)}
                                    className="px-4 py-2 bg-neutral-100 dark:bg-darkSurface-surface hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300 text-xs rounded-btn font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingActivity}
                                    className="px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white text-xs rounded-btn font-medium disabled:opacity-50"
                                >
                                    {savingActivity ? 'Logging...' : 'Save Activity'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}