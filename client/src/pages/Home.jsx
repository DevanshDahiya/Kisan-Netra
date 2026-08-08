import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContent';
import { Sprout, Search, ShieldCheck, Package, Store, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Home() {
    const { user } = useAuth();

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            
            {/* Hero Section */}
            <div className="text-center max-w-3xl mx-auto mb-16">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mb-6 border border-emerald-200 shadow-xs">
                    <Sprout className="w-4 h-4 text-emerald-600" />
                    <span>Next-Gen Agricultural Input Management</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
                    Licensed Input Tracking & <br className="hidden sm:inline" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-indigo-600">
                        Verified Dealer Discovery
                    </span>
                </h1>
                
                <p className="text-lg text-slate-600 leading-relaxed mb-8">
                    Kisan Netra bridges farmers and authorized dealers. Track your crop chemical usage, prevent stockouts with timely alerts, and discover verified genuine inputs nearby.
                </p>

                <div className="flex flex-wrap justify-center gap-4">
                    {user ? (
                        <>
                            {user.role === 'farmer' && (
                                <Link
                                    to="/search-dealers"
                                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                                >
                                    <Search className="w-5 h-5" />
                                    <span>Find Nearby Dealers</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            )}
                            {user.role === 'dealer' && (
                                <Link
                                    to="/dealers/dashboard"
                                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                                >
                                    <Store className="w-5 h-5" />
                                    <span>Manage Store Profile</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            )}
                            {user.role === 'admin' && (
                                <Link
                                    to="/admin"
                                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                                >
                                    <ShieldCheck className="w-5 h-5" />
                                    <span>Open Admin Dashboard</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            )}
                            <Link
                                to="/catalog"
                                className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-900 font-medium rounded-xl transition-all duration-200 flex items-center gap-2"
                            >
                                <Package className="w-5 h-5 text-slate-700" />
                                <span>Browse Product Catalog</span>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/register"
                                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                            >
                                <span>Get Started Free</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                to="/login"
                                className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-900 font-medium rounded-xl transition-all duration-200"
                            >
                                Sign In
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                
                {/* Feature 1 */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-200">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 mb-5">
                        <Package className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Smart Farm Inventory</h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                        Log chemical purchases, track real-time remaining quantities, log crop application dates, and get automatic low-stock alerts.
                    </p>
                    <ul className="space-y-2 text-xs text-slate-600">
                        <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Automated Expiry & Re-order Alerts
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Detailed Usage Log by Crop Type
                        </li>
                    </ul>
                </div>

                {/* Feature 2 */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-200">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 mb-5">
                        <Search className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Geo Dealer Discovery</h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                        Locate verified dealers around your GPS position. Filter by specific pesticides or fertilizers to ensure availability before traveling.
                    </p>
                    <ul className="space-y-2 text-xs text-slate-600">
                        <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Interactive Leaflet Map View
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Real-time Stock Availability
                        </li>
                    </ul>
                </div>

                {/* Feature 3 */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-200">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-700 mb-5">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Government License Database</h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                        Browse official CIB&RC licensed products with active ingredients, manufacturers, and crop safety guidelines. Protect against banned inputs.
                    </p>
                    <ul className="space-y-2 text-xs text-slate-600">
                        <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-amber-600" /> Admin-Verified Dealer Profiles
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-amber-600" /> Banned Chemical Warning Tags
                        </li>
                    </ul>
                </div>

            </div>

            {/* Quick Stats / Info Banner */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Trusted Agri-Network</span>
                    <h3 className="text-2xl font-bold mt-1 mb-2">Ready to optimize your agricultural inputs?</h3>
                    <p className="text-slate-300 text-sm max-w-xl">
                        Join farmers and agricultural dealers operating with total transparency, quality verification, and geo-targeted stock matching.
                    </p>
                </div>
                <div className="flex gap-4 flex-shrink-0">
                    {!user ? (
                        <Link
                            to="/register"
                            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors shadow-sm"
                        >
                            Create Account
                        </Link>
                    ) : (
                        <Link
                            to="/catalog"
                            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors shadow-sm"
                        >
                            View Product Catalog
                        </Link>
                    )}
                </div>
            </div>

        </div>
    );
}