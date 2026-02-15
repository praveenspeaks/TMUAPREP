const express = require('express');
const { getQuestion, addQuestion, listQuestions, updateQuestion } = require('../controllers/questionController');
const { authenticateToken, requireStaffOrAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/random', authenticateToken, getQuestion);
router.get('/', authenticateToken, requireStaffOrAdmin, listQuestions);
router.post('/', authenticateToken, requireStaffOrAdmin, addQuestion);
router.put('/:id', authenticateToken, requireStaffOrAdmin, updateQuestion);

module.exports = router;
