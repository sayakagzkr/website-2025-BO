# Backoffice Management System

Modern backoffice management system - React + TypeScript + Node.js + Express

## Overview

This project is a management system designed to streamline backoffice operations for businesses and organizations. It provides features such as user management, content management, and analytics dashboard.

## Key Features

### 🔐 Authentication & Authorization
- JWT authentication
- Role-based access control (admin/user)
- Secure password management

### 📊 Dashboard
- Real-time statistics
- Data visualization with graphs and charts
- Popular content tracking
- Activity logs

### 👥 User Management
- Create, edit, and delete users
- Role and status management
- Detailed search and filtering

### 📝 Content Management
- Create and edit articles/pages
- Status management (draft/published/archived)
- Category classification
- View count tracking

### 🛒 E-commerce Features
- Transaction management
- Product catalog
- Customer database
- Affiliate partner management
- Invoice generation
- Refund processing
- Download and mail logs

### ⚙️ Settings
- Password change
- Account information management

## Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS
- **React Router** - Routing
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **SQLite (better-sqlite3)** - Database
- **JWT (jsonwebtoken)** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Validation

## Setup

### Requirements
- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository (or download)

2. Install dependencies
```bash
npm run install:all
```

This will install all dependencies for root, backend, and frontend.

### Start Development Servers

```bash
npm run dev
```

This will start the following servers:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

Or start them individually:

```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

## Default Credentials

An admin account is automatically created on first startup:

- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Security**: Please change the password after first login.

## Project Structure

```
backoffice-system/
├── backend/              # Backend application
│   ├── src/
│   │   ├── controllers/  # Controllers
│   │   ├── models/       # Data models
│   │   ├── routes/       # API routes
│   │   │   ├── auth.js   # Authentication API
│   │   │   ├── users.js  # User management API
│   │   │   ├── content.js # Content management API
│   │   │   ├── transactions.js # Transaction API
│   │   │   ├── products.js # Product API
│   │   │   └── analytics.js # Analytics API
│   │   ├── middleware/   # Middleware
│   │   │   └── auth.js   # Authentication middleware
│   │   ├── utils/        # Utilities
│   │   │   └── database.js # Database configuration
│   │   └── server.js     # Entry point
│   ├── data/             # SQLite database files
│   ├── .env              # Environment variables
│   └── package.json
│
├── frontend/             # Frontend application
│   ├── src/
│   │   ├── components/   # Shared components
│   │   │   └── Layout.tsx # Layout component
│   │   ├── pages/        # Page components
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Users.tsx
│   │   │   ├── Content.tsx
│   │   │   ├── Products.tsx
│   │   │   ├── Transactions.tsx
│   │   │   └── Settings.tsx
│   │   ├── services/     # API communication
│   │   │   └── api.ts
│   │   ├── hooks/        # Custom hooks
│   │   │   └── useAuth.tsx
│   │   ├── types/        # TypeScript type definitions
│   │   │   └── index.ts
│   │   ├── App.tsx       # Application root
│   │   ├── main.tsx      # Entry point
│   │   └── index.css     # Global styles
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
│
├── package.json          # Root package
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/change-password` - Change password

### User Management
- `GET /api/users` - Get user list
- `GET /api/users/:id` - Get user details
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

### Content Management
- `GET /api/content` - Get content list
- `GET /api/content/:id` - Get content details
- `POST /api/content` - Create content
- `PUT /api/content/:id` - Update content
- `DELETE /api/content/:id` - Delete content

### Products
- `GET /api/products` - Get product list
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Transactions
- `GET /api/transactions` - Get transaction list with filters
- `GET /api/transactions/:id` - Get transaction details
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction

### Analytics
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/activity` - Activity logs
- `POST /api/analytics/activity` - Record activity

## Database

Uses SQLite. Database file is stored at `backend/data/database.db`.

### Table Structure

**users**
- id, username, email, password, full_name, role, status, created_at, updated_at

**content**
- id, title, slug, content, status, category, author_id, views, created_at, updated_at, published_at

**products**
- id, name, slug, description, price, stock, category_id, status, image_url, created_at, updated_at

**transactions**
- id, transaction_id, customer_id, affiliate_id, product_id, amount, commission, status, payment_method, country, created_at

**customers**
- id, name, email, country, phone, status, created_at

**affiliates**
- id, name, code, commission_rate, status, total_sales, total_commission, created_at

**activity_logs**
- id, user_id, action, resource_type, resource_id, ip_address, user_agent, created_at

## Environment Variables

Configure the following environment variables in `backend/.env`:

```env
PORT=3001
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

⚠️ **Security**: Always change `JWT_SECRET` to a strong random string in production.

## Security

- Password hashing with bcryptjs
- JWT token authentication
- Role-based access control
- CORS configuration
- SQL injection prevention (prepared statements)

## Customization

### Change Color Theme

You can change the primary color in `frontend/tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Customize color codes
      }
    }
  }
}
```

### Add New Features

1. Backend: Add new route files in `backend/src/routes/`
2. Frontend: Add new pages in `frontend/src/pages/`
3. API Service: Add API functions in `frontend/src/services/api.ts`

## Troubleshooting

### Port Already in Use

If another application is using port 3001 or 5173:

- Backend: Change `PORT` in `backend/.env`
- Frontend: Change `server.port` in `frontend/vite.config.ts`

### Database Errors

To reset the database:

```bash
rm backend/data/database.db
# Restart the server to create a new database
```

## License

MIT License

## Support

If you encounter any issues, please report them in the GitHub Issues section.

---

**Developer Note**: This system was created for development and learning purposes. If you plan to use it in production, conduct a security audit and implement appropriate security measures.
