const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// for valid or selected  site can hit 
const corsOptions = {
    origin: process.env.CLIENT_URL,
    credentials: true,  // required for httpOnly cookies to be sent
};

// General limiter - applied to all /api routes 
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window 
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { mesage: 'Too many requests , please try again later.' },
});

// Strict  Limiter for login and auth endpoints - applied to /api/auth/*
// Tighter because these are the endpoints worth brute-forcing or spamming.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window 
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { mesage: 'Too many attempts , please try again later.' },
});

module.exports = {
    helmetMiddleware: helmet(),
    corsMiddleware: cors(corsOptions),
    generalLimiter,
    authLimiter,
};