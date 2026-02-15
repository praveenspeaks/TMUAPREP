const express = require('express');
const multer = require('multer');
const { authenticateToken, requireStaffOrAdmin } = require('../middleware/authMiddleware');
const {
    getImgBbSettings,
    updateImgBbSettings,
    uploadToImgBb,
} = require('../controllers/settingsController');

const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
});

router.get('/imgbb', authenticateToken, requireStaffOrAdmin, getImgBbSettings);
router.put('/imgbb', authenticateToken, requireStaffOrAdmin, updateImgBbSettings);
router.post('/imgbb/upload', authenticateToken, requireStaffOrAdmin, upload.single('image'), uploadToImgBb);

module.exports = router;
