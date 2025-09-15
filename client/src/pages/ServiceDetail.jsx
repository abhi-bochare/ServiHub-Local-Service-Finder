import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { format, addDays, isAfter, startOfDay } from 'date-fns';
import {
  Star,
  Clock,
  DollarSign,
  MapPin,
  User,
  Calendar,
  CheckCircle,
  Tag,
  AlertCircle
} from 'lucide-react';

const ServiceDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated, isCustomer } = useAuth();
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    duration: 60,
    customerNotes: '',
    customerAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });

  useEffect(() => {
    fetchService();
    fetchReviews();
  }, [id]);

  const fetchService = async () => {
    try {
      const response = await axios.get(`/services/${id}`);
      setService(response.data);
      setBookingData(prev => ({
        ...prev,
        duration: response.data.duration
      }));
    } catch (error) {
      console.error('Failed to fetch service:', error);
      toast.error('Service not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`/reviews`, {
        params: { providerId: service?.providerId?._id }
      });
      setReviews(response.data.reviews);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to book this service');
      return;
    }

    if (!isCustomer) {
      toast.error('Only customers can book services');
      return;
    }

    setBookingLoading(true);

    try {
      const scheduledDateTime = new Date(`${bookingData.scheduledDate}T${bookingData.scheduledTime}`);
      
      if (!isAfter(scheduledDateTime, new Date())) {
        toast.error('Please select a future date and time');
        setBookingLoading(false);
        return;
      }

      const bookingPayload = {
        serviceId: service._id,
        scheduledDate: scheduledDateTime.toISOString(),
        duration: bookingData.duration,
        customerNotes: bookingData.customerNotes,
        customerAddress: bookingData.customerAddress
      };

      await axios.post('/bookings', bookingPayload);
      toast.success('Booking request sent successfully!');
      setShowBookingModal(false);
      
      // Reset form
      setBookingData({
        scheduledDate: '',
        scheduledTime: '',
        duration: service.duration,
        customerNotes: '',
        customerAddress: {
          street: '',
          city: '',
          state: '',
          zipCode: ''
        }
      });
    } catch (error) {
      console.error('Booking failed:', error);
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  const calculateTotal = () => {
    return ((service?.rate || 0) * (bookingData.duration || 0)) / 60;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Service not found</h2>
          <Link to="/" className="text-blue-600 hover:text-blue-700">
            Back to services
          </Link>
        </div>
      </div>
    );
  }

  const categoryColors = {
    cleaning: 'bg-blue-100 text-blue-800',
    plumbing: 'bg-green-100 text-green-800',
    electrical: 'bg-yellow-100 text-yellow-800',
    gardening: 'bg-green-100 text-green-800',
    painting: 'bg-purple-100 text-purple-800',
    carpentry: 'bg-orange-100 text-orange-800',
    tutoring: 'bg-pink-100 text-pink-800',
    other: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Service Header */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${categoryColors[service.category] || categoryColors.other}`}>
                    {service.category}
                  </span>
                  {service.tags && service.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                      <Tag size={12} className="mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {service.title}
                </h1>
                
                <p className="text-gray-600 text-lg mb-6">
                  {service.description}
                </p>

                {/* Service Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Rate</p>
                      <p className="font-semibold text-gray-900">${service.rate}/hour</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-semibold text-gray-900">{formatDuration(service.duration)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-semibold text-green-600">Available</p>
                    </div>
                  </div>
                </div>

                {/* Requirements */}
                {service.requirements && service.requirements.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <AlertCircle size={20} className="mr-2 text-orange-500" />
                      Requirements
                    </h3>
                    <ul className="space-y-2">
                      {service.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-center text-gray-600">
                          <CheckCircle size={16} className="mr-2 text-green-500" />
                          {requirement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-8 lg:mt-0 lg:ml-8">
                <div className="bg-gray-50 rounded-xl p-6 max-w-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Book This Service</h3>
                  
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      ${service.rate}
                    </div>
                    <div className="text-gray-500">per hour</div>
                  </div>

                  {isAuthenticated && isCustomer ? (
                    <button
                      onClick={() => setShowBookingModal(true)}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Book Now
                    </button>
                  ) : isAuthenticated ? (
                    <div className="text-center text-gray-600">
                      Only customers can book services
                    </div>
                  ) : (
                    <Link
                      to="/login"
                      className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium text-center hover:bg-blue-700 transition-colors"
                    >
                      Login to Book
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Provider Information */}
        {service.providerId && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Provider</h2>
            
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User size={24} className="text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  {service.providerId.name}
                </h3>
                
                <div className="flex items-center space-x-4 mt-2">
                  {service.providerId.rating?.average > 0 && (
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">
                        {service.providerId.rating.average.toFixed(1)} ({service.providerId.rating.count} reviews)
                      </span>
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-600">
                    ${service.providerId.totalEarnings || 0} earned
                  </div>
                </div>

                {service.providerId.profileData?.bio && (
                  <p className="text-gray-600 mt-2">{service.providerId.profileData.bio}</p>
                )}
              </div>
              
              <Link
                to={`/provider/${service.providerId._id}`}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                View Profile
              </Link>
            </div>
          </div>
        )}

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Customer Reviews</h2>
            
            <div className="space-y-6">
              {reviews.slice(0, 3).map((review) => (
                <div key={review._id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {review.customerId?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(review.createdAt), 'PPP')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={
                            i < review.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }
                        />
                      ))}
                    </div>
                  </div>
                  
                  {review.comment && (
                    <p className="text-gray-600">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
            
            {reviews.length > 3 && (
              <div className="text-center mt-6">
                <Link
                  to={`/provider/${service.providerId._id}#reviews`}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all {reviews.length} reviews
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Book Service</h3>
              
              <form onSubmit={handleBooking} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      required
                      min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                      value={bookingData.scheduledDate}
                      onChange={(e) => setBookingData(prev => ({...prev, scheduledDate: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time
                    </label>
                    <input
                      type="time"
                      required
                      value={bookingData.scheduledTime}
                      onChange={(e) => setBookingData(prev => ({...prev, scheduledTime: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <select
                    value={bookingData.duration}
                    onChange={(e) => setBookingData(prev => ({...prev, duration: Number(e.target.value)}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {[60, 90, 120, 180, 240, 300, 360].map(duration => (
                      <option key={duration} value={duration}>
                        {formatDuration(duration)} - ${((service.rate * duration) / 60).toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Street address"
                    value={bookingData.customerAddress.street}
                    onChange={(e) => setBookingData(prev => ({
                      ...prev,
                      customerAddress: { ...prev.customerAddress, street: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-3"
                  />
                  
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="City"
                      value={bookingData.customerAddress.city}
                      onChange={(e) => setBookingData(prev => ({
                        ...prev,
                        customerAddress: { ...prev.customerAddress, city: e.target.value }
                      }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="text"
                      required
                      placeholder="State"
                      value={bookingData.customerAddress.state}
                      onChange={(e) => setBookingData(prev => ({
                        ...prev,
                        customerAddress: { ...prev.customerAddress, state: e.target.value }
                      }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="text"
                      required
                      placeholder="ZIP"
                      value={bookingData.customerAddress.zipCode}
                      onChange={(e) => setBookingData(prev => ({
                        ...prev,
                        customerAddress: { ...prev.customerAddress, zipCode: e.target.value }
                      }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions (optional)
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Any special requests or instructions..."
                    value={bookingData.customerNotes}
                    onChange={(e) => setBookingData(prev => ({...prev, customerNotes: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Booking Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Booking Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Service:</span>
                      <span>{service.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{formatDuration(bookingData.duration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rate:</span>
                      <span>${service.rate}/hour</span>
                    </div>
                    <div className="flex justify-between font-medium text-lg pt-2 border-t">
                      <span>Total:</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors"
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

export default ServiceDetail;