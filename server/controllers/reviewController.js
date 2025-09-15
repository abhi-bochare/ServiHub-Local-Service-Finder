const Review = require('../models/Review');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { validationResult } = require('express-validator');

const createReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bookingId, rating, comment } = req.body;

    // Check if booking exists and is completed
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed bookings' });
    }

    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to review this booking' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists for this booking' });
    }

    // Create review
    const review = new Review({
      bookingId,
      customerId: req.user._id,
      providerId: booking.providerId,
      serviceId: booking.serviceId,
      rating,
      comment
    });

    await review.save();

    // Update booking review status
    booking.isReviewSubmitted = true;
    await booking.save();

    // Update provider rating
    const provider = await User.findById(booking.providerId);
    await provider.updateRating(rating);

    const populatedReview = await Review.findById(review._id)
      .populate('customerId', 'name profileData')
      .populate('serviceId', 'title category');

    res.status(201).json({
      message: 'Review submitted successfully',
      review: populatedReview
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getReviews = async (req, res) => {
  try {
    const { providerId, page = 1, limit = 10 } = req.query;

    let query = {};
    if (providerId) {
      query.providerId = providerId;
    }

    const reviews = await Review.find(query)
      .populate('customerId', 'name profileData')
      .populate('serviceId', 'title category')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(query);

    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('customerId', 'name profileData')
      .populate('providerId', 'name profileData')
      .populate('serviceId', 'title category description');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json(review);
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getProviderReviewStats = async (req, res) => {
  try {
    const providerId = req.params.providerId;

    const stats = await Review.aggregate([
      { $match: { providerId: require('mongoose').Types.ObjectId(providerId) } },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    if (stats.length === 0) {
      return res.json({
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      });
    }

    const stat = stats[0];
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    stat.ratingDistribution.forEach(rating => {
      distribution[rating] = (distribution[rating] || 0) + 1;
    });

    res.json({
      totalReviews: stat.totalReviews,
      averageRating: Math.round(stat.averageRating * 10) / 10,
      ratingDistribution: distribution
    });
  } catch (error) {
    console.error('Get provider review stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createReview,
  getReviews,
  getReviewById,
  getProviderReviewStats
};