const express = require('express');
const { body } = require('express-validator');
const { auth, isProvider } = require('../middlewares/auth');
const {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
  getProviderServices
} = require('../controllers/serviceController');

const router = express.Router();

// Get all services (public)
router.get('/', getServices);

// Get single service (public)
router.get('/:id', getServiceById);

// Get provider's services
router.get('/provider/my-services', auth, isProvider, getProviderServices);

// Create service (provider only)
router.post('/', auth, isProvider, [
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
  body('description').trim().isLength({ min: 10, max: 500 }).withMessage('Description must be 10-500 characters'),
  body('category').isIn(['cleaning', 'plumbing', 'electrical', 'gardening', 'painting', 'carpentry', 'tutoring', 'other']).withMessage('Invalid category'),
  body('rate').isNumeric().custom(value => value > 0).withMessage('Rate must be a positive number'),
  body('duration').isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15 and 480 minutes')
], createService);

// Update service (provider only)
router.put('/:id', auth, isProvider, [
  body('title').optional().trim().isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 500 }).withMessage('Description must be 10-500 characters'),
  body('rate').optional().isNumeric().custom(value => value > 0).withMessage('Rate must be a positive number'),
  body('duration').optional().isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15 and 480 minutes')
], updateService);

// Delete service (provider only)
router.delete('/:id', auth, isProvider, deleteService);

module.exports = router;