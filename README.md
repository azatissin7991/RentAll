# RentAll

A full-stack rental marketplace application for housing, auto, and parcel listings. Built with React, TypeScript, Node.js, Express, MongoDB, and Cloudinary.

## Features

- **Housing Listings**: Room, apartment, and spot-in-room rentals
- **Auto Listings**: Car rentals and sales with detailed specifications
- **Parcel Shipping**: Package delivery coordination between US and Kazakhstan
- **User Authentication**: Secure registration and login with JWT
- **Image Management**: Cloudinary integration for image uploads and storage
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Advanced Filtering**: Filter listings by location, type, price, and more
- **My Listings**: Users can manage their own listings
- **Contact Form**: EmailJS integration for user feedback

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Vite** for build tooling
- **EmailJS** for contact form notifications
- **Cloudinary** for image uploads (direct client-side upload)

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Cloudinary Admin SDK** for image deletion
- **ES Modules** (type: module)

## Project Structure

```
RentAll/
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   │   ├── ActionButtons.tsx
│   │   │   ├── AutoForm.tsx
│   │   │   ├── BackButton.tsx
│   │   │   ├── HousingForm.tsx
│   │   │   ├── ImageGallery.tsx
│   │   │   ├── ImageModal.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ParcelsForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── constants/        # Application constants
│   │   │   └── index.ts
│   │   ├── context/          # React context providers
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/            # Custom React hooks
│   │   │   └── useImageModal.ts
│   │   ├── pages/            # Page components
│   │   │   ├── AutoDetailPage.tsx
│   │   │   ├── AutoPage.tsx
│   │   │   ├── ContactPage.tsx
│   │   │   ├── HousingDetailPage.tsx
│   │   │   ├── HousingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── MyListingsPage.tsx
│   │   │   ├── ParcelsDetailPage.tsx
│   │   │   ├── ParcelsPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── services/         # API client services
│   │   │   ├── api.ts
│   │   │   └── authApi.ts
│   │   ├── types/            # TypeScript type definitions
│   │   │   └── index.ts
│   │   ├── utils/            # Utility functions
│   │   │   ├── cloudinary.ts
│   │   │   ├── date.ts
│   │   │   ├── formatting.ts
│   │   │   └── imageHelpers.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── backend/
│   ├── controllers/          # Route controllers
│   │   ├── autoController.js
│   │   ├── contactController.js
│   │   ├── housingController.js
│   │   ├── parcelsController.js
│   │   └── userController.js
│   ├── middleware/           # Express middleware
│   │   └── auth.js
│   ├── models/              # Mongoose schemas
│   │   ├── Auto.js
│   │   ├── Contact.js
│   │   ├── Housing.js
│   │   ├── Parcels.js
│   │   └── User.js
│   ├── routes/               # Express routes
│   │   ├── auto.js
│   │   ├── contact.js
│   │   ├── housing.js
│   │   ├── parcels.js
│   │   └── user.js
│   ├── utils/                # Utility functions
│   │   └── cloudinary.js
│   ├── server.js
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB instance (local or cloud)
- Cloudinary account (for image uploads)
- EmailJS account (for contact form)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd RentAll
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Environment Variables

#### Backend (.env in `/backend` directory)

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/rentall

# JWT
JWT_SECRET=your-secret-key-here

# Cloudinary Admin API (for image deletion)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### Frontend (.env in `/frontend` directory)

```env
# Cloudinary (for direct uploads)
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset

# EmailJS (for contact form)
VITE_EMAILJS_SERVICE_ID=your-service-id
VITE_EMAILJS_TEMPLATE_ID=your-template-id
VITE_EMAILJS_PUBLIC_KEY=your-public-key
```

### Running the Application

1. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

2. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   Server runs on `http://localhost:5000`

3. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

## API Documentation

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Housing Listings

- `GET /api/housing` - Get all active listings (public)
- `GET /api/housing/:id` - Get listing by ID (public)
- `GET /api/housing/my-listings` - Get user's listings (requires auth)
- `POST /api/housing` - Create listing (requires auth)
- `PUT /api/housing/:id` - Update listing (requires auth + ownership)
- `DELETE /api/housing/:id` - Delete listing (requires auth + ownership)

### Auto Listings

- `GET /api/auto` - Get all active listings (public)
- `GET /api/auto/:id` - Get listing by ID (public)
- `GET /api/auto/my-listings` - Get user's listings (requires auth)
- `POST /api/auto` - Create listing (requires auth)
- `PUT /api/auto/:id` - Update listing (requires auth + ownership)
- `DELETE /api/auto/:id` - Delete listing (requires auth + ownership)

### Parcels Listings

- `GET /api/parcels` - Get all active listings (public)
- `GET /api/parcels/:id` - Get listing by ID (public)
- `GET /api/parcels/my-listings` - Get user's listings (requires auth)
- `POST /api/parcels` - Create listing (requires auth)
- `PUT /api/parcels/:id` - Update listing (requires auth + ownership)
- `DELETE /api/parcels/:id` - Delete listing (requires auth + ownership)

### Contact

- `POST /api/contact` - Submit contact form (public)

## Key Features Implementation

### Image Upload

- **Frontend**: Direct upload to Cloudinary using unsigned upload preset
- **Backend**: Admin SDK for deleting images when listings are removed
- **Thumbnail Support**: Separate thumbnail field for card previews

### Authentication Flow

1. User registers/logs in
2. JWT token stored in localStorage
3. Token included in Authorization header for protected routes
4. Backend validates token using `protect` middleware

### Filtering

- Client-side filtering for all listing types
- Filters include: location, listing type, price range, and type-specific fields
- Real-time filtering as user changes filter values

### Navigation

- Dynamic back button based on navigation source
- Edit form opens from detail pages via URL search params
- State management for preserving navigation context

## Code Organization

### Components

- **ActionButtons**: Edit/Delete buttons for listing owners
- **BackButton**: Reusable navigation back button
- **ImageGallery**: Responsive image grid display
- **ImageModal**: Full-screen image viewer with navigation
- **LoadingSpinner**: Loading state indicator

### Hooks

- **useImageModal**: Manages image modal state and keyboard navigation

### Utilities

- **date.ts**: Date formatting and manipulation
- **formatting.ts**: Number, currency, and text formatting
- **imageHelpers.ts**: Image URL manipulation and validation
- **cloudinary.ts**: Cloudinary upload utilities

### Constants

- **index.ts**: Centralized constants (locations, listing types, routes, etc.)

## Development

### Code Style

- TypeScript for type safety
- ES Modules throughout
- Functional components with hooks
- JSDoc comments for documentation
- Consistent naming conventions

### Best Practices

- Separation of concerns (components, services, utils)
- Reusable components and hooks
- Error handling and user feedback
- Responsive design principles
- Accessibility considerations

## License

[Add your license here]

## Contributing

[Add contribution guidelines here]

