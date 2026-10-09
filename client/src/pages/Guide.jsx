import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContent';
import {
    BookOpen,
    User,
    Store,
    ChevronDown,
    CheckCircle2,
    ArrowRight,
    Search,
    Package,
    MapPin,
    ShieldCheck,
    Lock,
    HelpCircle,
} from 'lucide-react';

export default function Guide() {
    const { user } = useAuth();
    const location = useLocation();

    // Default tab based on role or hash
    const getInitialTab = () => {
        if (location.hash === '#dealer') return 'dealer';
        if (location.hash === '#farmer') return 'farmer';
        if (user?.role === 'dealer') return 'dealer';
        return 'farmer';
    };

    const [activeTab, setActiveTab] = useState(getInitialTab);
    const [openFaq, setOpenFaq] = useState(null);

    useEffect(() => {
        if (location.hash === '#dealer') setActiveTab('dealer');
        if (location.hash === '#farmer') setActiveTab('farmer');
    }, [location.hash]);

    const farmerSteps = [
        {
            num: 1,
            title: 'Create your account',
            desc: 'Register and choose "Farmer".',
            icon: User,
        },
        {
            num: 2,
            title: 'Browse the product catalog',
            desc: 'See licensed pesticides and fertilizers, their active ingredient, licence number and which crops they are registered for.',
            icon: Package,
        },
        {
            num: 3,
            title: 'Track your stock',
            desc: 'In My Inventory add what you bought, log each use, and watch the low-stock and expiry alerts.',
            icon: CheckCircle2,
        },
        {
            num: 4,
            title: 'Find a dealer',
            desc: 'Open Find Dealers, allow location access, choose a product and a radius. You see only verified dealers who are open today and have the product in stock. Dealers are ordered by a mix of lower price and shorter distance.',
            icon: Search,
        },
        {
            num: 5,
            title: 'Get there',
            desc: 'Tap the map-pin icon on a dealer to open Google Maps.',
            icon: MapPin,
        },
        {
            num: 6,
            title: 'Manage your account',
            desc: 'You can delete your account any time from Account settings.',
            icon: Lock,
        },
    ];

    const dealerSteps = [
        {
            num: 1,
            title: 'Create your account',
            desc: 'Register and choose "Dealer".',
            icon: Store,
        },
        {
            num: 2,
            title: 'Set up your store',
            desc: 'If your email address is in the licensed-dealer registry, verify your email with a one-time code and your details are filled in automatically and your store is verified instantly. If it is not, fill in your details and an admin will review them.',
            icon: ShieldCheck,
        },
        {
            num: 3,
            title: 'Pin your store',
            desc: 'Set the exact location on the map so farmers can find you.',
            icon: MapPin,
        },
        {
            num: 4,
            title: 'Add your products',
            desc: 'Choose products, set quantity and your own price per unit. Prices are visible to farmers in search results only, never in the catalog.',
            icon: Package,
        },
        {
            num: 5,
            title: 'Open your store every day',
            desc: 'Your store stays closed until you open it each day. Closed stores are hidden from search.',
            icon: CheckCircle2,
        },
        {
            num: 6,
            title: 'Keep stock and prices current',
            desc: 'Out-of-stock products are hidden from search.',
            icon: Search,
        },
    ];

    const faqs = [
        {
            q: "Why can't farmers see my store?",
            a: 'It must be verified, opened today, and have the product in stock.',
        },
        {
            q: 'Why is my store "pending"?',
            a: 'Your email was not found in the registry, so an admin must review your licence details.',
        },
        {
            q: 'How are dealers ranked?',
            a: 'By a combination of lower price and shorter distance among dealers selling in the same unit. You can also sort by lowest price or nearest.',
        },
        {
            q: 'Is Kisan Netra selling pesticides?',
            a: 'No. It is an information platform. Always read the product label and follow advice from your local agriculture officer.',
        },
        {
            q: 'Can I delete my account?',
            a: 'Yes, from Account settings.',
        },
    ];

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const getDashboardUrl = () => {
        if (!user) return '/register';
        if (user.role === 'farmer') return '/farmer/dashboard';
        if (user.role === 'dealer') return '/dealers/dashboard';
        if (user.role === 'admin') return '/admin';
        return '/';
    };

    const getCtaLabel = () => {
        if (!user) return 'Get Started — Register Now';
        if (user.role === 'farmer') return 'Go to Farmer Dashboard';
        if (user.role === 'dealer') return 'Go to Dealer Store';
        if (user.role === 'admin') return 'Go to Admin Panel';
        return 'Go to Dashboard';
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
            {/* Header */}
            <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-800 dark:text-primary-300 border border-primary-200 dark:border-primary-800/60 text-xs font-semibold">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>How to Use Kisan Netra</span>
                </div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
                    User Guidance & Knowledge Hub
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base max-w-2xl mx-auto">
                    A comprehensive guide for farmers and licensed input dealers to streamline crop protection, stock verification, and geo-discovery.
                </p>
            </div>

            {/* Role Tabs */}
            <div className="flex justify-center">
                <div className="inline-flex p-1 rounded-xl bg-neutral-100 dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border" role="tablist">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === 'farmer'}
                        onClick={() => setActiveTab('farmer')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                            activeTab === 'farmer'
                                ? 'bg-white dark:bg-darkSurface-surface text-primary-800 dark:text-primary-300 shadow-xs border border-neutral-200 dark:border-darkSurface-border'
                                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                        }`}
                    >
                        <User className="w-4 h-4" />
                        <span>I'm a Farmer</span>
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === 'dealer'}
                        onClick={() => setActiveTab('dealer')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                            activeTab === 'dealer'
                                ? 'bg-white dark:bg-darkSurface-surface text-accent-800 dark:text-accent-300 shadow-xs border border-neutral-200 dark:border-darkSurface-border'
                                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                        }`}
                    >
                        <Store className="w-4 h-4" />
                        <span>I'm a Dealer</span>
                    </button>
                </div>
            </div>

            {/* Steps Section */}
            <div className="space-y-4">
                <h2 className="font-display text-xl font-semibold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                    <span>{activeTab === 'farmer' ? 'Farmer Workflow Guide' : 'Dealer Setup & Management'}</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(activeTab === 'farmer' ? farmerSteps : dealerSteps).map((step) => {
                        const Icon = step.icon;
                        return (
                            <div
                                key={step.num}
                                className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-2xl p-5 shadow-2xs hover:border-primary-300 dark:hover:border-primary-700 transition-all flex gap-4"
                            >
                                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-darkSurface-surface text-primary-700 dark:text-primary-400 border border-primary-100 dark:border-darkSurface-border flex items-center justify-center font-bold text-sm flex-shrink-0">
                                    {step.num}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-display font-semibold text-neutral-900 dark:text-neutral-100 text-sm flex items-center gap-1.5">
                                        <span>{step.title}</span>
                                    </h3>
                                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                        {step.desc}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* FAQ Accordion */}
            <div className="space-y-4 pt-4">
                <h2 className="font-display text-xl font-semibold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                    <span>Frequently Asked Questions</span>
                </h2>

                <div className="space-y-2.5">
                    {faqs.map((faq, index) => {
                        const isOpen = openFaq === index;
                        return (
                            <div
                                key={index}
                                className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-xl overflow-hidden transition-colors"
                            >
                                <button
                                    type="button"
                                    onClick={() => toggleFaq(index)}
                                    aria-expanded={isOpen}
                                    className="w-full px-5 py-4 text-left flex justify-between items-center gap-4 hover:bg-neutral-50 dark:hover:bg-darkSurface-surface transition-colors focus:outline-none"
                                >
                                    <span className="font-display text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                        {faq.q}
                                    </span>
                                    <ChevronDown
                                        className={`w-4 h-4 text-neutral-500 transition-transform duration-200 flex-shrink-0 ${
                                            isOpen ? 'transform rotate-180 text-primary-600' : ''
                                        }`}
                                    />
                                </button>
                                {isOpen && (
                                    <div className="px-5 pb-4 text-xs text-neutral-600 dark:text-neutral-400 border-t border-neutral-100 dark:border-darkSurface-border pt-3 leading-relaxed">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Call to Action */}
            <div className="bg-primary-900 text-white rounded-2xl p-8 text-center space-y-4 shadow-md">
                <h3 className="font-display text-2xl font-bold text-white">Ready to streamline your agricultural supply chain?</h3>
                <p className="text-primary-100 text-sm max-w-xl mx-auto">
                    Join thousands of verified farmers and licensed agricultural retailers across the region.
                </p>
                <div className="pt-2">
                    <Link
                        to={getDashboardUrl()}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-accent-600 hover:bg-accent-700 text-white font-semibold rounded-btn text-sm shadow-sm transition-colors"
                    >
                        <span>{getCtaLabel()}</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
