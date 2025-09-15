const Service = require('../models/Service');
const User = require('../models/User');
const { validationResult } = require('express-validator');

const createService = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, category, rate, duration, tags, requirements } = req.body;

    const service = new Service({
      providerId: req.user._id,
      title,
      description,
      category,
      rate,
      duration,
      tags: tags || [],
      requirements: requirements || []
    });

    await service.save();

    const populatedService = await Service.findById(service._id).populate('providerId', 'name email rating profileData');

    res.status(201).json({
      message: 'Service created successfully',
      service: populatedService
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getServices = async (req, res) => {
  try {
    const { 
      search, 
      category, 
      minRate, 
      maxRate, 
      latitude, 
      longitude, 
      radius = 50, // km
      page = 1, 
      limit = 12 
    } = req.query;

    let query = { isActive: true };

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Rate filter
    if (minRate || maxRate) {
      query.rate = {};
      if (minRate) query.rate.$gte = Number(minRate);
      if (maxRate) query.rate.$lte = Number(maxRate);
    }

    let services = await Service.find(query)
      .populate('providerId', 'name email rating profileData')
      .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Location-based filtering if coordinates provided
    if (latitude && longitude) {
      const providers = await User.find({
        role: 'provider',
        'profileData.location.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [Number(longitude), Number(latitude)]
            },
            $maxDistance: radius * 1000 // Convert to meters
          }
        }
      }).select('_id');

      const nearbyProviderIds = providers.map(p => p._id);
      services = services.filter(service => 
        nearbyProviderIds.some(id => id.toString() === service.providerId._id.toString())
      );
    }

    const total = await Service.countDocuments(query);

    res.json({
      services,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('providerId', 'name email rating profileData totalEarnings createdAt');

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json(service);
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateService = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const service = await Service.findOneAndUpdate(
      { _id: req.params.id, providerId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('providerId', 'name email rating profileData');

    if (!service) {
      return res.status(404).json({ message: 'Service not found or unauthorized' });
    }

    res.json({
      message: 'Service updated successfully',
      service
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteService = async (req, res) => {
  try {
    const service = await Service.findOneAndDelete({
      _id: req.params.id,
      providerId: req.user._id
    });

    if (!service) {
      return res.status(404).json({ message: 'Service not found or unauthorized' });
    }

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getProviderServices = async (req, res) => {
  try {
    const services = await Service.find({ providerId: req.user._id })
      .populate('providerId', 'name email rating profileData')
      .sort({ createdAt: -1 });

    res.json(services);
  } catch (error) {
    console.error('Get provider services error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
  getProviderServices
};