const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected for seeding');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Service.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});

    console.log('Cleared existing data');

    // Create sample customer
    const customer = new User({
      name: 'John Doe',
      email: 'customer@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'customer',
      profileData: {
        phone: '+1234567890',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001'
      }
    });

    await customer.save();
    console.log('Created sample customer');

    // Create sample provider
    const provider = new User({
      name: 'Jane Smith',
      email: 'provider@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'provider',
      profileData: {
        phone: '+1987654321',
        address: '456 Oak Ave',
        city: 'New York',
        state: 'NY',
        zipCode: '10002',
        skills: ['House Cleaning', 'Deep Cleaning', 'Office Cleaning'],
        hourlyRate: 25,
        bio: 'Professional cleaning service with 5+ years of experience. I provide thorough and reliable cleaning services for homes and offices.',
        experience: '5+ years',
        location: {
          type: 'Point',
          coordinates: [-74.006, 40.7128] // NYC coordinates
        }
      },
      rating: {
        average: 4.5,
        count: 10
      },
      totalEarnings: 1250
    });

    await provider.save();
    console.log('Created sample provider');

    // Create sample services
    const services = [
      {
        providerId: provider._id,
        title: 'House Deep Cleaning',
        description: 'Complete house cleaning service including all rooms, kitchen, and bathrooms. Uses eco-friendly products.',
        category: 'cleaning',
        rate: 25,
        duration: 120,
        tags: ['deep-cleaning', 'eco-friendly', 'residential'],
        requirements: ['Access to all rooms', 'Parking space nearby']
      },
      {
        providerId: provider._id,
        title: 'Office Cleaning',
        description: 'Professional office cleaning service for small to medium businesses. Flexible scheduling available.',
        category: 'cleaning',
        rate: 30,
        duration: 90,
        tags: ['office', 'commercial', 'flexible'],
        requirements: ['After-hours access preferred', 'Cleaning supplies provided']
      },
      {
        providerId: provider._id,
        title: 'Move-in/Move-out Cleaning',
        description: 'Comprehensive cleaning service for moving transitions. Perfect for getting deposits back or preparing new homes.',
        category: 'cleaning',
        rate: 35,
        duration: 180,
        tags: ['move-in', 'move-out', 'comprehensive'],
        requirements: ['Empty or mostly empty space', '3-hour minimum booking']
      }
    ];

    const createdServices = await Service.insertMany(services);
    console.log('Created sample services');

    // Create sample booking
    const booking = new Booking({
      customerId: customer._id,
      providerId: provider._id,
      serviceId: createdServices[0]._id,
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      duration: 120,
      totalAmount: 50, // 2 hours * $25/hour
      customerNotes: 'Please focus on the kitchen and bathrooms. Have two cats, so please be careful with doors.',
      customerAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        coordinates: [-73.985, 40.748]
      },
      status: 'pending'
    });

    await booking.save();
    console.log('Created sample booking');

    // Create sample completed booking for review
    const completedBooking = new Booking({
      customerId: customer._id,
      providerId: provider._id,
      serviceId: createdServices[0]._id,
      scheduledDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      duration: 120,
      totalAmount: 50,
      customerNotes: 'Previous cleaning was excellent!',
      customerAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        coordinates: [-73.985, 40.748]
      },
      status: 'completed',
      completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      isReviewSubmitted: true
    });

    await completedBooking.save();
    console.log('Created sample completed booking');

    // Create sample review
    const review = new Review({
      bookingId: completedBooking._id,
      customerId: customer._id,
      providerId: provider._id,
      serviceId: createdServices[0]._id,
      rating: 5,
      comment: 'Excellent service! Jane was very professional and thorough. My house has never been cleaner. Highly recommend!'
    });

    await review.save();
    console.log('Created sample review');

    console.log('\n✅ Seed data created successfully!');
    console.log('\n📧 Sample accounts:');
    console.log('Customer: customer@example.com / password123');
    console.log('Provider: provider@example.com / password123');
    console.log('\n🎯 You can now test the full booking flow!');

  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seeder
const runSeeder = async () => {
  await connectDB();
  await seedData();
};

runSeeder();