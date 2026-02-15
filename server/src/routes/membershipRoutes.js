const express = require('express');
const { getPlans, createCheckoutSession, verifyPayment } = require('../controllers/membershipController');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/plans', authenticateToken, getPlans);
router.post('/checkout', authenticateToken, createCheckoutSession);
router.post('/verify', authenticateToken, verifyPayment);

module.exports = router;
