-- Initialize Zolten Ranch database

-- Create admin user if not exists
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ranch settings table
CREATE TABLE IF NOT EXISTS ranch_settings (
    id SERIAL PRIMARY KEY,
    open_time TIME DEFAULT '09:00:00',
    close_time TIME DEFAULT '17:00:00',
    max_bookings_per_hour INTEGER DEFAULT 4,
    trail_price DECIMAL(10, 2) DEFAULT 75.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER REFERENCES admin_users(id)
);

-- Weekly schedule overrides by day of week (0=Sun, 6=Sat)
CREATE TABLE IF NOT EXISTS weekly_schedule (
    id SERIAL PRIMARY KEY,
    day_of_week INTEGER NOT NULL UNIQUE CHECK (day_of_week BETWEEN 0 AND 6),
    open_time TIME,
    close_time TIME,
    max_bookings_per_hour INTEGER CHECK (max_bookings_per_hour > 0),
    trail_price DECIMAL(10, 2) CHECK (trail_price >= 0),
    is_closed BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER REFERENCES admin_users(id)
);

-- Specific date exceptions (holidays/special events)
CREATE TABLE IF NOT EXISTS date_overrides (
    id SERIAL PRIMARY KEY,
    override_date DATE NOT NULL UNIQUE,
    open_time TIME,
    close_time TIME,
    max_bookings_per_hour INTEGER CHECK (max_bookings_per_hour > 0),
    trail_price DECIMAL(10, 2) CHECK (trail_price >= 0),
    is_closed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER REFERENCES admin_users(id)
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    duration_hours INTEGER DEFAULT 1,
    number_of_riders INTEGER NOT NULL CHECK (number_of_riders > 0),
    number_of_horses INTEGER NOT NULL CHECK (number_of_horses > 0),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    special_requests TEXT,
    total_price DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cancelled_reason TEXT,
    cancelled_at TIMESTAMP
);

-- Create booking history/audit table
CREATE TABLE IF NOT EXISTS booking_history (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id),
    action VARCHAR(100) NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    changed_by INTEGER REFERENCES admin_users(id),
    notes TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(email);
CREATE INDEX IF NOT EXISTS idx_booking_history_booking_id ON booking_history(booking_id);

-- Insert default admin user (username: admin, password: admin123)
INSERT INTO admin_users (username, password_hash) 
VALUES ('admin', '$2a$10$6Wf5D/I30kMnnnbxkxccDecOv8HAIOM0MSwA6X52/gx820DyiUjUO') 
ON CONFLICT (username) DO NOTHING;

-- Insert default ranch settings
INSERT INTO ranch_settings (open_time, close_time, max_bookings_per_hour, trail_price) 
SELECT '09:00:00', '17:00:00', 4, 75.00
WHERE NOT EXISTS (SELECT 1 FROM ranch_settings);

-- Seed weekly schedule from global defaults
INSERT INTO weekly_schedule (day_of_week, open_time, close_time, max_bookings_per_hour, trail_price)
SELECT d.day_of_week, rs.open_time, rs.close_time, rs.max_bookings_per_hour, rs.trail_price
FROM (SELECT generate_series(0, 6) AS day_of_week) d
CROSS JOIN (SELECT open_time, close_time, max_bookings_per_hour, trail_price FROM ranch_settings ORDER BY id DESC LIMIT 1) rs
WHERE NOT EXISTS (SELECT 1 FROM weekly_schedule);
