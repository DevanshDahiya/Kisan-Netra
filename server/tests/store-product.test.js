const mongoose = require('mongoose');
const request = require('supertest');
require('dotenv').config();
const app = require('../src/app');
const User = require('../src/models/User');
const Dealer = require('../src/models/Dealer');
const Product = require('../src/models/Product');
const DealerStock = require('../src/models/DealerStock');
const FarmerInventory = require('../src/models/FarmerInventory');
const connectDB = require('../src/config/db');

const TEST_DB_URI = process.env.MONGO_URI.replace(/\/[^/?]+(\?|$)/, '/kisan-netra-test$1');
process.env.MONGO_URI = TEST_DB_URI;

beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
        await connectDB();
    }
}, 60000);

afterEach(async () => {
    await User.deleteMany({});
    await Dealer.deleteMany({});
    await Product.deleteMany({});
    await DealerStock.deleteMany({});
    await FarmerInventory.deleteMany({});
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
}, 30000);

describe('Daily Store Open/Close & Product Catalog Deletion', () => {
    test('Dealer can mark store open today and close early', async () => {
        const agent = request.agent(app);
        await agent.post('/api/auth/register').send({
            name: 'Store Owner',
            email: 'owner@test.com',
            password: 'password123',
            role: 'dealer',
        });
        await agent.post('/api/auth/login').send({
            email: 'owner@test.com',
            password: 'password123',
        });

        const dealerRes = await agent.post('/api/dealers').send({
            storeName: 'Test Krishi Kendra',
            address: 'Village Center',
            licenseNumber: 'LIC-999',
            longitude: 72.5,
            latitude: 23.0,
        });

        const dealerId = dealerRes.body.dealer._id;

        // Open store
        const openRes = await agent.patch(`/api/dealers/${dealerId}/open-today`);
        expect(openRes.status).toBe(200);
        expect(openRes.body.dealer.isOpenToday).toBe(true);
        expect(openRes.body.dealer.lastOpenedDate).toBe(new Date().toISOString().slice(0, 10));

        // Close store
        const closeRes = await agent.patch(`/api/dealers/${dealerId}/close-today`);
        expect(closeRes.status).toBe(200);
        expect(closeRes.body.dealer.isOpenToday).toBe(false);
    });

    test('Admin can delete unused product, but blocked if product is in use', async () => {
        // Register admin
        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@test.com',
            password: 'password123',
            role: 'admin',
        });

        const adminAgent = request.agent(app);
        await adminAgent.post('/api/auth/login').send({
            email: 'admin@test.com',
            password: 'password123',
        });

        // Create product
        const product = await Product.create({
            name: 'Unused Chemical',
            category: 'pesticide',
            licenseNumber: 'LIC-UNUSED',
        });

        // Delete unused product -> success
        const delRes = await adminAgent.delete(`/api/products/${product._id}`);
        expect(delRes.status).toBe(200);
        expect(delRes.body.message).toBe('Product deleted.');

        // Create product that will be in use
        const inUseProduct = await Product.create({
            name: 'In Use Chemical',
            category: 'herbicide',
            licenseNumber: 'LIC-INUSE',
        });

        const dealer = await Dealer.create({
            user: adminUser._id,
            storeName: 'Admin Mock Store',
            address: 'Main St',
            licenseNumber: 'LIC-MOCK',
            location: { type: 'Point', coordinates: [72.5, 23.0] },
        });

        await DealerStock.create({
            dealer: dealer._id,
            product: inUseProduct._id,
            quantityAvailable: 25,
            unit: 'liters',
        });

        // Try deleting product in use -> 400 Bad Request
        const blockedRes = await adminAgent.delete(`/api/products/${inUseProduct._id}`);
        expect(blockedRes.status).toBe(400);
        expect(blockedRes.body.message).toContain('currently in use by dealers or farmers');
    });
});
