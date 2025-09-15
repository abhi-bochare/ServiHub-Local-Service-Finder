# Service Booking Platform - Backend

A Node.js/Express backend for a service booking platform with customer and provider roles.

## Features

- JWT-based authentication with role management
- Real-time notifications using Socket.IO
- Geolocation-based provider search
- Complete booking management system
- Reviews and ratings system
- RESTful API design
- MongoDB integration with Mongoose

## Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

3. Update the `.env` file with your values:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:3000
```

4. Seed the database with sample data:
```bash
npm run seed
```

5. Start the development server:
```bash
npm run dev
```

The server will start on http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Services
- `GET /api/services` - Get all services (with filtering)
- `GET /api/services/:id` - Get single service
- `POST /api/services` - Create service (provider only)
- `PUT /api/services/:id` - Update service (provider only)
- `DELETE /api/services/:id` - Delete service (provider only)

### Bookings
- `GET /api/bookings` - Get user bookings
- `GET /api/bookings/:id` - Get single booking
- `POST /api/bookings` - Create booking (customer only)
- `PUT /api/bookings/:id/status` - Update booking status (provider only)
- `PUT /api/bookings/:id/cancel` - Cancel booking (customer only)
- `GET /api/bookings/stats` - Get booking statistics

### Reviews
- `GET /api/reviews` - Get reviews
- `GET /api/reviews/:id` - Get single review
- `POST /api/reviews` - Create review (customer only)
- `GET /api/reviews/provider/:id/stats` - Get provider review stats

### Providers
- `GET /api/providers/nearby` - Find nearby providers
- `GET /api/providers/search` - Search providers
- `GET /api/providers/:id` - Get provider profile
- `PUT /api/providers/location` - Update provider location

## Database Schema

### Users Collection
- Authentication and profile data
- Role-based access (customer/provider)
- Geolocation support for providers
- Rating and earnings tracking

### Services Collection
- Service offerings by providers
- Category and pricing information
- Full-text search capabilities

### Bookings Collection
- Booking management with status tracking
- Customer and provider relationship
- Payment and completion tracking

### Reviews Collection
- Customer reviews for completed bookings
- Rating system integration
- Provider reputation management

## Sample Data

The seed script creates:
- 1 sample customer account: `customer@example.com` / `password123`
- 1 sample provider account: `provider@example.com` / `password123`
- Sample services, bookings, and reviews

## Deployment

### Render Deployment

1. Create a new Web Service on Render
2. Connect your repository
3. Configure environment variables:
   - `MONGO_URI` - Your MongoDB connection string
   - `JWT_SECRET` - Your JWT secret key
   - `CLIENT_URL` - Your frontend URL (e.g., https://your-app.netlify.app)
4. Deploy!

The build command: `npm install`
The start command: `npm start`

## Real-time Features

The application uses Socket.IO for real-time updates:
- New booking notifications for providers
- Booking status updates for customers
- Automatic UI updates without page refresh

## Error Handling

- Comprehensive error handling middleware
- Input validation using express-validator
- Proper HTTP status codes
- Detailed error messages in development

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Input sanitization and validation
- CORS configuration