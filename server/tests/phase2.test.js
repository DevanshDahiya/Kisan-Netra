const mongoose = require('mongoose');
const request = require('supertest');
require('dotenv').config();
const app = require('../src/app');
const User = require('../src/models/User');
const Dealer = require('../src/models/Dealer');
const DealerStock = require('../src/models/DealerStock');
const Product = require('../src/models/Product');
const Farm = require('../src/models/Farm');
const Crop = require('../src/models/Crop');
const connectDB = require('../src/config/db');

const TEST_DB_URI = process.env.MONGO_URI
    ? process.env.MONGO_URI.replace(/\/[^/?]+(\?|$)/, '/kisan-netra-phase2-test$1')
    : 'mongodb://localhost:27017/kisan-netra-phase2-test';

process.env.MONGO_URI = TEST_DB_URI;

describe('Phase 2 Features API Suite', () => {
    let farmerAgent;
    let dealerAgent;
    let testFarmer;
    let testDealer;
    let testDealerProfile;
    let testProduct;
    let testFarm;

    beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await connectDB();
        }

        // Register farmer
        farmerAgent = request.agent(app);
        const farmerRes = await farmerAgent.post('/api/auth/register').send({
            name: 'Phase2 Farmer',
            email: 'phase2farmer@example.com',
            password: 'password123',
            role: 'farmer',
        });
        testFarmer = farmerRes.body.user;
        await farmerAgent.post('/api/auth/login').send({
            email: 'phase2farmer@example.com',
            password: 'password123',
        });

        // Register dealer
        dealerAgent = request.agent(app);
        const dealerRes = await dealerAgent.post('/api/auth/register').send({
            name: 'Phase2 Dealer',
            email: 'phase2dealer@example.com',
            password: 'password123',
            role: 'dealer',
        });
        testDealer = dealerRes.body.user;
        await dealerAgent.post('/api/auth/login').send({
            email: 'phase2dealer@example.com',
            password: 'password123',
        });

        // Create dealer profile
        const dProfileRes = await dealerAgent.post('/api/dealers').send({
            storeName: 'Phase 2 Agro Store',
            address: 'Agro Road 10',
            licenseNumber: 'LIC-P2-100',
            longitude: 77.209,
            latitude: 28.6139,
        });
        testDealerProfile = dProfileRes.body.dealer;

        // Seed a sample product
        testProduct = await Product.create({
            name: 'Phase2 Pesticide Alpha',
            category: 'pesticide',
            licenseNumber: 'CIB-P2-999',
            activeIngredient: 'Chlorpyrifos 20% EC',
            manufacturer: 'AgriChem Ltd',
        });
    }, 60000);

    afterAll(async () => {
        await Farm.deleteMany({});
        await Crop.deleteMany({});
        await DealerStock.deleteMany({});
        await Dealer.deleteMany({});
        await Product.deleteMany({});
        await User.deleteMany({});
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    }, 30000);

    // --- STEP 1: FARM PROFILE CRUD ---
    describe('Step 1: Farm Profile API', () => {
        test('creates a farm profile for authenticated farmer', async () => {
            const res = await farmerAgent.post('/api/farms').send({
                farmName: 'Sunrise Organic Farm',
                locationName: 'Indore, MP',
                longitude: 75.8577,
                latitude: 22.7196,
                totalArea: 12.5,
                areaUnit: 'acres',
                soilType: 'Black',
                irrigationType: 'Drip',
            });

            expect(res.status).toBe(201);
            expect(res.body.farm).toBeDefined();
            expect(res.body.farm.farmName).toBe('Sunrise Organic Farm');
            expect(res.body.farm.totalArea).toBe(12.5);
            testFarm = res.body.farm;
        });

        test('gets all farm profiles for the logged-in farmer', async () => {
            const res = await farmerAgent.get('/api/farms');
            expect(res.status).toBe(200);
            expect(res.body.count).toBeGreaterThanOrEqual(1);
            expect(res.body.farms[0].farmName).toBe('Sunrise Organic Farm');
        });

        test('updates an existing farm profile', async () => {
            const res = await farmerAgent.put(`/api/farms/${testFarm._id}`).send({
                totalArea: 15.0,
                irrigationType: 'Canal',
            });

            expect(res.status).toBe(200);
            expect(res.body.farm.totalArea).toBe(15.0);
            expect(res.body.farm.irrigationType).toBe('Canal');
        });
    });

    // --- STEP 3: DEALER INVENTORY ANALYTICS & PRICING ---
    describe('Step 3: Dealer Inventory Analytics API', () => {
        let stockId;

        test('adds dealer stock with price and minimumStockThreshold', async () => {
            const res = await dealerAgent.post(`/api/dealers/${testDealerProfile._id}/stock`).send({
                product: testProduct._id,
                quantityAvailable: 5, // low stock (threshold is 10)
                unit: 'liters',
                price: 850,
                minimumStockThreshold: 10,
            });

            expect(res.status).toBe(201);
            expect(res.body.stockItem.price).toBe(850);
            expect(res.body.stockItem.minimumStockThreshold).toBe(10);
            stockId = res.body.stockItem._id;
        });

        test('fetches dealer analytics with valuation and low stock count', async () => {
            const res = await dealerAgent.get('/api/dealers/analytics');
            expect(res.status).toBe(200);
            expect(res.body.totalProducts).toBe(1);
            expect(res.body.totalInventoryValue).toBe(5 * 850); // 4250
            expect(res.body.lowStockCount).toBe(1);
            expect(res.body.lowStockItems[0]._id).toBe(stockId.toString());
        });
    });

    // --- STEP 4: CROP LIFECYCLE TRACKING ---
    describe('Step 4: Crop Lifecycle Tracking API', () => {
        let testCropId;

        test('creates a crop lifecycle record for a farm profile', async () => {
            const res = await farmerAgent.post('/api/crops').send({
                farm: testFarm._id,
                cropName: 'Cotton',
                variety: 'Bt-Cotton II',
                sowingDate: '2026-06-15',
                currentStage: 'Sowing',
            });

            expect(res.status).toBe(201);
            expect(res.body.crop).toBeDefined();
            expect(res.body.crop.cropName).toBe('Cotton');
            expect(res.body.crop.currentStage).toBe('Sowing');
            testCropId = res.body.crop._id;
        });

        test('updates crop growth stage to Vegetative', async () => {
            const res = await farmerAgent.put(`/api/crops/${testCropId}`).send({
                currentStage: 'Vegetative',
            });

            expect(res.status).toBe(200);
            expect(res.body.crop.currentStage).toBe('Vegetative');
        });

        test('logs a field activity on the crop', async () => {
            const res = await farmerAgent.post(`/api/crops/${testCropId}/activities`).send({
                activityType: 'Fertilizer',
                description: 'Applied NPK fertilizer 20-20-20',
            });

            expect(res.status).toBe(200);
            expect(res.body.crop.activities.length).toBe(1);
            expect(res.body.crop.activities[0].description).toBe('Applied NPK fertilizer 20-20-20');
        });
    });
});
