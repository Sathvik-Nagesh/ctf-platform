# GitXTribe CTF Platform

A web-based Capture The Flag platform for GitXTribe Technical Club, allowing teams to participate, solve challenges, and compete in a professional CTF environment.

## Features

### 🏆 Core Features
- **Team Registration & Authentication**: Teams register with name, members (max 2), and password
- **Challenge Management**: Admin can create, edit, and manage challenges with file uploads
- **Flag Submission**: Real-time flag checking with rate limiting
- **Leaderboard**: Real-time ranking by score and submission time
- **File Downloads**: Challenge files served locally
- **Admin Panel**: Full control over users, challenges, and event settings

### 🎨 Design
- **Branding**: GitXTribe Technical Club theme with gradient colors
- **Modern UI**: Clean, professional interface with responsive design
- **Notifications**: In-app alerts for events and announcements

### 🔒 Security
- Password hashing with bcrypt
- Rate limiting for flag submissions
- Admin-only access to sensitive operations

## Tech Stack

- **Frontend**: React with modern hooks and context
- **Backend**: Node.js/Express for APIs and file serving
- **Database**: Firebase Firestore
- **File Storage**: Local server storage
- **Authentication**: Custom team-based auth system

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase project (for Firestore)

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd gitxtribe-ctf-platform
   npm run install-all
   ```

2. **Set up Firebase:**
   - Create a Firebase project
   - Enable Firestore Database
   - Get your Firebase config

3. **Configure environment:**
   - Copy `.env.example` to `.env`
   - Add your Firebase config
   - Set admin credentials

4. **Start development servers:**
   ```bash
   npm run dev
   ```

5. **Access the platform:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## Admin Access

- **Username**: Admin
- **Password**: pavanrocks

## Project Structure

```
gitxtribe-ctf-platform/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context for state
│   │   ├── hooks/         # Custom hooks
│   │   ├── utils/         # Utility functions
│   │   └── styles/        # CSS and styling
├── server/                 # Node.js backend
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── uploads/           # Challenge file storage
│   └── config/            # Configuration files
├── package.json           # Root package.json
└── README.md             # This file
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Server Configuration
PORT=5000
NODE_ENV=development

# Admin Credentials
ADMIN_USERNAME=Admin
ADMIN_PASSWORD=pavanrocks
```

## Deployment

### Production Build
```bash
npm run build
npm start
```

### File Storage
- Challenge files are stored in `server/uploads/`
- Ensure the uploads directory has proper permissions
- Consider using a CDN for production file serving

## Contributing

This platform is designed for GitXTribe Technical Club. For modifications or improvements, please contact the club administrators.

## License

MIT License - see LICENSE file for details. 