const express = require('express');
const {
	getStats,
	getUsers,
	createUser,
	updateUser,
	updateUserPassword,
	deleteUser,
	revokeMembership,
	grantMembership,
} = require('../controllers/adminController');
const { getHomepageConfig, updateHomepageConfig } = require('../controllers/siteConfigController');
const settingsRoutes = require('./settingsRoutes');
const { authenticateToken, requireStaffOrAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

router.use('/settings', settingsRoutes);

router.get('/stats', authenticateToken, requireStaffOrAdmin, getStats);
router.get('/users', authenticateToken, requireStaffOrAdmin, getUsers);
router.post('/users', authenticateToken, requireStaffOrAdmin, createUser);
router.put('/users/:id', authenticateToken, requireStaffOrAdmin, updateUser);
router.put('/users/:id/password', authenticateToken, requireStaffOrAdmin, updateUserPassword);
router.delete('/users/:id', authenticateToken, requireStaffOrAdmin, deleteUser);
router.post('/revoke', authenticateToken, requireStaffOrAdmin, revokeMembership);
router.post('/grant', authenticateToken, requireStaffOrAdmin, grantMembership);
router.get('/homepage-config', authenticateToken, requireStaffOrAdmin, getHomepageConfig);
router.put('/homepage-config', authenticateToken, requireStaffOrAdmin, updateHomepageConfig);

module.exports = router;
