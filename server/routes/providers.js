const express = require('express');
const { body } = require('express-validator');
const { auth, isProvider } = require('../middlewares/auth');
const {
  getNearbyProviders,
  getProviderProfile,
  updateLocation,
  searchProviders
} = require('../controllers/providerController');

const router = express.Router();

// Get nearby providers
router.get('/nearby', getNearbyProviders);

// Search providers
router.get('/search', searchProviders);

// Get provider profile
router.get('/:id', getProviderProfile);

// Update provider location (provider only)
router.put('/location', auth, isProvider, [
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude')
], updateLocation);

module.exports = router;