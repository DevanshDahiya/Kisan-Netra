const mongoose = require('mongoose');
const request = require('supertest');
require('dotenv').config();
const app = require('../src/app');
const User = require('../src/models/User');
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
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
}, 30000);

describe('Auth flow', () => {
    const testUser = {
        name: 'Test Farmer',
        email: 'testfarmer@example.com',
        password: 'password123',
        role: 'farmer',
    };

    test('registers a new user without issuing a session cookie (requires explicit login)', async () => {
        const res = await request(app).post('/api/auth/register').send(testUser);

        expect(res.status).toBe(201);
        expect(res.body.user.email).toBe(testUser.email);
        expect(res.headers['set-cookie']).toBeUndefined(); // no auto-login cookie
    });

    test('rejects registration with a duplicate email', async () => {
        await request(app).post('/api/auth/register').send(testUser);
        const res = await request(app).post('/api/auth/register').send(testUser);

        expect(res.status).toBe(400);
    });

    test('public registration cannot self-assign admin role', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ ...testUser, email: 'sneaky@example.com', role: 'admin' });

        expect(res.status).toBe(201);
        expect(res.body.user.role).toBe('farmer'); // silently downgraded
    });

    test('logs in with correct credentials and issues HttpOnly session cookie', async () => {
        await request(app).post('/api/auth/register').send(testUser);
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: testUser.password });

        expect(res.status).toBe(200);
        expect(res.body.user.email).toBe(testUser.email);
        expect(res.headers['set-cookie']).toBeDefined();
    });

    test('rejects login with wrong password', async () => {
        await request(app).post('/api/auth/register').send(testUser);
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: 'wrongpassword' });

        expect(res.status).toBe(401);
    });

    test('rejects /me without a valid session cookie', async () => {
        const res = await request(app).get('/api/auth/me');
        expect(res.status).toBe(401);
    });

    test('allows /me with a valid session cookie after explicit login', async () => {
        const agent = request.agent(app);
        await agent.post('/api/auth/register').send(testUser);
        await agent.post('/api/auth/login').send({ email: testUser.email, password: testUser.password });
        
        const res = await agent.get('/api/auth/me');
        expect(res.status).toBe(200);
        expect(res.body.user.email).toBe(testUser.email);
    });

    test('destroys session cookie on logout', async () => {
        const agent = request.agent(app);
        await agent.post('/api/auth/register').send(testUser);
        await agent.post('/api/auth/login').send({ email: testUser.email, password: testUser.password });

        // Confirm logged in
        let meRes = await agent.get('/api/auth/me');
        expect(meRes.status).toBe(200);

        // Perform logout
        const logoutRes = await agent.post('/api/auth/logout');
        expect(logoutRes.status).toBe(200);

        // /me must now be rejected with 401
        meRes = await agent.get('/api/auth/me');
        expect(meRes.status).toBe(401);
    });
});