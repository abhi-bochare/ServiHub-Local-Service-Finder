import React, { useState, useEffect } from 'react';
import { Search, MapPin, Filter, X } from 'lucide-react';

const SearchFilters = ({ onFiltersChange, onLocationSearch }) => {
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    minRate: '',
    maxRate: '',
    useLocation: false
  });

  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    error: null,
    loading: false
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'gardening', label: 'Gardening' },
    { value: 'painting', label: 'Painting' },
    { value: 'carpentry', label: 'Carpentry' },
    { value: 'tutoring', label: 'Tutoring' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    onFiltersChange({
      ...filters,
      latitude: location.latitude,
      longitude: location.longitude
    });
  }, [filters, location.latitude, location.longitude]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleLocationToggle = () => {
    if (!filters.useLocation) {
      // Enable location
      setLocation(prev => ({ ...prev, loading: true, error: null }));
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              error: null,
              loading: false
            });
            setFilters(prev => ({ ...prev, useLocation: true }));
          },
          (error) => {
            setLocation(prev => ({
              ...prev,
              error: 'Unable to get your location',
              loading: false
            }));
          },
          { timeout: 10000 }
        );
      } else {
        setLocation(prev => ({
          ...prev,
          error: 'Geolocation is not supported',
          loading: false
        }));
      }
    } else {
      // Disable location
      setLocation({ latitude: null, longitude: null, error: null, loading: false });
      setFilters(prev => ({ ...prev, useLocation: false }));
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      minRate: '',
      maxRate: '',
      useLocation: false
    });
    setLocation({ latitude: null, longitude: null, error: null, loading: false });
  };

  const hasActiveFilters = filters.search || filters.category !== 'all' || 
                          filters.minRate || filters.maxRate || filters.useLocation;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Search Input */}
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search services..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Category Filter */}
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {categories.map(category => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>

        {/* Rate Range */}
        <div className="flex space-x-2">
          <input
            type="number"
            placeholder="Min $"
            value={filters.minRate}
            onChange={(e) => handleFilterChange('minRate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="number"
            placeholder="Max $"
            value={filters.maxRate}
            onChange={(e) => handleFilterChange('maxRate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Location Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleLocationToggle}
            disabled={location.loading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              filters.useLocation
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${location.loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <MapPin size={18} />
            <span className="text-sm font-medium">
              {location.loading ? 'Getting...' : 'Near Me'}
            </span>
          </button>
        </div>
      </div>

      {location.error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
          {location.error}
        </div>
      )}

      {filters.useLocation && location.latitude && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg text-sm">
          ✓ Location enabled - showing nearby providers
        </div>
      )}

      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-600">
            {Object.values(filters).filter(Boolean).length} filter(s) active
          </span>
          <button
            onClick={clearFilters}
            className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700"
          >
            <X size={16} />
            <span>Clear All</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;