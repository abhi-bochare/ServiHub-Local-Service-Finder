import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, DollarSign, User } from 'lucide-react';

const ServiceCard = ({ service }) => {
  const {
    _id,
    title,
    description,
    category,
    rate,
    duration,
    tags = [],
    providerId
  } = service;

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

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
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {title}
            </h3>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize ${categoryColors[category] || categoryColors.other}`}>
              {category}
            </span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {description}
        </p>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                +{tags.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1 text-gray-600">
              <DollarSign size={16} />
              <span>${rate}/hour</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-600">
              <Clock size={16} />
              <span>{formatDuration(duration)}</span>
            </div>
          </div>
          
          {providerId && (
            <div className="flex items-center space-x-2 text-sm">
              <User size={16} className="text-gray-400" />
              <span className="text-gray-700 font-medium">{providerId.name}</span>
              {providerId.rating?.average > 0 && (
                <div className="flex items-center space-x-1">
                  <Star size={14} className="text-yellow-400 fill-current" />
                  <span className="text-gray-600">
                    {providerId.rating.average.toFixed(1)} ({providerId.rating.count})
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <Link
            to={`/service/${_id}`}
            className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            View Details
          </Link>
          {providerId && (
            <Link
              to={`/provider/${providerId._id}`}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              Provider
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;