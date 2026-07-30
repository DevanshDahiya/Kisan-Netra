const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verifies the Jwt(from cookie) and attaches the user to req.user 

const protect = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                message: "Not authenticated. Pleasse log in."
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                message: "User no longer exists."
            });
        }
        req.user = user;
        next();
    }
    catch (err) {
        return res.status(401).json({
            message: 'Invalid or expired token.'
        });
    }
};


// it restrict the user with roles like (eg. - 'farmar ','dealer') and it is used to differentiate the admin and user
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'You do not have permission to perform this action'
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
