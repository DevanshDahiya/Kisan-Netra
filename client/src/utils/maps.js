/**
 * Generates a Google Maps directions URL for a dealer's coordinates.
 * Dealer coordinates are stored as [longitude, latitude].
 * Google Maps destination format expects latitude,longitude.
 *
 * @param {Object} dealer
 * @returns {string|null}
 */
export function getGoogleMapsUrl(dealer) {
    if (!dealer || !dealer.location || !Array.isArray(dealer.location.coordinates)) {
        return null;
    }

    const [lng, lat] = dealer.location.coordinates;

    if (
        typeof lat !== 'number' ||
        typeof lng !== 'number' ||
        !Number.isFinite(lat) ||
        !Number.isFinite(lng)
    ) {
        return null;
    }

    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}
