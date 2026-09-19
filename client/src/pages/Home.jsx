import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContent';
import { Search, ShieldCheck, Package, Store, ArrowRight, CheckCircle2, MapPin, Sparkles, Check } from 'lucide-react';
import homeHeroPhoto from '../assets/kisan-netra-hompage-photo.png';
import fieldPhoto from '../assets/kisan-netra-photo-1.jpg';

export default function Home() {
    const { user } = useAuth();

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-16 sm:space-y-20">
            
            {/* Hero Section */}
            <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-12">
                
                {/* Hero Text */}
                <div className="flex-1 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary-50 dark:bg-primary-950/60 text-primary-800 dark:text-primary-300 mb-6 border border-primary-200/80 dark:border-primary-800/60 shadow-2xs">
                        <Sparkles className="w-3.5 h-3.5 text-accent-600 dark:text-accent-400" />
                        <span>Next-Gen Agricultural Input Management</span>
                    </div>
                    
                    <h1 className="font-display text-4xl sm:text-5xl font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight mb-5 leading-[1.15]">
                        Licensed Input Tracking & <br className="hidden sm:inline" />
                        <span className="text-primary-800 dark:text-primary-300">Verified Dealer Discovery</span>
                    </h1>
                    
                    <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed mb-8 max-w-2xl mx-auto lg:mx-0">
                        Kisan Netra bridges Indian farmers and authorized chemical dealers. Track farm chemical usage, eliminate stockouts with automated expiry alerts, and discover open, verified dealers nearby in real time.
                    </p>

                    <div className="flex flex-wrap justify-center lg:justify-start gap-3.5">
                        {user ? (
                            <>
                                {user.role === 'farmer' && (
                                    <Link
                                        to="/search-dealers"
                                        className="px-5 py-3 bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-btn transition-colors shadow-sm hover:shadow flex items-center gap-2 text-sm"
                                    >
                                        <Search className="w-4 h-4" />
                                        <span>Find Nearby Dealers</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                )}
                                {user.role === 'dealer' && (
                                    <Link
                                        to="/dealers/dashboard"
                                        className="px-5 py-3 bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-btn transition-colors shadow-sm hover:shadow flex items-center gap-2 text-sm"
                                    >
                                        <Store className="w-4 h-4" />
                                        <span>Manage Store Profile</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                )}
                                {user.role === 'admin' && (
                                    <Link
                                        to="/admin"
                                        className="px-5 py-3 bg-primary-800 hover:bg-primary-900 text-white font-medium rounded-btn transition-colors shadow-sm hover:shadow flex items-center gap-2 text-sm"
                                    >
                                        <ShieldCheck className="w-4 h-4" />
                                        <span>Admin Control Panel</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                )}
                                <Link
                                    to="/catalog"
                                    className="px-5 py-3 bg-white dark:bg-darkSurface-card hover:bg-neutral-100 dark:hover:bg-darkSurface-hover text-neutral-900 dark:text-neutral-100 font-medium rounded-btn border border-neutral-200 dark:border-darkSurface-border transition-colors flex items-center gap-2 text-sm"
                                >
                                    <Package className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                                    <span>Browse Catalog</span>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/register"
                                    className="px-6 py-3 bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-btn transition-colors shadow-sm hover:shadow flex items-center gap-2 text-sm"
                                >
                                    <span>Get Started Free</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link
                                    to="/login"
                                    className="px-5 py-3 bg-white dark:bg-darkSurface-card hover:bg-neutral-100 dark:hover:bg-darkSurface-hover text-neutral-900 dark:text-neutral-100 font-medium rounded-btn border border-neutral-200 dark:border-darkSurface-border transition-colors text-sm"
                                >
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Trust badges */}
                    <div className="mt-8 pt-6 border-t border-neutral-200/80 dark:border-darkSurface-border flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-neutral-600 dark:text-neutral-400">
                        <div className="flex items-center gap-1.5">
                            <Check className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                            <span>CIB&RC Registered Catalog</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Check className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                            <span>Daily Store Open Verification</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Check className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                            <span>Zero Fake Inputs</span>
                        </div>
                    </div>
                </div>

                {/* Hero Showcase Image */}
                <div className="flex-1 w-full max-w-lg lg:max-w-none">
                    <div className="relative rounded-2xl p-2 bg-gradient-to-b from-neutral-200/60 to-neutral-100 dark:from-darkSurface-card dark:to-darkSurface-border border border-neutral-200 dark:border-darkSurface-border shadow-md overflow-hidden group">
                        <img
                            src={homeHeroPhoto}
                            alt="Kisan Netra Agricultural Platform Preview"
                            className="w-full h-auto rounded-xl object-cover shadow-xs border border-neutral-100/50 dark:border-darkSurface-border transition-transform duration-500 group-hover:scale-[1.01]"
                        />
                        <div className="absolute bottom-4 left-4 right-4 bg-neutral-900/90 dark:bg-darkSurface-surface/90 backdrop-blur-md text-white p-3 rounded-xl border border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-primary-400 animate-pulse"></div>
                                <span className="text-xs font-medium">Real-Time Geolocation & Inventory Live</span>
                            </div>
                            <span className="text-[11px] font-mono text-neutral-300">v2.4 Active</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Feature Cards Grid (Line icons, No pastel chip squares, White cards with 1px neutral border) */}
            <div>
                <div className="text-center max-w-2xl mx-auto mb-10">
                    <h2 className="font-display text-2xl sm:text-3xl font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight">
                        Built Specifically for Agritech & Farm Safety
                    </h2>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-2">
                        Designed around soil, crop health, and strict government compliance rather than generic software abstractions.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Feature 1 */}
                    <div className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-6 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                        <div>
                            <div className="mb-4">
                                <Package className="w-7 h-7 text-primary-600 dark:text-primary-400" />
                            </div>
                            <h3 className="font-display text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-2">
                                Smart Farm Inventory
                            </h3>
                            <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed mb-4">
                                Log chemical purchases, track exact remaining stock in liters or kg, record application dates per crop, and get automated low-stock and expiry warnings.
                            </p>
                        </div>
                        <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400 pt-3 border-t border-neutral-100 dark:border-darkSurface-borderSubtle">
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                                <span>Automated Expiry & Re-order Alerts</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                                <span>Detailed Usage Log by Crop Type</span>
                            </li>
                        </ul>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-6 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                        <div>
                            <div className="mb-4">
                                <MapPin className="w-7 h-7 text-accent-600 dark:text-accent-400" />
                            </div>
                            <h3 className="font-display text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-2">
                                Geo Dealer Discovery
                            </h3>
                            <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed mb-4">
                                Locate verified dealers around your GPS position. Only dealers who actively opened their store today and have verified stock are shown, preventing wasted trips.
                            </p>
                        </div>
                        <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400 pt-3 border-t border-neutral-100 dark:border-darkSurface-borderSubtle">
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-accent-600 dark:text-accent-400 flex-shrink-0" />
                                <span>Daily Open/Close Store Verification</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-accent-600 dark:text-accent-400 flex-shrink-0" />
                                <span>Specific Chemical Stock Filtering</span>
                            </li>
                        </ul>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-6 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                        <div>
                            <div className="mb-4">
                                <ShieldCheck className="w-7 h-7 text-primary-800 dark:text-primary-300" />
                            </div>
                            <h3 className="font-display text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-2">
                                Government License Database
                            </h3>
                            <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed mb-4">
                                Browse official licensed formulations with active ingredients, approved crop uses, and manufacturer validation. Immediate warning tags on restricted chemicals.
                            </p>
                        </div>
                        <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400 pt-3 border-t border-neutral-100 dark:border-darkSurface-borderSubtle">
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                                <span>Admin Verification for Stores</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                                <span>Restricted / Banned Chemical Warnings</span>
                            </li>
                        </ul>
                    </div>

                </div>
            </div>

            {/* Field Operation Showcase Section */}
            <div className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row items-center gap-8 shadow-xs">
                <div className="flex-1 space-y-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-accent-600 dark:text-accent-400">
                        Field-Tested Technology
                    </span>
                    <h3 className="font-display text-2xl sm:text-3xl font-semibold text-neutral-900 dark:text-neutral-50 leading-snug">
                        Authentic Agri-Inputs for Healthier Harvests
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed">
                        Counterfeit pesticides and unauthorized dealers cause severe crop loss every year. Kisan Netra empowers farmers with cryptographic transparency, verifiable dealer licensing, and real-time stock checks before making any purchase.
                    </p>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="p-3 bg-neutral-50 dark:bg-darkSurface-surface rounded-xl border border-neutral-200/80 dark:border-darkSurface-borderSubtle">
                            <span className="font-display text-xl font-bold text-primary-700 dark:text-primary-400">100%</span>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">Licensed input verification</p>
                        </div>
                        <div className="p-3 bg-neutral-50 dark:bg-darkSurface-surface rounded-xl border border-neutral-200/80 dark:border-darkSurface-borderSubtle">
                            <span className="font-display text-xl font-bold text-accent-600 dark:text-accent-400">20km</span>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">Standard geo discovery radius</p>
                        </div>
                    </div>
                </div>
                <div className="w-full lg:w-5/12">
                    <img
                        src={fieldPhoto}
                        alt="Indian Agricultural Operations"
                        className="w-full h-64 sm:h-72 rounded-xl object-cover border border-neutral-200 dark:border-darkSurface-border shadow-xs"
                    />
                </div>
            </div>

            {/* Quick Action / CTA Banner */}
            <div className="bg-primary-900 dark:bg-darkSurface-surface border border-primary-800 dark:border-darkSurface-border rounded-2xl p-8 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-accent-400">
                        Join Verified Network
                    </span>
                    <h3 className="font-display text-2xl font-semibold mt-1 mb-2 text-white">
                        Ready to safeguard your crops and optimize input supply?
                    </h3>
                    <p className="text-neutral-300 text-sm max-w-xl leading-relaxed">
                        Join farmers and licensed agri-dealers operating with total transparency, verified compliance, and geo-targeted stock matching.
                    </p>
                </div>
                <div className="flex gap-3 flex-shrink-0">
                    {!user ? (
                        <Link
                            to="/register"
                            className="px-5 py-2.5 bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-btn transition-colors shadow-xs text-sm"
                        >
                            Create Account
                        </Link>
                    ) : (
                        <Link
                            to="/catalog"
                            className="px-5 py-2.5 bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-btn transition-colors shadow-xs text-sm"
                        >
                            View Product Catalog
                        </Link>
                    )}
                </div>
            </div>

        </div>
    );
}