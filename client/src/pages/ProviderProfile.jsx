import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import ServiceCard from '../components/ServiceCard';
import { Star, User, MapPin, DollarSign, Calendar, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

const ProviderProfile = () => {
  const { id } = useParams();
  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProviderProfile();
    fetchReviews();
  }, [id]);

  const fetchProviderProfile = async () => {
    try {
      const response = await axios.get(`/providers/${id}`);
      setProvider(response.data.provider);
      setServices(response.data.services);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch provider profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`/reviews`, {
        params: { providerId: id }
      });
      setReviews(response.data.reviews);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Provider not found</h2>
          <a href="/" className="text-blue-600 hover:text-blue-700">
            Back to services
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Provider Header */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-center space-x-6 mb-6 lg:mb-0">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User size={40} className="text-white" />
                </div>
                
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {provider.name}
                  </h1>
                  
                  <div className="flex items-center space-x-4 mb-3">
                    {provider.rating?.average > 0 && (
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={20}
                              className={
                                i < Math.floor(provider.rating.average)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }
                            />
                          ))}
                        </div>
                        <span className="text-lg font-medium text-gray-900">
                          {provider.rating.average.toFixed(1)}
                        </span>
                        <span className="text-gray-500">
                          ({provider.rating.count} reviews)
                        </span>
                      </div>
                    )}
                  </div>

                  {provider.profileData?.skills && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {provider.profileData.skills.slice(0, 5).map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {provider.profileData.skills.length > 5 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                          +{provider.profileData.skills.length - 5} more
                        </span>
                      )}
                    </div>
                  )}

                  {provider.profileData?.bio && (
                    <p className="text-gray-600 max-w-2xl">
                      {provider.profileData.bio}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 min-w-[280px]">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">Total Bookings</span>
                    </div>
                    <span className="font-semibold text-gray-900">{stats.totalBookings || 0}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">Completed</span>
                    </div>
                    <span className="font-semibold text-gray-900">{stats.completedBookings || 0}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">Total Earned</span>
                    </div>
                    <span className="font-semibold text-gray-900">${stats.totalEarnings || 0}</span>
                  </div>

                  {provider.profileData?.hourlyRate && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <DollarSign size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-600">Base Rate</span>
                      </div>
                      <span className="font-semibold text-green-600">
                        ${provider.profileData.hourlyRate}/hr
                      </span>
                    </div>
                  )}

                  {provider.createdAt && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <User size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-600">Member Since</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {format(new Date(provider.createdAt), 'MMM yyyy')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Services */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md mb-8">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Services Offered</h2>
              </div>
              
              <div className="p-6">
                {services.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6">
                    {services.map((service) => (
                      <ServiceCard key={service._id} service={service} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No services available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md" id="reviews">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Recent Reviews</h2>
              </div>
              
              <div className="p-6">
                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.slice(0, 5).map((review) => (
                      <div key={review._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <User size={14} className="text-white" />
                            </div>
                            <span className="font-medium text-gray-900 text-sm">
                              {review.customerId?.name}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
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
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {review.comment}
                          </p>
                        )}
                        
                        <p className="text-xs text-gray-500 mt-2">
                          {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    ))}
                    
                    {reviews.length > 5 && (
                      <div className="text-center pt-4">
                        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                          View all {reviews.length} reviews
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No reviews yet</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Reviews will appear after completed bookings
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfile;