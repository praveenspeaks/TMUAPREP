const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../utils/auth');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, getJwtSecret(), (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const requireStaffOrAdmin = (req, res, next) => {
    if (!['STAFF', 'ADMIN'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Staff/Admin access required' });
    }
    next();
};

const requireSuperAdmin = (req, res, next) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Super admin access required' });
    }
    next();
};

module.exports = { authenticateToken, requireStaffOrAdmin, requireSuperAdmin };
