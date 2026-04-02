# Zolten Ranch Adventures - Booking System & Admin Panel

A complete containerized booking system for trail rides at Zolten Ranch with a powerful admin panel for managing bookings, configuring operations, and tracking statistics.

## Features

### Customer Booking System
- 🐎 Easy-to-use booking form for trail rides
- 📅 Real-time availability checking
- 💰 Automatic price calculation based on duration and riders
- ⏰ Configurable operating hours
- 📧 Email confirmation support (future)
- 🔄 Flexible duration options (1-4 hours)

### Admin Panel
- 📊 Dashboard with real-time statistics
- 📋 Comprehensive booking management
- ✅ Confirm, cancel, and reschedule bookings
- ⚙️ Configure operating hours
- 📈 Set max bookings per hour
- 💵 Dynamic pricing configuration
- 🔐 Secure admin authentication

## Quick Start with Docker

### Prerequisites
- Docker
- Docker Compose

### Installation & Running

1. **Clone or navigate to the project directory**
```bash
cd /path/to/zoltenranchadventures
```

2. **Start the application**
```bash
docker-compose up --build
```

The application will be available at:
- **Website**: http://localhost
- **Booking Page**: http://localhost/booking
- **Admin Panel**: http://localhost/admin

3. **Stop the application**
```bash
docker-compose down
```

## Default Credentials

**Admin Panel Login:**
- Username: `admin`
- Password: `admin123`

⚠️ **IMPORTANT**: Change these credentials immediately in production!

## API Endpoints

### Public Endpoints

#### Bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:id` - Get booking details
- `GET /api/bookings/availability/:date` - Get available time slots

#### Settings
- `GET /api/settings` - Get current ranch settings

#### Health
- `GET /api/health` - Health check

### Admin Endpoints (Requires Authentication)

#### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/change-password` - Change admin password

#### Booking Management
- `GET /api/admin/bookings` - Get all bookings with filters
- `PUT /api/admin/bookings/:id/confirm` - Confirm a booking
- `PUT /api/admin/bookings/:id/cancel` - Cancel a booking
- `PUT /api/admin/bookings/:id/reschedule` - Reschedule a booking
- `GET /api/admin/stats` - Get booking statistics

#### Settings Management
- `PUT /api/settings` - Update ranch settings

## Database Schema

### Tables
- `admin_users` - Admin authentication
- `ranch_settings` - Operating hours and pricing
- `bookings` - Trail ride bookings
- `booking_history` - Audit trail for booking changes

## Configuration

### Environment Variables

Edit `backend/.env` to customize:

```env
NODE_ENV=production
DB_HOST=db
DB_PORT=5432
DB_USER=zolten
DB_PASSWORD=zolten_ranch_2024
DB_NAME=zolten_ranch
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
JWT_SECRET=your_jwt_secret_key_here_change_in_production
PORT=3000
```

### Django Settings (Admin Panel)

Configure via Admin Panel:
1. Log in to http://localhost/admin
2. Go to Settings
3. Set your operating hours
4. Configure max bookings per hour (e.g., 4)
5. Set trail price per rider per hour (e.g., $75)

## Booking Management Workflow

### For Customers
1. Visit `/booking` to access the booking form
2. Fill in personal details
3. Select a date and view available time slots
4. Choose number of riders and horses
5. Add special requests if needed
6. Review total price
7. Submit booking

### For Admin
1. Log in to `/admin` with admin credentials
2. View dashboard with booking statistics
3. Manage bookings:
   - **Confirm** pending bookings
   - **Cancel** bookings with optional reason
   - **Reschedule** confirmed bookings to new time
4. Filter bookings by status, date range
5. Update ranch settings as needed

## Project Structure

```
zoltenranchadventures/
├── docker-compose.yml          # Docker Compose configuration
├── Dockerfile                  # Node.js application container
├── nginx.conf                  # Nginx reverse proxy config
├── .dockerignore               # Docker build ignore file
├── backend/
│   ├── package.json            # Node.js dependencies
│   ├── server.js               # Express application entry
│   ├── init.sql                # Database initialization
│   ├── .env.example            # Environment variables template
│   └── routes/
│       ├── auth.js             # Authentication routes
│       ├── bookings.js         # Booking submission routes
│       ├── admin.js            # Admin booking management
│       ├── settings.js         # Ranch settings management
│       └── health.js           # Health check endpoint
├── public/
│   ├── booking.html            # Customer booking form
│   └── admin.html              # Admin control panel
└── images/                     # Static images
```

## Security Considerations

- All passwords are hashed with bcryptjs
- JWT tokens for admin session management
- CORS protection
- Helmet.js security headers
- Input validation on all endpoints
- SQL injection protection via parameterized queries

## Development Mode

For local development without Docker:

```bash
# Install dependencies
cd backend
npm install
npm run dev

# In another terminal, start PostgreSQL locally
# Update .env with your local database credentials
```

## Troubleshooting

### Port Conflicts
If ports 80, 8080, or 5432 are already in use:

**Edit docker-compose.yml:**
```yaml
web:
  ports:
    - "8080:3000"  # Change first number to available port

db:
  ports:
    - "5433:5432"  # Change first number to available port
```

### Database Connection Issues
1. Check if PostgreSQL container is running: `docker-compose ps`
2. View logs: `docker-compose logs db`
3. Ensure .env has correct credentials

### Admin Login Not Working
1. Clear browser localStorage
2. Restart containers: `docker-compose restart web`
3. Verify database: `docker-compose exec db psql -U zolten -d zolten_ranch`

## Production Deployment

Before deploying to production:

1. **Update Environment Variables**
   - Change JWT_SECRET to secure random string
   - Update ADMIN_PASSWORD to strong password
   - Set NODE_ENV to "production"
   - Update database credentials

2. **Update Docker Compose**
   - Remove port 5432 exposure for database
   - Consider adding SSL/TLS for nginx
   - Set resource limits for containers

3. **Database Backups**
   - Set up automated PostgreSQL backups
   - Test restore procedures

4. **Monitoring**
   - Set up log aggregation
   - Configure health check alerts

## Support & Maintenance

- **Regular Backups**: Implement automated PostgreSQL backups
- **Updates**: Keep Docker images updated monthly
- **Monitoring**: Monitor disk space and database growth
- **Access Control**: Regularly change admin password

## License

Proprietary - Zolten Ranch Adventures

## Contact

For issues or questions, contact admin@zoltenranch.com
