import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, DollarSign, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const BookingCard = ({ booking, userRole, onStatusUpdate }) => {
  const {
    _id,
    serviceId,
    customerId,
    providerId,
    scheduledDate,
    duration,
    totalAmount,
    status,
    customerNotes,
    providerNotes
  } = booking;

  const statusConfig = {
    pending: { 
      color: 'bg-yellow-100 text-yellow-800', 
      icon: AlertCircle,
      label: 'Pending'
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

  const currentStatus = statusConfig[status] || statusConfig.pending;
  const StatusIcon = currentStatus.icon;

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  const canUpdateStatus = userRole === 'provider' && ['pending', 'accepted'].includes(status);
  const canCancel = userRole === 'customer' && ['pending', 'accepted'].includes(status);

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {serviceId?.title}
            </h3>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${currentStatus.color}`}>
                <StatusIcon size={14} className="mr-1" />
                {currentStatus.label}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <Calendar size={16} />
            <span>{format(new Date(scheduledDate), 'PPP')} at {format(new Date(scheduledDate), 'p')}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1 text-gray-600">
              <Clock size={16} />
              <span>{formatDuration(duration)}</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-900 font-medium">
              <DollarSign size={16} />
              <span>${totalAmount}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-sm">
            <User size={16} className="text-gray-400" />
            <span className="text-gray-700">
              {userRole === 'customer' 
                ? `Provider: ${providerId?.name}` 
                : `Customer: ${customerId?.name}`
              }
            </span>
          </div>
        </div>

        {(customerNotes || providerNotes) && (
          <div className="border-t border-gray-200 pt-4 mb-4">
            {customerNotes && (
              <div className="mb-2">
                <p className="text-xs font-medium text-gray-500 mb-1">Customer Notes:</p>
                <p className="text-sm text-gray-700">{customerNotes}</p>
              </div>
            )}
            {providerNotes && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Provider Notes:</p>
                <p className="text-sm text-gray-700">{providerNotes}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex space-x-2">
          <Link
            to={`/booking/${_id}`}
            className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            View Details
          </Link>
          
          {canUpdateStatus && status === 'pending' && (
            <>
              <button
                onClick={() => onStatusUpdate(_id, 'accepted')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
              >
                Accept
              </button>
              <button
                onClick={() => onStatusUpdate(_id, 'rejected')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
              >
                Reject
              </button>
            </>
          )}

          {canUpdateStatus && status === 'accepted' && (
            <button
              onClick={() => onStatusUpdate(_id, 'completed')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
            >
              Complete
            </button>
          )}

          {canCancel && (
            <button
              onClick={() => onStatusUpdate(_id, 'cancelled')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingCard;