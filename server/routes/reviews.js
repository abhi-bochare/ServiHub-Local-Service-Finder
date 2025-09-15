const express = require('express');
const { body } = require('express-validator');
const { auth, isCustomer } = require('../middlewares/auth');
const {
  createReview,
  getReviews,
  getReviewById,
  getProviderReviewStats
} = require('../controllers/reviewController');

const router = express.Router();

// Get all reviews
router.get('/', getReviews);

// Get single review
router.get('/:id', getReviewById);

// Get provider review stats
router.get('/provider/:providerId/stats', getProviderReviewStats);

// Create review (customer only)
router.post('/', auth, isCustomer, [
  body('bookingId').isMongoId().withMessage('Invalid booking ID'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters')
], createReview);

module.exports = router;