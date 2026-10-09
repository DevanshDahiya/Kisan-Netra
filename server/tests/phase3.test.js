const mongoose = require('mongoose');
const request = require('supertest');
require('dotenv').config();
const app = require('../src/app');
const User = require('../src/models/User');
const Dealer = require('../src/models/Dealer');
const DealerStock = require('../src/models/DealerStock');
const Product = require('../src/models/Product');
const LicensedDealer = require('../src/models/LicensedDealer');
const FarmerInventory = require('../src/models/FarmerInventory');
const Farm = require('../src/models/Farm');
const Crop = require('../src/models/Crop');
const Feedback = require('../src/models/Feedback');
const connectDB = require('../src/config/db');
const { rankDealers } = require('../src/utils/rank-dealers');
const { normalizeLicense } = require('../src/utils/license-normalizer');
const { hashOTP } = require('../src/utils/Otp');

describe('Phase 3 Features Test Suite', () => {
    let farmerAgent;
    let dealerAgent;
    let adminAgent;
    let testFarmerUser;
    let testDealerUser;
    let testDealerProfile;
    let testProduct;

    beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await connectDB();
        }

        // Clean collections for test
        await User.deleteMany({ email: /phase3/ });
        await LicensedDealer.deleteMany({ emails: /phase3/ });

        // Register farmer
        farmerAgent = request.agent(app);
        const farmerRes = await farmerAgent.post('/api/auth/register').send({
            name: 'Phase3 Farmer',
            email: 'phase3farmer@example.com',
            password: 'password123',
            role: 'farmer',
        });
        testFarmerUser = farmerRes.body.user;
        await farmerAgent.post('/api/auth/login').send({
            email: 'phase3farmer@example.com',
            password: 'password123',
        });

        // Register dealer
        dealerAgent = request.agent(app);
        const dealerRes = await dealerAgent.post('/api/auth/register').send({
            name: 'Phase3 Dealer',
            email: 'phase3dealer@example.com',
            password: 'password123',
            role: 'dealer',
        });
        testDealerUser = dealerRes.body.user;
        await dealerAgent.post('/api/auth/login').send({
            email: 'phase3dealer@example.com',
            password: 'password123',
        });

        // Seed admin user
        const adminUser = await User.create({
            name: 'Phase3 Admin',
            email: 'phase3admin@example.com',
            password: 'password123',
            role: 'admin',
        });
        adminAgent = request.agent(app);
        await adminAgent.post('/api/auth/login').send({
            email: 'phase3admin@example.com',
            password: 'password123',
        });

        // Seed product
        testProduct = await Product.create({
            name: 'Phase3 Test Insecticide',
            category: 'pesticide',
            licenseNumber: 'P3-REG-' + Date.now(),
            activeIngredient: 'Chlorpyrifos',
            cropTypes: ['Paddy'],
        });
    });

    afterAll(async () => {
        await User.deleteMany({ email: /phase3/ });
        await Product.deleteMany({ licenseNumber: /P3-REG/ });
        await LicensedDealer.deleteMany({ emails: /phase3/ });
        await Dealer.deleteMany({});
        await DealerStock.deleteMany({});
        await FarmerInventory.deleteMany({});
        await Farm.deleteMany({});
        await Crop.deleteMany({});
        await Feedback.deleteMany({});
    });

    describe('Feature 5: Pure Function rankDealers & Dealer Prices', () => {
        it('ranks correctly when all dealers are priced in the same unit (best match)', () => {
            const dealers = [
                { _id: '1', storeName: 'Store A', distance: 1000, stockInfo: { price: 500, unit: 'liters' } },
                { _id: '2', storeName: 'Store B', distance: 5000, stockInfo: { price: 200, unit: 'liters' } },
                { _id: '3', storeName: 'Store C', distance: 2000, stockInfo: { price: 350, unit: 'liters' } },
            ];

            const res = rankDealers(dealers, { sort: 'best', productId: 'p1' });
            expect(res.count).toBe(3);
            expect(res.meta.primaryUnit).toBe('liters');
            expect(res.dealers[0].rank).toBe(1);
            expect(res.dealers.find((d) => d._id === '2').badges).toContain('lowest_price');
            expect(res.dealers.find((d) => d._id === '1').badges).toContain('nearest');
        });

        it('handles mixed units and unpriced dealers correctly', () => {
            const dealers = [
                { _id: '1', storeName: 'Store Liters 1', distance: 4000, stockInfo: { price: 500, unit: 'liters' } },
                { _id: '2', storeName: 'Store Liters 2', distance: 3000, stockInfo: { price: 450, unit: 'liters' } },
                { _id: '3', storeName: 'Store Packets', distance: 1000, stockInfo: { price: 200, unit: 'packets' } },
                { _id: '4', storeName: 'Store Unpriced', distance: 2000, stockInfo: { price: null, unit: 'liters' } },
            ];

            const res = rankDealers(dealers, { sort: 'best', productId: 'p1' });
            expect(res.meta.primaryUnit).toBe('liters'); // Liters has count 2 vs packets count 1
            // Comparable comes first, then other-unit, then unpriced
            expect(res.dealers[0].stockInfo.unit).toBe('liters');
            expect(res.dealers[1].stockInfo.unit).toBe('liters');
            expect(res.dealers[2]._id).toBe('3');
            expect(res.dealers[3]._id).toBe('4');
        });

        it('handles price sort mode correctly', () => {
            const dealers = [
                { _id: '1', storeName: 'Store High', distance: 1000, stockInfo: { price: 500, unit: 'kg' } },
                { _id: '2', storeName: 'Store Low', distance: 3000, stockInfo: { price: 200, unit: 'kg' } },
            ];

            const res = rankDealers(dealers, { sort: 'price', productId: 'p1' });
            expect(res.dealers[0]._id).toBe('2');
            expect(res.dealers[1]._id).toBe('1');
        });

        it('rejects invalid prices in API (negative, string, more than 2 decimals)', async () => {
            const storeRes = await dealerAgent.post('/api/dealers').send({
                storeName: 'P3 Test Store',
                address: 'Bhubaneswar, Odisha',
                licenseNumber: 'LIC-P3-999',
                longitude: 85.8245,
                latitude: 20.2961,
                contactPhone: '9876543210',
            });
            testDealerProfile = storeRes.body.dealer;

            // Reject negative price
            const negRes = await dealerAgent.post(`/api/dealers/${testDealerProfile._id}/stock`).send({
                product: testProduct._id,
                quantityAvailable: 25,
                unit: 'liters',
                price: -50,
            });
            expect(negRes.status).toBe(400);

            // Reject invalid string price
            const strRes = await dealerAgent.post(`/api/dealers/${testDealerProfile._id}/stock`).send({
                product: testProduct._id,
                quantityAvailable: 25,
                unit: 'liters',
                price: 'invalid_price',
            });
            expect(strRes.status).toBe(400);

            // Reject > 2 decimal places
            const decRes = await dealerAgent.post(`/api/dealers/${testDealerProfile._id}/stock`).send({
                product: testProduct._id,
                quantityAvailable: 25,
                unit: 'liters',
                price: 120.555,
            });
            expect(decRes.status).toBe(400);
        });

        it('accepts valid price on stock add & partial update does not overwrite other fields', async () => {
            const addRes = await dealerAgent.post(`/api/dealers/${testDealerProfile._id}/stock`).send({
                product: testProduct._id,
                quantityAvailable: 50,
                unit: 'liters',
                price: 450.50,
            });
            expect(addRes.status).toBe(201);
            expect(addRes.body.stockItem.price).toBe(450.50);
            const stockId = addRes.body.stockItem._id;

            // Update only price without affecting quantity or unit
            const patchRes = await dealerAgent.patch(`/api/dealers/${testDealerProfile._id}/stock/${stockId}`).send({
                price: 420.00,
            });
            expect(patchRes.status).toBe(200);
            expect(patchRes.body.stockItem.price).toBe(420.00);
            expect(patchRes.body.stockItem.quantityAvailable).toBe(50);
            expect(patchRes.body.stockItem.unit).toBe('liters');
        });

        it('/api/products never returns any price field', async () => {
            const res = await request(app).get('/api/products');
            expect(res.status).toBe(200);
            res.body.products.forEach((p) => {
                expect(p.price).toBeUndefined();
            });
        });
    });

    describe('Feature 1: Licensed Dealer Registry & Auto-Verification', () => {
        let claimableUser;
        let claimableAgent;

        beforeAll(async () => {
            // Seed a licensed dealer in registry
            await LicensedDealer.create({
                licenseNumber: 'OD-REG-LIC-001',
                businessName: 'Odisha Agro Traders',
                ownerName: 'Ramesh Kumar',
                emails: ['ramesh.agro@odisha.com', 'phase3claim@example.com'],
                phones: ['9437012345'],
                address: 'Main Market, Cuttack',
                district: 'Cuttack',
                state: 'Odisha',
            });

            claimableAgent = request.agent(app);
            const regRes = await claimableAgent.post('/api/auth/register').send({
                name: 'Ramesh Agro',
                email: 'phase3claim@example.com',
                password: 'password123',
                role: 'dealer',
            });
            claimableUser = regRes.body.user;
            await claimableAgent.post('/api/auth/login').send({
                email: 'phase3claim@example.com',
                password: 'password123',
            });
        });

        it('normalizeLicense strips spaces, hyphens, and slashes and converts to uppercase', () => {
            expect(normalizeLicense(' od-reg / lic - 001 ')).toBe('ODREGLIC001');
        });

        it('check registry match returns matched without leaking details', async () => {
            const res = await claimableAgent.get('/api/dealers/registry/match');
            expect(res.status).toBe(200);
            expect(res.body.matched).toBe(true);
            expect(res.body.alreadyHasProfile).toBe(false);
            expect(res.body.businessName).toBeUndefined();
            expect(res.body.licenseNumber).toBeUndefined();
        });

        it('verifies registry OTP and returns prefill info', async () => {
            // Send OTP
            const sendRes = await claimableAgent.post('/api/dealers/registry/send-otp');
            expect(sendRes.status).toBe(200);

            // Test wrong OTP
            const wrongRes = await claimableAgent.post('/api/dealers/registry/verify-otp').send({ otp: '000000' });
            expect(wrongRes.status).toBe(400);

            // Manually set known OTP hash for deterministic testing
            const user = await User.findOne({ email: 'phase3claim@example.com' });
            user.registryClaimOTP = await hashOTP('123456');
            user.registryClaimExpires = new Date(Date.now() + 10 * 60 * 1000);
            user.registryClaimAttempts = 0;
            await user.save();

            const verifyRes = await claimableAgent.post('/api/dealers/registry/verify-otp').send({ otp: '123456' });
            expect(verifyRes.status).toBe(200);
            expect(verifyRes.body.prefill.businessName).toBe('Odisha Agro Traders');
            expect(verifyRes.body.prefill.licenseNumber).toBe('OD-REG-LIC-001');

            // Creating store auto-verifies via registry and forces licence number
            const createRes = await claimableAgent.post('/api/dealers').send({
                storeName: 'Odisha Agro Traders Store',
                address: 'Main Market, Cuttack',
                licenseNumber: 'FAKE-CLIENT-LICENSE', // Should be overridden by registry
                longitude: 85.88,
                latitude: 20.46,
                contactPhone: '9437012345',
            });

            expect(createRes.status).toBe(201);
            expect(createRes.body.verification).toBe('registry');
            expect(createRes.body.dealer.isVerified).toBe(true);
            expect(createRes.body.dealer.verificationSource).toBe('registry');
            expect(createRes.body.dealer.licenseNumber).toBe('OD-REG-LIC-001');

            // Registry-verified dealer cannot change licence number
            const updateRes = await claimableAgent.patch(`/api/dealers/${createRes.body.dealer._id}`).send({
                licenseNumber: 'NEW-LIC-999',
            });
            expect(updateRes.status).toBe(400);
        });
    });

    describe('Feature 3: Account Deletion', () => {
        let delFarmerAgent;
        let delFarmerId;

        beforeAll(async () => {
            delFarmerAgent = request.agent(app);
            const regRes = await delFarmerAgent.post('/api/auth/register').send({
                name: 'Del Farmer',
                email: 'phase3deluser@example.com',
                password: 'password123',
                role: 'farmer',
            });
            delFarmerId = regRes.body.user.id;
            await delFarmerAgent.post('/api/auth/login').send({
                email: 'phase3deluser@example.com',
                password: 'password123',
            });

            // Create inventory, farm, and crop for this farmer
            const inv = await FarmerInventory.create({
                farmer: delFarmerId,
                product: testProduct._id,
                quantityPurchased: 10,
                quantityRemaining: 10,
            });

            const farm = await Farm.create({
                farmer: delFarmerId,
                farmName: 'Del Farm',
                totalArea: 5,
            });

            await Crop.create({
                farmer: delFarmerId,
                farm: farm._id,
                cropName: 'Paddy',
                sowingDate: new Date(),
            });
        });

        it('rejects deletion with wrong password and keeps data intact', async () => {
            const res = await delFarmerAgent.delete('/api/auth/account').send({ password: 'wrongpassword' });
            expect(res.status).toBe(401);
            const user = await User.findById(delFarmerId);
            expect(user).not.toBeNull();
        });

        it('rejects admin account deletion from the public endpoint', async () => {
            const res = await adminAgent.delete('/api/auth/account').send({ password: 'password123' });
            expect(res.status).toBe(403);
        });

        it('successfully deletes farmer account and associated records, clearing cookie', async () => {
            const res = await delFarmerAgent.delete('/api/auth/account').send({ password: 'password123' });
            expect(res.status).toBe(200);

            // User deleted
            const user = await User.findById(delFarmerId);
            expect(user).toBeNull();

            // Children deleted
            const invCount = await FarmerInventory.countDocuments({ farmer: delFarmerId });
            const farmCount = await Farm.countDocuments({ farmer: delFarmerId });
            const cropCount = await Crop.countDocuments({ farmer: delFarmerId });
            expect(invCount).toBe(0);
            expect(farmCount).toBe(0);
            expect(cropCount).toBe(0);

            // Me endpoint returns 401
            const meRes = await delFarmerAgent.get('/api/auth/me');
            expect(meRes.status).toBe(401);
        });
    });

    describe('Feature 1: Importer Normalization Utilities', () => {
        const { cleanText, extractEmails, cleanPhones } = require('../scripts/import-licensed-dealers');

        it('normalizes multi-email cell with commas, slashes, spaces and newlines', () => {
            const cell = '  Test.1@Example.Com, TEST.2@DOMAIN.ORG / not-an-email\nthird@test.co.in ';
            const emails = extractEmails(cell);
            expect(emails).toEqual([
                'test.1@example.com',
                'test.2@domain.org',
                'third@test.co.in'
            ]);
        });

        it('cleans numeric and string phone numbers and removes float .0 suffixes', () => {
            const cell = '9437012345.0, 9876543210';
            const phones = cleanPhones(cell);
            expect(phones).toEqual(['9437012345', '9876543210']);
        });

        it('collapses whitespace correctly', () => {
            const raw = '   M/s   Utkal    Agro   Agencies \n\t ';
            expect(cleanText(raw)).toBe('M/s Utkal Agro Agencies');
        });
    });
});

