const { PRICE_WEIGHT, DISTANCE_WEIGHT } = require('../config/ranking');

/**
 * Pure function to rank and decorate dealers for search results.
 *
 * @param {Array} dealers - List of dealer objects with distance and optional stockInfo
 * @param {Object} options - { sort: 'best'|'price'|'distance', productId: string|null, limit: number }
 * @returns {{ count: number, dealers: Array, meta: { sort: string, primaryUnit: string|null } }}
 */
function rankDealers(dealers = [], options = {}) {
    const sortMode = options.sort === 'price' || options.sort === 'distance' ? options.sort : 'best';
    const limit = options.limit || 20;
    const hasProduct = Boolean(options.productId);

    if (!Array.isArray(dealers) || dealers.length === 0) {
        return {
            count: 0,
            dealers: [],
            meta: {
                sort: sortMode,
                primaryUnit: null,
            },
        };
    }

    // Clone objects so we don't mutate input
    const allDealers = dealers.map((d) => ({ ...d }));

    // Global minimum distance for 'nearest' badge
    let minGlobalDistance = Infinity;
    for (const d of allDealers) {
        const dist = typeof d.distance === 'number' ? d.distance : Infinity;
        if (dist < minGlobalDistance) {
            minGlobalDistance = dist;
        }
    }

    if (!hasProduct) {
        // Distance ascending by default
        allDealers.sort((a, b) => {
            const distA = typeof a.distance === 'number' ? a.distance : Infinity;
            const distB = typeof b.distance === 'number' ? b.distance : Infinity;
            if (distA !== distB) return distA - distB;
            return (a.storeName || '').localeCompare(b.storeName || '');
        });

        const sliced = allDealers.slice(0, limit).map((d, index) => {
            const badges = [];
            if (typeof d.distance === 'number' && d.distance === minGlobalDistance && minGlobalDistance !== Infinity) {
                badges.push('nearest');
            }
            return {
                ...d,
                rank: index + 1,
                badges,
            };
        });

        return {
            count: sliced.length,
            dealers: sliced,
            meta: {
                sort: sortMode,
                primaryUnit: null,
            },
        };
    }

    // Product is present: split into priced and unpriced
    const priced = [];
    const unpriced = [];

    for (const d of allDealers) {
        const price = d.stockInfo?.price;
        if (price !== null && price !== undefined && typeof price === 'number' && Number.isFinite(price)) {
            priced.push(d);
        } else {
            unpriced.push(d);
        }
    }

    let primaryUnit = null;

    if (priced.length > 0) {
        // Count unit frequency
        const unitCounts = {};
        for (const d of priced) {
            const u = d.stockInfo?.unit || 'liters';
            unitCounts[u] = (unitCounts[u] || 0) + 1;
        }

        // Find unit with max count; tie-break: unit of nearest priced dealer
        let maxCount = -1;
        let candidateUnits = [];
        for (const [u, count] of Object.entries(unitCounts)) {
            if (count > maxCount) {
                maxCount = count;
                candidateUnits = [u];
            } else if (count === maxCount) {
                candidateUnits.push(u);
            }
        }

        if (candidateUnits.length === 1) {
            primaryUnit = candidateUnits[0];
        } else {
            // Find nearest priced dealer among candidateUnits
            let nearestDist = Infinity;
            let nearestUnit = candidateUnits[0];
            for (const d of priced) {
                const u = d.stockInfo?.unit || 'liters';
                if (candidateUnits.includes(u)) {
                    const dist = typeof d.distance === 'number' ? d.distance : Infinity;
                    if (dist < nearestDist) {
                        nearestDist = dist;
                        nearestUnit = u;
                    }
                }
            }
            primaryUnit = nearestUnit;
        }
    }

    const comparable = [];
    const otherUnit = [];

    for (const d of priced) {
        if (d.stockInfo?.unit === primaryUnit) {
            comparable.push(d);
        } else {
            otherUnit.push(d);
        }
    }

    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let minCompDist = Infinity;
    let maxCompDist = -Infinity;

    if (comparable.length > 0) {
        for (const d of comparable) {
            const p = d.stockInfo.price;
            const dist = typeof d.distance === 'number' ? d.distance : 0;
            if (p < minPrice) minPrice = p;
            if (p > maxPrice) maxPrice = p;
            if (dist < minCompDist) minCompDist = dist;
            if (dist > maxCompDist) maxCompDist = dist;
        }

        for (const d of comparable) {
            const p = d.stockInfo.price;
            const dist = typeof d.distance === 'number' ? d.distance : 0;
            const priceNorm = maxPrice === minPrice ? 0 : (p - minPrice) / (maxPrice - minPrice);
            const distNorm = maxCompDist === minCompDist ? 0 : (dist - minCompDist) / (maxCompDist - minCompDist);
            d._score = PRICE_WEIGHT * priceNorm + DISTANCE_WEIGHT * distNorm;
        }
    }

    const compareByDistanceThenStore = (a, b) => {
        const distA = typeof a.distance === 'number' ? a.distance : Infinity;
        const distB = typeof b.distance === 'number' ? b.distance : Infinity;
        if (distA !== distB) return distA - distB;
        return (a.storeName || '').localeCompare(b.storeName || '');
    };

    let orderedDealers = [];

    if (sortMode === 'best') {
        comparable.sort((a, b) => {
            if (a._score !== b._score) return a._score - b._score;
            const distA = typeof a.distance === 'number' ? a.distance : Infinity;
            const distB = typeof b.distance === 'number' ? b.distance : Infinity;
            if (distA !== distB) return distA - distB;
            const priceA = a.stockInfo?.price ?? Infinity;
            const priceB = b.stockInfo?.price ?? Infinity;
            if (priceA !== priceB) return priceA - priceB;
            return (a.storeName || '').localeCompare(b.storeName || '');
        });

        otherUnit.sort(compareByDistanceThenStore);
        unpriced.sort(compareByDistanceThenStore);

        orderedDealers = [...comparable, ...otherUnit, ...unpriced];
    } else if (sortMode === 'price') {
        comparable.sort((a, b) => {
            const priceA = a.stockInfo?.price ?? Infinity;
            const priceB = b.stockInfo?.price ?? Infinity;
            if (priceA !== priceB) return priceA - priceB;
            const distA = typeof a.distance === 'number' ? a.distance : Infinity;
            const distB = typeof b.distance === 'number' ? b.distance : Infinity;
            if (distA !== distB) return distA - distB;
            return (a.storeName || '').localeCompare(b.storeName || '');
        });

        otherUnit.sort(compareByDistanceThenStore);
        unpriced.sort(compareByDistanceThenStore);

        orderedDealers = [...comparable, ...otherUnit, ...unpriced];
    } else {
        // sort === 'distance'
        allDealers.sort((a, b) => {
            const distA = typeof a.distance === 'number' ? a.distance : Infinity;
            const distB = typeof b.distance === 'number' ? b.distance : Infinity;
            if (distA !== distB) return distA - distB;
            const priceA = a.stockInfo?.price ?? Infinity;
            const priceB = b.stockInfo?.price ?? Infinity;
            if (priceA !== priceB) return priceA - priceB;
            return (a.storeName || '').localeCompare(b.storeName || '');
        });
        orderedDealers = allDealers;
    }

    const sliced = orderedDealers.slice(0, limit).map((d, index) => {
        const badges = [];
        if (
            comparable.length > 0 &&
            d.stockInfo?.unit === primaryUnit &&
            d.stockInfo?.price === minPrice &&
            minPrice !== Infinity
        ) {
            badges.push('lowest_price');
        }
        if (typeof d.distance === 'number' && d.distance === minGlobalDistance && minGlobalDistance !== Infinity) {
            badges.push('nearest');
        }

        const { _score, ...cleanDealer } = d;
        return {
            ...cleanDealer,
            rank: index + 1,
            badges,
        };
    });

    return {
        count: sliced.length,
        dealers: sliced,
        meta: {
            sort: sortMode,
            primaryUnit,
        },
    };
}

module.exports = { rankDealers };
