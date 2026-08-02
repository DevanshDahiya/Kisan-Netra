const mongoose = require('mongoose');
const request = require('supertest');
require('dotenv').config();
const app = require('../src/app');
const User = require('../src/models/User');
const Dealer = require('../src/models/Dealer');
const Product = require('../src/models/Product');
const DealerStock = require('../src/models/DealerStock');
const connectDB = require('../src/config/db');

const TEST_DB_URI = process.env.MONGO_URI.replace(/\/[^/?]+(\?|$)/, '/kisan-netra-test$1');

const NEAR_POINT = { lng: 72.5714, lat: 23.0225 };
const NEARBY_DEALER_POINT = { lng: 72.62, lat: 23.05 };
const FAR_DEALER_POINT = { lng: 77.209, lat: 28.6139 };

// Override MONGO_URI so connectDB picks up the test database
process.env.MONGO_URI = TEST_DB_URI;

beforeAll(async () => {
    // Only connect if not already connected (avoids conflict with app startup)
    if (mongoose.connection.readyState === 0) {
        await connectDB();
    }
}, 60000); // 60 second timeout for slow Atlas connections

afterEach(async () => {
    await User.deleteMany({});
    await Dealer.deleteMany({});
    await Product.deleteMany({});
    await DealerStock.deleteMany({});
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
}, 30000);

// Helper: registers a dealer, creates their verified store at a given point
async function createVerifiedDealer(point, storeName) {
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send({
        name: storeName,
        email: `${storeName.replace(/\s/g, '').toLowerCase()}@test.com`,
        password: 'password123',
        role: 'dealer',
    });

    const dealerRes = await agent.post('/api/dealers').send({
        storeName,
        address: 'Test Address',
        licenseNumber: `LIC-${Math.random().toString(36).slice(2, 8)}`,
        longitude: point.lng,
        latitude: point.lat,
    });

    const dealer = await Dealer.findByIdAndUpdate(
        dealerRes.body.dealer._id,
        { isVerified: true },
        { new: true }
    );

    return { agent, dealer };
}

describe('Nearby dealer geo-search', () => {
    test('finds a dealer within radius, excludes one far away', async () => {
        await createVerifiedDealer(NEARBY_DEALER_POINT, 'Near Store');
        await createVerifiedDealer(FAR_DEALER_POINT, 'Far Store');

        const res = await request(app).get('/api/dealers/nearby').query({
            lng: NEAR_POINT.lng,
            lat: NEAR_POINT.lat,
            radius: 20, // 20km - should catch "Near Store" but not "Far Store"
        });

        expect(res.status).toBe(200);
        const names = res.body.dealers.map((d) => d.storeName);
        expect(names).toContain('Near Store');
        expect(names).not.toContain('Far Store');
    });

    test('unverified dealers do not appear in search results', async () => {
        await createVerifiedDealer(NEARBY_DEALER_POINT, 'Unverified Store');
        const dealer = await Dealer.findOne({ storeName: 'Unverified Store' });
        dealer.isVerified = false;
        await dealer.save();

        const res = await request(app).get('/api/dealers/nearby').query({
            lng: NEAR_POINT.lng,
            lat: NEAR_POINT.lat,
            radius: 20,
        });

        const names = res.body.dealers.map((d) => d.storeName);
        expect(names).not.toContain('Unverified Store');
    });

    test('filters results to only dealers stocking the requested product', async () => {
        const { agent: agentA, dealer: dealerA } = await createVerifiedDealer(NEARBY_DEALER_POINT, 'Store A');
        await createVerifiedDealer(NEARBY_DEALER_POINT, 'Store B');

        const product = await Product.create({
            name: 'Test Pesticide',
            category: 'pesticide',
            licenseNumber: 'LIC-TESTPROD',
        });

        // Only Store A stocks this product
        await agentA.post(`/api/dealers/${dealerA._id}/stock`).send({
            product: product._id,
            quantityAvailable: 10,
            unit: 'liters',
        });

        const res = await request(app).get('/api/dealers/nearby').query({
            lng: NEAR_POINT.lng,
            lat: NEAR_POINT.lat,
            radius: 20,
            productId: product._id.toString(),
        });

        const names = res.body.dealers.map((d) => d.storeName);
        expect(names).toContain('Store A');
        expect(names).not.toContain('Store B');
    });

    test('requires lng and lat query parameters', async () => {
        const res = await request(app).get('/api/dealers/nearby');
        expect(res.status).toBe(400);
    });
});