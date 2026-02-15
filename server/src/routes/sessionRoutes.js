const express = require('express');
const { startSession, submitAnswer, endSession, getHistory } = require('../controllers/sessionController');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/start', authenticateToken, startSession);
router.post('/answer', authenticateToken, submitAnswer);
router.post('/end', authenticateToken, endSession);
router.get('/history', authenticateToken, getHistory);

module.exports = router;
