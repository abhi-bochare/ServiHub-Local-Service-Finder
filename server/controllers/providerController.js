const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');

const getNearbyProviders = async (req, res) => {
  try {
    const { latitude, longitude, radius = 50, category, page = 1, limit = 20 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    let matchQuery = {
      role: 'provider',
      isActive: true,
      'profileData.location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(longitude), Number(latitude)]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      }
    };

    const providers = await User.find(matchQuery)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get services for each provider if category is specified
    if (category && category !== 'all') {
      const providersWithServices = await Promise.all(
        providers.map(async (provider) => {
          const services = await Service.find({
            providerId: provider._id,
            category,
            isActive: true
          });
          return {
            ...provider.toObject(),
            services
          };
        })
      );
      
      // Filter out providers with no matching services
      const filteredProviders = providersWithServices.filter(p => p.services.length > 0);
      
      return res.json({
        providers: filteredProviders,
        total: filteredProviders.length
      });
    }

    // Get all services for providers
    const providersWithServices = await Promise.all(
      providers.map(async (provider) => {
        const services = await Service.find({
          providerId: provider._id,
          isActive: true
        }).limit(5); // Limit to 5 services per provider for performance
        
        return {
          ...provider.toObject(),
          services
        };
      })
    );

    res.json({
      providers: providersWithServices,
      total: providers.length
    });
  } catch (error) {
    console.error('Get nearby providers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getProviderProfile = async (req, res) => {
  try {
    const provider = await User.findById(req.params.id)
      .select('-password')
      .where('role').equals('provider');

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    // Get provider's services
    const services = await Service.find({
      providerId: provider._id,
      isActive: true
    });

    // Get provider's stats
    const stats = await Booking.aggregate([
      { $match: { providerId: require('mongoose').Types.ObjectId(provider._id) } },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          completedBookings: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          },
          totalEarnings: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, '$totalAmount', 0]
            }
          }
        }
      }
    ]);

    const providerStats = stats[0] || {
      totalBookings: 0,
      completedBookings: 0,
      totalEarnings: 0
    };

    res.json({
      provider,
      services,
      stats: providerStats
    });
  } catch (error) {
    console.error('Get provider profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        'profileData.location': {
          type: 'Point',
          coordinates: [Number(longitude), Number(latitude)]
        }
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Location updated successfully',
      user
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const searchProviders = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;

    let query = {
      role: 'provider',
      isActive: true
    };

    // Text search on provider profile
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'profileData.skills': { $regex: search, $options: 'i' } },
        { 'profileData.bio': { $regex: search, $options: 'i' } }
      ];
    }

    const providers = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Filter by category through services
    let filteredProviders = providers;
    if (category && category !== 'all') {
      const servicesQuery = { category, isActive: true };
      const services = await Service.find(servicesQuery).distinct('providerId');
      filteredProviders = providers.filter(p => 
        services.some(serviceProviderId => serviceProviderId.toString() === p._id.toString())
      );
    }

    // Get services for each provider
    const providersWithServices = await Promise.all(
      filteredProviders.map(async (provider) => {
        const services = await Service.find({
          providerId: provider._id,
          isActive: true,
          ...(category && category !== 'all' ? { category } : {})
        });
        
        return {
          ...provider.toObject(),
          services
        };
      })
    );

    res.json({
      providers: providersWithServices,
      total: filteredProviders.length
    });
  } catch (error) {
    console.error('Search providers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getNearbyProviders,
  getProviderProfile,
  updateLocation,
  searchProviders
};