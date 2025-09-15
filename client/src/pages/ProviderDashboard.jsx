import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import BookingCard from '../components/BookingCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
  Calendar, 
  DollarSign, 
  Star, 
  Users, 
  Plus, 
  TrendingUp, 
  Settings,
  Filter 
} from 'lucide-react';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [newService, setNewService] = useState({
    title: '',
    description: '',
    category: 'cleaning',
    rate: '',
    duration: 60,
    tags: '',
    requirements: ''
  });

  useEffect(() => {
    fetchBookings();
    fetchServices();
    fetchStats();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await axios.get('/bookings', { params });
      setBookings(response.data.bookings);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast.error('Failed to load bookings');
    }
  };

  const fetchServices = async () => {
    try {
      const response = await axios.get('/services/provider/my-services');
      setServices(response.data);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/bookings/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, status) => {
    try {
      await axios.put(`/bookings/${bookingId}/status`, { status });
      toast.success(`Booking ${status} successfully`);
      fetchBookings();
      fetchStats();
    } catch (error) {
      console.error('Failed to update booking status:', error);
      toast.error(error.response?.data?.message || 'Failed to update booking');
    }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    
    try {
      const serviceData = {
        ...newService,
        rate: Number(newService.rate),
        tags: newService.tags ? newService.tags.split(',').map(tag => tag.trim()) : [],
        requirements: newService.requirements ? newService.requirements.split(',').map(req => req.trim()) : []
      };

      await axios.post('/services', serviceData);
      toast.success('Service created successfully');
      setShowServiceModal(false);
      setNewService({
        title: '',
        description: '',
        category: 'cleaning',
        rate: '',
        duration: 60,
        tags: '',
        requirements: ''
      });
      fetchServices();
    } catch (error) {
      console.error('Failed to create service:', error);
      toast.error(error.response?.data?.message || 'Failed to create service');
    }
  };

  const categories = [
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'gardening', label: 'Gardening' },
    { value: 'painting', label: 'Painting' },
    { value: 'carpentry', label: 'Carpentry' },
    { value: 'tutoring', label: 'Tutoring' },
    { value: 'other', label: 'Other' }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Bookings', count: stats.totalBookings || 0 },
    { value: 'pending', label: 'Pending', count: stats.pendingBookings || 0 },
    { value: 'accepted', label: 'Accepted' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed', count: stats.completedBookings || 0 },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Provider Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, {user.name}! Manage your services and bookings
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-400" />
                <span className="font-medium">
                  {user.rating?.average?.toFixed(1) || '0.0'} ({user.rating?.count || 0} reviews)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBookings || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalEarnings || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingBookings || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Services</p>
                <p className="text-2xl font-bold text-gray-900">{services.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Services Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Your Services</h2>
                  <button
                    onClick={() => setShowServiceModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={20} />
                    <span>Add Service</span>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {services.length > 0 ? (
                  <div className="space-y-4">
                    {services.map((service) => (
                      <div key={service._id} className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900">{service.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-sm font-medium text-green-600">
                            ${service.rate}/hour
                          </span>
                          <span className="text-xs text-gray-500 capitalize">
                            {service.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No services yet</h3>
                    <p className="text-gray-600 mb-4">Create your first service to start receiving bookings</p>
                    <button
                      onClick={() => setShowServiceModal(true)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus size={20} className="mr-2" />
                      Add Service
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bookings Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">
                    Recent Bookings
                  </h2>
                  
                  <div className="flex items-center space-x-2">
                    <Filter size={20} className="text-gray-400" />
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {filterOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label} {option.count !== undefined && `(${option.count})`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <BookingCard
                        key={booking._id}
                        booking={booking}
                        userRole="provider"
                        onStatusUpdate={handleStatusUpdate}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar size={64} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {filter === 'all' 
                        ? 'No bookings yet'
                        : `No ${filter} bookings`
                      }
                    </h3>
                    <p className="text-gray-600">
                      {filter === 'all' 
                        ? 'Bookings will appear here once customers book your services'
                        : `You don't have any ${filter} bookings at the moment`
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Service Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Add New Service</h3>
              
              <form onSubmit={handleCreateService} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newService.title}
                    onChange={(e) => setNewService(prev => ({...prev, title: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., House Deep Cleaning"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    required
                    rows="3"
                    value={newService.description}
                    onChange={(e) => setNewService(prev => ({...prev, description: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe your service..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={newService.category}
                      onChange={(e) => setNewService(prev => ({...prev, category: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hourly Rate ($)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="0.01"
                      value={newService.rate}
                      onChange={(e) => setNewService(prev => ({...prev, rate: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="25.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    required
                    min="15"
                    step="15"
                    value={newService.duration}
                    onChange={(e) => setNewService(prev => ({...prev, duration: Number(e.target.value)}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newService.tags}
                    onChange={(e) => setNewService(prev => ({...prev, tags: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="deep-cleaning, eco-friendly, residential"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Service
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowServiceModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderDashboard;