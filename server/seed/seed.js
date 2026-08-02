// Run with: npm run seed
// Creates a default admin account (if one doesn't exist) and seeds a starter
// product catalog. Safe to re-run - it skips anything that already exists.
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Product = require('../src/models/Product');

const ADMIN_EMAIL = 'admin@kisannetra.com';
const ADMIN_PASSWORD = 'ChangeMe123!'; // change this after first login

// Note: these license numbers follow the general CIB&RC registration format
// but are illustrative placeholders, not verified real government records.
// Replace with real data before using this for anything beyond a portfolio demo.
const SAMPLE_PRODUCTS = [
    {
        name: 'Roundup',
        category: 'herbicide',
        licenseNumber: 'CIB-REG-00123',
        activeIngredient: 'Glyphosate',
        manufacturer: 'Bayer',
        cropTypes: ['cotton', 'wheat', 'sugarcane'],
        registrationExpiry: new Date('2027-06-01'),
    },
    {
        name: 'Nativo',
        category: 'fungicide',
        licenseNumber: 'CIB-REG-00456',
        activeIngredient: 'Tebuconazole + Trifloxystrobin',
        manufacturer: 'Bayer',
        cropTypes: ['rice', 'chilli', 'groundnut'],
        registrationExpiry: new Date('2026-12-01'),
    },
    {
        name: 'Coragen',
        category: 'pesticide',
        licenseNumber: 'CIB-REG-00789',
        activeIngredient: 'Chlorantraniliprole',
        manufacturer: 'FMC Corporation',
        cropTypes: ['cotton', 'rice', 'chilli'],
        registrationExpiry: new Date('2027-03-15'),
    },
    {
        name: 'Urea (46% N)',
        category: 'fertilizer',
        licenseNumber: 'FCO-REG-00111',
        activeIngredient: 'Nitrogen',
        manufacturer: 'IFFCO',
        cropTypes: ['wheat', 'rice', 'sugarcane', 'cotton'],
        registrationExpiry: new Date('2028-01-01'),
    },
    {
        name: 'DAP (18-46-0)',
        category: 'fertilizer',
        licenseNumber: 'FCO-REG-00222',
        activeIngredient: 'Diammonium Phosphate',
        manufacturer: 'IFFCO',
        cropTypes: ['wheat', 'rice', 'groundnut'],
        registrationExpiry: new Date('2028-01-01'),
    },
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding.');

        // Seed admin
        const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
        if (existingAdmin) {
            console.log('Admin account already exists, skipping.');
        } else {
            await User.create({
                name: 'Admin',
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
                role: 'admin',
            });
            console.log(`Admin created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD} - change this password after first login.`);
        }

        // Seed products (skip any that already exist by license number)
        for (const p of SAMPLE_PRODUCTS) {
            const exists = await Product.findOne({ licenseNumber: p.licenseNumber });
            if (exists) {
                console.log(`Product "${p.name}" already exists, skipping.`);
                continue;
            }
            await Product.create(p);
            console.log(`Product created: ${p.name}`);
        }

        console.log('Seeding complete.');
    } catch (err) {
        console.error('Seeding failed:', err.message);
    } finally {
        await mongoose.disconnect();
    }
};

seed();