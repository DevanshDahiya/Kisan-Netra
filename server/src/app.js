const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const { helmetMiddleware, corsMiddleware, generalLimiter } = require('./middleware/security-middleware');
const errorHandler = require('./middleware/error-handler');
const authRoutes = require('./routes/auth-routes');
const dealerRoutes = require('./routes/dealer-routes');
const productRoutes = require('./routes/product-routes');
const inventoryRoutes = require('./routes/inventory-routes');

const app = express();

// Main middleware 
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(express.json());
app.use(cookieParser());


if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use('/api', generalLimiter);
// Routes -> 
// for all the register  , login , reset passwortd , verify-otp 
app.use('/api/auth', authRoutes);
app.use('/api/dealers', dealerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);

// health check 
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok'
    });
});

// 404 handler for unmatch routes 
app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found'
    });
});

// centralised error handler 
app.use(errorHandler);

module.exports = app; 
