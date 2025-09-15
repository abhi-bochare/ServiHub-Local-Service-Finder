import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import SearchFilters from "../components/SearchFilters";
import ServiceCard from "../components/ServiceCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { Star, Users, Calendar, Award } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

const Home = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
    fetchServices();
  }, [filters]);

  const fetchServices = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page,
        limit: 12,
      };

      const response = await axios.get("/services", { params });

      setServices(response.data.services);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total,
      });
    } catch (error) {
      console.error("Failed to fetch services:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page) => {
    fetchServices(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading && services.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-700/90 to-purple-800/90 text-white">
        {/* Background Image */}
        <img
          src="/serv.jpg"
          alt="Local services"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1
            className="text-4xl md:text-6xl font-extrabold mb-6"
            data-aos="fade-up"
          >
            Find Trusted Local Service Providers
          </h1>
          <p
            className="text-xl md:text-2xl mb-8 text-blue-100"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            Book electricians, plumbers, tutors & more – anytime, anywhere
          </p>

          {!user && (
            <div
              className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6"
              data-aos="zoom-in"
              data-aos-delay="400"
            >
              <a
                href="/register"
                className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transition-transform"
              >
                Get Started
              </a>
              <a
                href="/register?role=provider"
                className="border border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-blue-600 shadow-lg hover:scale-105 transition-transform"
              >
                Become a Provider
              </a>
            </div>
          )}
        </div>

        {/* SVG Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
          <svg viewBox="0 0 1440 320" className="w-full h-20">
            <path
              fill="#fff"
              fillOpacity="1"
              d="M0,224L1440,96L1440,320L0,320Z"
            ></path>
          </svg>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {[
              {
                icon: Users,
                value: "500+",
                label: "Service Providers",
                color: "text-blue-600",
              },
              {
                icon: Calendar,
                value: "10k+",
                label: "Bookings Completed",
                color: "text-green-600",
              },
              {
                icon: Star,
                value: "4.8",
                label: "Average Rating",
                color: "text-yellow-600",
              },
              {
                icon: Award,
                value: "98%",
                label: "Customer Satisfaction",
                color: "text-purple-600",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="text-center p-6 bg-gray-50 rounded-xl shadow-md hover:shadow-xl transition-transform hover:scale-105"
                data-aos="fade-up"
                data-aos-delay={i * 200}
              >
                <div className="flex justify-center mb-4">
                  <stat.icon className={`h-10 w-10 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="relative bg-blue-100">
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
          <svg
            viewBox="0 0 1440 320"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-32"
            preserveAspectRatio="none"
          >
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,192L48,186.7C96,181,192,171,288,154.7C384,139,480,117,576,106.7C672,96,768,96,864,106.7C960,117,1056,139,1152,149.3C1248,160,1344,160,1392,160L1440,160L1440,320L0,320Z"
            ></path>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Explore Our Services
            </h2>
            <p className="text-xl text-gray-600">
              Find the right professional for your needs
            </p>
          </div>

          <SearchFilters onFiltersChange={handleFiltersChange} />

          {loading && services.length > 0 && (
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Updating results...</span>
              </div>
            </div>
          )}

          {services.length > 0 ? (
            <>
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10"
                data-aos="fade-up"
                data-aos-delay="300"
              >
                {services.map((service) => (
                  <ServiceCard key={service._id} service={service} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div
                  className="flex justify-center items-center space-x-2"
                  data-aos="fade-up"
                >
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                  >
                    Previous
                  </button>

                  <div className="flex space-x-1">
                    {[...Array(pagination.totalPages)].map((_, index) => {
                      const page = index + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 rounded-lg ${
                            page === pagination.currentPage
                              ? "bg-blue-600 text-white"
                              : "border border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                  >
                    Next
                  </button>
                </div>
              )}

              <div
                className="text-center mt-6 text-gray-600"
                data-aos="fade-up"
              >
                Showing {services.length} of {pagination.total} services
              </div>
            </>
          ) : (
            <div className="text-center py-12" data-aos="fade-up">
              <div className="text-gray-500 text-lg mb-4">
                {Object.keys(filters).some((key) => filters[key])
                  ? "No services match your current filters"
                  : "No services available at the moment"}
              </div>
              {Object.keys(filters).some((key) => filters[key]) && (
                <p className="text-gray-400">
                  Try adjusting your search criteria or location
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
