const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');
const { validationResult } = require('express-validator');

const createBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { serviceId, scheduledDate, duration, customerNotes, customerAddress } = req.body;

    // Find the service
    const service = await Service.findById(serviceId).populate('providerId');
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check if the scheduled date is in the future
    const now = new Date();
    const bookingDate = new Date(scheduledDate);
    if (bookingDate <= now) {
      return res.status(400).json({ message: 'Booking date must be in the future' });
    }

    // Calculate total amount
    const totalAmount = (service.rate * duration) / 60; // duration in minutes, rate per hour

    // Create booking
    const booking = new Booking({
      customerId: req.user._id,
      providerId: service.providerId._id,
      serviceId,
      scheduledDate: bookingDate,
      duration,
      totalAmount,
      customerNotes,
      customerAddress
    });

    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('customerId', 'name email profileData')
      .populate('providerId', 'name email profileData')
      .populate('serviceId', 'title description category rate');

    // Send real-time notification to provider
    req.io.to(`user_${service.providerId._id}`).emit('newBooking', {
      booking: populatedBooking,
      message: 'New booking request received!'
    });

    res.status(201).json({
      message: 'Booking created successfully',
      booking: populatedBooking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Filter by user role
    if (req.user.role === 'customer') {
      query.customerId = req.user._id;
    } else {
      query.providerId = req.user._id;
    }

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('customerId', 'name email profileData')
      .populate('providerId', 'name email profileData')
      .populate('serviceId', 'title description category rate')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customerId', 'name email profileData')
      .populate('providerId', 'name email profileData')
      .populate('serviceId', 'title description category rate');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is authorized to view this booking
    const isAuthorized = booking.customerId._id.toString() === req.user._id.toString() ||
                        booking.providerId._id.toString() === req.user._id.toString();

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { status, providerNotes } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization - only provider can update status
    if (booking.providerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    // Update booking
    booking.status = status;
    if (providerNotes) booking.providerNotes = providerNotes;
    if (status === 'completed') booking.completedAt = new Date();

    // Update provider earnings if completed
    if (status === 'completed') {
      await User.findByIdAndUpdate(
        booking.providerId,
        { $inc: { totalEarnings: booking.totalAmount } }
      );
    }

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('customerId', 'name email profileData')
      .populate('providerId', 'name email profileData')
      .populate('serviceId', 'title description category rate');

    // Send real-time notification to customer
    req.io.to(`user_${booking.customerId}`).emit('bookingUpdate', {
      booking: updatedBooking,
      message: `Your booking status has been updated to ${status}`
    });

    res.json({
      message: 'Booking status updated successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization - only customer can cancel
    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Can only cancel pending or accepted bookings
    if (!['pending', 'accepted'].includes(booking.status)) {
      return res.status(400).json({ message: 'Cannot cancel booking in current status' });
    }

    booking.status = 'cancelled';
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('customerId', 'name email profileData')
      .populate('providerId', 'name email profileData')
      .populate('serviceId', 'title description category rate');

    // Send notification to provider
    req.io.to(`user_${booking.providerId}`).emit('bookingUpdate', {
      booking: updatedBooking,
      message: 'A booking has been cancelled by the customer'
    });

    res.json({
      message: 'Booking cancelled successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getBookingStats = async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'provider') {
      query.providerId = req.user._id;
    } else {
      query.customerId = req.user._id;
    }

    const [totalBookings, completedBookings, pendingBookings, totalEarnings] = await Promise.all([
      Booking.countDocuments(query),
      Booking.countDocuments({ ...query, status: 'completed' }),
      Booking.countDocuments({ ...query, status: 'pending' }),
      req.user.role === 'provider' 
        ? Booking.aggregate([
            { $match: { ...query, status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
          ])
        : Promise.resolve([{ total: 0 }])
    ]);

    res.json({
      totalBookings,
      completedBookings,
      pendingBookings,
      totalEarnings: totalEarnings[0]?.total || 0
    });
  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  getBookingStats
};