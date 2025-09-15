const express = require('express');
const { body } = require('express-validator');
const { auth, isCustomer, isProvider } = require('../middlewares/auth');
const {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  getBookingStats
} = require('../controllers/bookingController');

const router = express.Router();

// Get bookings stats
router.get('/stats', auth, getBookingStats);

// Get all bookings for user
router.get('/', auth, getBookings);

// Get single booking
router.get('/:id', auth, getBookingById);

// Create booking (customer only)
router.post('/', auth, isCustomer, [
  body('serviceId').isMongoId().withMessage('Invalid service ID'),
  body('scheduledDate').isISO8601().withMessage('Invalid date format'),
  body('duration').isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15 and 480 minutes'),
  body('customerNotes').optional().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
], createBooking);

// Update booking status (provider only)
router.put('/:id/status', auth, isProvider, [
  body('status').isIn(['accepted', 'rejected', 'in-progress', 'completed']).withMessage('Invalid status'),
  body('providerNotes').optional().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
], updateBookingStatus);

// Cancel booking (customer only)
router.put('/:id/cancel', auth, isCustomer, cancelBooking);

module.exports = router;