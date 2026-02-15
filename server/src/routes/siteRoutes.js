const express = require('express');
const { getHomepageConfig } = require('../controllers/siteConfigController');
const { getPublicImgBbImages } = require('../controllers/settingsController');

const router = express.Router();

router.get('/homepage-config', getHomepageConfig);
router.get('/images', getPublicImgBbImages);

module.exports = router;
