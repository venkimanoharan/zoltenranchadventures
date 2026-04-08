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
    package_price_1h DECIMAL(10, 2) DEFAULT 50.00,
    package_price_2h DECIMAL(10, 2) DEFAULT 90.00,
    package_price_4h DECIMAL(10, 2) DEFAULT 150.00,
    package_price_8h DECIMAL(10, 2) DEFAULT 250.00,
    contact_phone VARCHAR(32) DEFAULT '210-769-4164',
    contact_email VARCHAR(255) DEFAULT 'info@zoltenranch.com',
    booking_email VARCHAR(255) DEFAULT 'booking@zoltenranch.com',
    street_address VARCHAR(255) DEFAULT '9536 Hildebrandt',
    city VARCHAR(120) DEFAULT 'San Antonio',
    state VARCHAR(32) DEFAULT 'TX',
    postal_code VARCHAR(20) DEFAULT '78222',
    hours_note VARCHAR(255) DEFAULT 'Last entry at 4:00 PM',
    holiday_hours VARCHAR(255) DEFAULT 'Open (call ahead)',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER REFERENCES admin_users(id)
);

ALTER TABLE ranch_settings ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(32) DEFAULT '210-769-4164';
ALTER TABLE ranch_settings ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255) DEFAULT 'info@zoltenranch.com';
ALTER TABLE ranch_settings ADD COLUMN IF NOT EXISTS booking_email VARCHAR(255) DEFAULT 'booking@zoltenranch.com';
ALTER TABLE ranch_settings ADD COLUMN IF NOT EXISTS package_price_1h DECIMAL(10, 2) DEFAULT 50.00;
ALTER TABLE ranch_settings ADD COLUMN IF NOT EXISTS package_price_2h DECIMAL(10, 2) DEFAULT 90.00;
ALTER TABLE ranch_settings ADD COLUMN IF NOT EXISTS package_price_4h DECIMAL(10, 2) DEFAULT 150.00;
ALTER TABLE ranch_settings ADD COLUMN IF NOT EXISTS package_price_8h DECIMAL(10, 2) DEFAULT 250.00;
ALTER TABLE ranch_settings ADD COLUMN IF NOT EXISTS street_address VARCHAR(255) DEFAULT '9536 Hildebrandt';
ALTER TABLE ranch_settings ADD COLUMN IF NOT EXISTS city VARCHAR(120) DEFAULT 'San Antonio';
ALTER TABLE ranch_settings ADD COLUMN IF NOT EXISTS state VARCHAR(32) DEFAULT 'TX';
ALTER TABLE ranch_settings ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20) DEFAULT '78222';
ALTER TABLE ranch_settings ADD COLUMN IF NOT EXISTS hours_note VARCHAR(255) DEFAULT 'Last entry at 4:00 PM';
ALTER TABLE ranch_settings ADD COLUMN IF NOT EXISTS holiday_hours VARCHAR(255) DEFAULT 'Open (call ahead)';

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

CREATE TABLE IF NOT EXISTS pricing_addons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(120) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_es VARCHAR(255),
    description TEXT,
    description_es TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    charge_type VARCHAR(32) NOT NULL DEFAULT 'per_booking' CHECK (charge_type IN ('per_booking', 'per_rider')),
    icon VARCHAR(16) DEFAULT '✨',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS group_discounts (
    id SERIAL PRIMARY KEY,
    min_riders INTEGER NOT NULL CHECK (min_riders > 0),
    max_riders INTEGER CHECK (max_riders IS NULL OR max_riders >= min_riders),
    discount_percent DECIMAL(5, 2) NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100),
    description VARCHAR(255),
    description_es VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE pricing_addons ADD COLUMN IF NOT EXISTS name_es VARCHAR(255);
ALTER TABLE pricing_addons ADD COLUMN IF NOT EXISTS description_es TEXT;
ALTER TABLE group_discounts ADD COLUMN IF NOT EXISTS description_es VARCHAR(255);

