const errorHandler = (err, req, res, next) => {
    console.log(err.stack);

    // Mongoose duplicate key error 
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            message: `${field} already in use`
        });
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({
            message: message.join(', ')
        });
    }

    res.status(err.statusCode || 500).json({
        message: err.message || 'Something went wrong on the server.',
    });
};

module.exports = errorHandler; 