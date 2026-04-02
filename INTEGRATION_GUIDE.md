# Integration Guide - Adding Booking System to Existing Website

This guide explains how to integrate the new booking system with your existing Zolten Ranch website.

## Overview

Your website has been enhanced with:
1. **Dedicated Booking Page** - `/booking` for trail ride reservations
2. **Admin Panel** - `/admin` for managing bookings and operations
3. **REST API** - Backend API for booking management
4. **PostgreSQL Database** - Persistent storage for bookings

## Integration Steps

### Step 1: Add Booking Link to Existing Pages

To add a "Book Now" button to your existing pages, insert this HTML:

```html
<!-- Add this to your navigation or call-to-action section -->
<a href="/booking" class="btn btn-primary">Book Trail Ride</a>

<!-- Or a full card link: -->
<div class="booking-card">
    <h3>Ready for an Adventure?</h3>
    <p>Book your trail ride experience at Zolten Ranch</p>
    <a href="/booking" class="cta-button">Start Booking</a>
</div>
```

### Step 2: Update index.html with Booking Link

Add this to your main navigation:

```html
<nav>
    <!-- Existing nav items -->
    <a href="/">Home</a>
    <a href="/horseback-riding.html">Horseback Riding</a>
    <a href="/petting-zoo.html">Petting Zoo</a>
    <a href="/events.html">Events</a>
    <a href="/gallery.html">Gallery</a>
    <a href="/contact.html">Contact</a>
    <!-- New booking link -->
    <a href="/booking" class="btn-booking">Book Now!</a>
</nav>
```

### Step 3: Update Your HTML Pages Structure

The public folder now contains:

```
public/
├── booking.html          ← Customer booking form
├── admin.html            ← Admin control panel
├── images/               ← Keep your existing images
├── horseback-riding.html ← Copy from root
├── petting-zoo.html      ← Copy from root
├── index.html            ← Copy from root
└── ... other pages
```

### Step 4: Copy Existing Pages to Public Folder

Before starting Docker, copy your existing website files:

```bash
# Ensure these files are in the public/ directory
cp index.html public/
cp horseback-riding.html public/
cp petting-zoo.html public/
cp petting-zoo.html public/
cp gallery.html public/
cp events.html public/
cp contact.html public/
cp -r images/ public/images/
```

### Step 5: Configure Email Notifications (Optional)

To send booking confirmation emails, modify `backend/routes/bookings.js`:

```javascript
// Add after booking creation:
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

await transporter.sendMail({
    to: formData.email,
    subject: `Booking Confirmation - ID: ${booking.id}`,
    html: `
        <h2>Booking Confirmation</h2>
        <p>Your trail ride booking has been received!</p>
        <p><strong>Date:</strong> ${formData.booking_date}</p>
        <p><strong>Time:</strong> ${formData.booking_time}</p>
        <p>We'll send you a confirmation email shortly.</p>
    `
});
```

Then add to `.env`:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## Running the Application

### Option 1: Simple Start (Recommended)

```bash
cd /path/to/zoltenranchadventures
./start.sh
```

### Option 2: Docker Compose (Production)

```bash
docker-compose up --build -d
```

### Option 3: Docker Compose (Development)

```bash
docker-compose -f docker-compose.dev.yml up
```

## Accessing the Application

After starting:

- **Main Website**: http://localhost
- **Booking Form**: http://localhost/booking
- **Admin Panel**: http://localhost/admin

## Admin Login

Default credentials:
- **Username**: `admin`
- **Password**: `admin123`

**⚠️ IMPORTANT**: Change these in production!

To update admin password:
1. Log in to `/admin`
2. (Future: Add password management page)
3. Or directly update in database:

```bash
docker-compose exec db psql -U zolten -d zolten_ranch

-- Then in psql:
UPDATE admin_users SET password_hash = crypt('your_new_password', gen_salt('bf')) WHERE username = 'admin';
```

## Customization

### Change Operating Hours

1. Log in to Admin Panel
2. Go to Settings
3. Update Opening and Closing times

### Change Max Bookings per Hour

1. Log in to Admin Panel
2. Go to Settings
3. Adjust "Max Bookings Per Hour"
4. Save

### Change Trail Price

1. Log in to Admin Panel
2. Go to Settings
3. Update "Trail Price Per Rider/Hour"
4. Save

## Database

The application uses PostgreSQL. To access the database:

```bash
# Connect to the database
docker-compose exec db psql -U zolten -d zolten_ranch

# Some useful queries:

-- View all bookings
SELECT * FROM bookings;

-- View pending bookings
SELECT * FROM bookings WHERE status = 'pending';

-- View booking history
SELECT * FROM booking_history;

-- View current settings
SELECT * FROM ranch_settings;
```

## Backup & Restore

### Backup Database

```bash
docker-compose exec db pg_dump -U zolten -d zolten_ranch > backup_$(date +%Y%m%d).sql
```

### Restore Database

```bash
docker-compose exec -T db psql -U zolten -d zolten_ranch < backup_20240101.sql
```

## Troubleshooting

### Issue: Booking form not submitting

**Solution:**
1. Check browser console for errors (F12)
2. Check API health: http://localhost/api/health
3. View logs: `docker-compose logs -f web`

### Issue: Admin login fails

**Solution:**
1. Clear browser cache/localStorage
2. Restart containers: `docker-compose restart`
3. Check database: `docker-compose exec db psql -U zolten -d zolten_ranch -c "SELECT * FROM admin_users;"`

### Issue: Port already in use

**Solution:**
Edit `docker-compose.yml` and change the port mapping:
```yaml
services:
  web:
    ports:
      - "8081:3000"  # Changed from 8080
  
  db:
    ports:
      - "5433:5432"  # Changed from 5432
```

### Issue: Database connection error

**Solution:**
1. Check if database container is running: `docker-compose ps`
2. Check database logs: `docker-compose logs db`
3. Restart database: `docker-compose restart db`

## Performance Optimization

### Enable Caching Headers

The nginx.conf already includes:
- Cache-Control headers for static files (30 days)
- GZIP compression for text content

### Monitor Resource Usage

```bash
# View container resource usage
docker stats

# View specific container logs
docker-compose logs web
docker-compose logs db
```

## Security Best Practices

1. **Change Admin Credentials** - Immediately change default password
2. **Use HTTPS** - Set up SSL/TLS with Let's Encrypt
3. **Database Backups** - Daily automated backups
4. **Firewall** - Restrict database port access
5. **Rate Limiting** - Implement rate limits on API
6. **Input Validation** - Already implemented

## Production Deployment

Before going live:

1. Update JWT_SECRET in `.env`
2. Change all default passwords
3. Set NODE_ENV to `production`
4. Enable HTTPS
5. Set up database backups
6. Configure monitoring and alerts
7. Test all booking workflows
8. Verify email notifications
9. Set up admin on-call schedule

## Support

For issues, check:
1. [README.md](./README.md) - General documentation
2. Container logs: `docker-compose logs`
3. API health: http://localhost/api/health

---

**Next Steps:**
1. Copy your website files to `public/` folder
2. Run `./start.sh` to start the application
3. Test the booking flow
4. Configure admin settings
5. Customize styles if needed

Enjoy! 🐎