CREATE TABLE IF NOT EXISTS booking_add_ons (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    pricing_addon_id INTEGER REFERENCES pricing_addons(id) ON DELETE SET NULL,
    add_on_name VARCHAR(255) NOT NULL,
    charge_type VARCHAR(32) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
CREATE INDEX IF NOT EXISTS idx_booking_add_ons_booking_id ON booking_add_ons(booking_id);

-- Insert default admin user (username: admin, password: admin123)
INSERT INTO admin_users (username, password_hash) 
VALUES ('admin', '$2a$10$6Wf5D/I30kMnnnbxkxccDecOv8HAIOM0MSwA6X52/gx820DyiUjUO') 
ON CONFLICT (username) DO NOTHING;

-- Insert default ranch settings
INSERT INTO ranch_settings (
    open_time,
    close_time,
    max_bookings_per_hour,
    trail_price,
    package_price_1h,
    package_price_2h,
    package_price_4h,
    package_price_8h,
    contact_phone,
    contact_email,
    booking_email,
    street_address,
    city,
    state,
    postal_code,
    hours_note,
    holiday_hours
) 
SELECT
    '09:00:00',
    '17:00:00',
    4,
    75.00,
    50.00,
    90.00,
    150.00,
    250.00,
    '210-769-4164',
    'info@zoltenranch.com',
    'booking@zoltenranch.com',
    '9536 Hildebrandt',
    'San Antonio',
    'TX',
    '78222',
    'Last entry at 4:00 PM',
    'Open (call ahead)'
WHERE NOT EXISTS (SELECT 1 FROM ranch_settings);

INSERT INTO pricing_addons (code, name, name_es, description, description_es, price, charge_type, icon, display_order)
SELECT * FROM (VALUES
    ('photos', 'Professional Photos', 'Fotos profesionales', 'A polished photo set from your visit.', 'Un set de fotos profesional de tu visita.', 25.00, 'per_booking', '📸', 1),
    ('birthday', 'Birthday Setup', 'Montaje de cumpleanos', 'Decor and celebration setup for birthday groups.', 'Decoracion y montaje de celebracion para grupos de cumpleanos.', 50.00, 'per_booking', '🎂', 2),
    ('lunch', 'Gourmet Lunch', 'Almuerzo gourmet', 'Fresh ranch-style lunch for each guest.', 'Almuerzo fresco estilo rancho para cada invitado.', 30.00, 'per_rider', '🍱', 3),
    ('lesson', 'Riding Lesson', 'Leccion de equitacion', 'A guided fundamentals lesson before the ride.', 'Una leccion guiada de fundamentos antes del paseo.', 40.00, 'per_rider', '🎓', 4),
    ('private-guide', 'Private Guide', 'Guia privado', 'Dedicated guide for your booking only.', 'Guia dedicado solo para tu reserva.', 60.00, 'per_booking', '🏠', 5),
    ('transport', 'Transport Service', 'Servicio de transporte', 'Pickup and drop-off coordination.', 'Coordinacion de recogida y regreso.', 75.00, 'per_booking', '🚐', 6)
) AS seed(code, name, name_es, description, description_es, price, charge_type, icon, display_order)
WHERE NOT EXISTS (SELECT 1 FROM pricing_addons);

INSERT INTO group_discounts (min_riders, max_riders, discount_percent, description, description_es, display_order)
SELECT * FROM (VALUES
    (6, 10, 10.00, 'Great for small groups', 'Ideal para grupos pequenos', 1),
    (11, 20, 15.00, 'Perfect for families', 'Perfecto para familias', 2),
    (21, 50, 20.00, 'Corporate events', 'Eventos corporativos', 3),
    (51, NULL, 25.00, 'Large private groups', 'Grupos privados grandes', 4)
) AS seed(min_riders, max_riders, discount_percent, description, description_es, display_order)
WHERE NOT EXISTS (SELECT 1 FROM group_discounts);

-- Seed weekly schedule from global defaults
INSERT INTO weekly_schedule (day_of_week, open_time, close_time, max_bookings_per_hour, trail_price)
SELECT d.day_of_week, rs.open_time, rs.close_time, rs.max_bookings_per_hour, rs.trail_price
FROM (SELECT generate_series(0, 6) AS day_of_week) d
CROSS JOIN (SELECT open_time, close_time, max_bookings_per_hour, trail_price FROM ranch_settings ORDER BY id DESC LIMIT 1) rs
WHERE NOT EXISTS (SELECT 1 FROM weekly_schedule);
