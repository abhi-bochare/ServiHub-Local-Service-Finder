import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  DollarSign,
  User,
  MapPin,
  MessageCircle,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

const BookingDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      const response = await axios.get(`/bookings/${id}`);
      setBooking(response.data);
    } catch (error) {
      console.error('Failed to fetch booking:', error);
      toast.error('Booking not found');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status, notes = '') => {
    if (!confirm(`Are you sure you want to ${status} this booking?`)) return;

    setActionLoading(true);
    try {
      const payload = { status };
      if (notes) payload.providerNotes = notes;

      await axios.put(`/bookings/${booking._id}/status`, payload);
      toast.success(`Booking ${status} successfully`);
      fetchBooking();
    } catch (error) {
      console.error('Failed to update booking status:', error);
      toast.error(error.response?.data?.message || 'Failed to update booking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    setActionLoading(true);
    try {
      await axios.put(`/bookings/${booking._id}/cancel`);
      toast.success('Booking cancelled successfully');
      fetchBooking();
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post('/reviews', {
        bookingId: booking._id,
        rating: reviewData.rating,
        comment: reviewData.comment
      });
      
      toast.success('Review submitted successfully!');
      setShowReviewModal(false);
      fetchBooking();
    } catch (error) {
      console.error('Failed to submit review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking not found</h2>
          <button 
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-700"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = {
    pending: { 
      color: 'bg-yellow-100 text-yellow-800', 
      icon: AlertCircle,
      label: 'Pending Confirmation'
    },
    accepted: { 
      color: 'bg-blue-100 text-blue-800', 
      icon: CheckCircle,
      label: 'Accepted'
    },
    rejected: { 
      color: 'bg-red-100 text-red-800', 
      icon: XCircle,
      label: 'Rejected'
    },
    'in-progress': { 
      color: 'bg-purple-100 text-purple-800', 
      icon: Clock,
      label: 'In Progress'
    },
    completed: { 
      color: 'bg-green-100 text-green-800', 
      icon: CheckCircle,
      label: 'Completed'
    },
    cancelled: { 
      color: 'bg-gray-100 text-gray-800', 
      icon: XCircle,
      label: 'Cancelled'
    }
  };

  const currentStatus = statusConfig[booking.status] || statusConfig.pending;
  const StatusIcon = currentStatus.icon;

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  const canUpdateStatus = user.role === 'provider' && 
    booking.providerId._id === user.id && 
    ['pending', 'accepted'].includes(booking.status);

  const canCancel = user.role === 'customer' && 
    booking.customerId._id === user.id && 
    ['pending', 'accepted'].includes(booking.status);

  const canReview = user.role === 'customer' && 
    booking.customerId._id === user.id && 
    booking.status === 'completed' && 
    !booking.isReviewSubmitted;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Booking Details
              </h1>
              <p className="text-gray-600">Booking ID: {booking._id}</p>
            </div>
            
            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${currentStatus.color}`}>
                <StatusIcon size={16} className="mr-2" />
                {currentStatus.label}
              </span>
            </div>
          </div>

          {/* Service Info */}
          <div className="border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">{booking.serviceId.title}</h4>
                <p className="text-gray-600 text-sm mb-3">{booking.serviceId.description}</p>
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
                  {booking.serviceId.category}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Rate:</span>
                  <span className="font-medium">${booking.serviceId.rate}/hour</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{formatDuration(booking.duration)}</span>
                </div>
                <div className="flex items-center justify-between text-lg">
                  <span className="font-medium text-gray-900">Total Amount:</span>
                  <span className="font-bold text-green-600">${booking.totalAmount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Schedule & Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Schedule & Location</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Calendar size={20} className="text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {format(new Date(booking.scheduledDate), 'EEEE, MMMM dd, yyyy')}
                    </p>
                    <p className="text-gray-600">
                      {format(new Date(booking.scheduledDate), 'h:mm a')}
                    </p>
                  </div>
                </div>

                {booking.customerAddress && (
                  <div className="flex items-start space-x-3">
                    <MapPin size={20} className="text-gray-400 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Service Address</p>
                      <p className="text-gray-600">
                        {booking.customerAddress.street}<br />
                        {booking.customerAddress.city}, {booking.customerAddress.state} {booking.customerAddress.zipCode}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Participants */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Participants</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Customer</p>
                    <p className="text-gray-600">{booking.customerId.name}</p>
                    <p className="text-sm text-gray-500">{booking.customerId.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <User size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Provider</p>
                    <p className="text-gray-600">{booking.providerId.name}</p>
                    <p className="text-sm text-gray-500">{booking.providerId.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {(booking.customerNotes || booking.providerNotes) && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
              
              <div className="space-y-4">
                {booking.customerNotes && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <MessageCircle size={16} className="text-blue-600" />
                      <span className="font-medium text-blue-900">Customer Notes</span>
                    </div>
                    <p className="text-blue-800">{booking.customerNotes}</p>
                  </div>
                )}

                {booking.providerNotes && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <MessageCircle size={16} className="text-green-600" />
                      <span className="font-medium text-green-900">Provider Notes</span>
                    </div>
                    <p className="text-green-800">{booking.providerNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
          
          <div className="flex flex-wrap gap-3">
            {canUpdateStatus && booking.status === 'pending' && (
              <>
                <button
                  onClick={() => handleStatusUpdate('accepted')}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  Accept Booking
                </button>
                <button
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  Reject Booking
                </button>
              </>
            )}

            {canUpdateStatus && booking.status === 'accepted' && (
              <button
                onClick={() => handleStatusUpdate('completed')}
                disabled={actionLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                Mark as Completed
              </button>
            )}

            {canCancel && (
              <button
                onClick={handleCancelBooking}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Cancel Booking
              </button>
            )}

            {canReview && (
              <button
                onClick={() => setShowReviewModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Write Review
              </button>
            )}

            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Write a Review</h3>
              
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}
                        className="focus:outline-none"
                      >
                        <Star
                          size={24}
                          className={
                            star <= reviewData.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comment (optional)
                  </label>
                  <textarea
                    rows="4"
                    value={reviewData.comment}
                    onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Share your experience with this service..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Submit Review
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
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

export default BookingDetail;