const nodemailer = require('nodemailer');

// Email configuration - uses environment variables
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Test connection (optional)
if (process.env.EMAIL_USER) {
  transporter.verify((error, success) => {
    if (error) {
      console.log('Email service verification failed:', error);
    } else {
      console.log('✓ Email service ready');
    }
  });
}

/**
 * Send booking confirmation email
 */
async function sendBookingConfirmation(booking, ranchSettings) {
  const safeTotalPrice = Number.parseFloat(booking.total_price) || 0;
  const mailOptions = {
    from: process.env.EMAIL_FROM || `Zolten Ranch <${process.env.EMAIL_USER}>`,
    to: booking.email,
    subject: `🎟️ Booking Confirmation - Zolten Ranch Adventures #${booking.id}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: #f9f5f0; padding: 20px; }
          .header { background: linear-gradient(135deg, #6B4423 0%, #D4AF37 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; }
          .booking-details { background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .detail-row:last-child { border-bottom: none; }
          .label { font-weight: bold; color: #6B4423; }
          .btn { background: #6B4423; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
          .footer { background: #2c2c2c; color: white; padding: 15px; text-align: center; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Booking Confirmed!</h1>
            <p>Your adventure awaits at Zolten Ranch</p>
          </div>
          <div class="content">
            <p>Dear ${booking.name},</p>
            <p>Thank you for booking with Zolten Ranch Adventures! We're excited to provide you with an unforgettable experience.</p>
            
            <h2 style="color: #6B4423;">Booking Details</h2>
            <div class="booking-details">
              <div class="detail-row">
                <span class="label">Booking ID:</span>
                <span>#${booking.id}</span>
              </div>
              <div class="detail-row">
                <span class="label">Date:</span>
                <span>${new Date(booking.booking_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
              </div>
              <div class="detail-row">
                <span class="label">Time:</span>
                <span>${booking.booking_time}</span>
              </div>
              <div class="detail-row">
                <span class="label">Duration:</span>
                <span>${booking.duration_hours} hour(s)</span>
              </div>
              <div class="detail-row">
                <span class="label">Riders:</span>
                <span>${booking.number_of_riders}</span>
              </div>
              <div class="detail-row">
                <span class="label">Horses:</span>
                <span>${booking.number_of_horses}</span>
              </div>
              <div class="detail-row" style="border-bottom: 2px solid #6B4423; padding: 12px 0;">
                <span class="label">Total Price:</span>
                <span style="font-size: 1.2em; color: #D4AF37;">$${safeTotalPrice.toFixed(2)}</span>
              </div>
            </div>

            <h2 style="color: #6B4423;">What to Expect</h2>
            <ul>
              <li>Arrive 15 minutes early for check-in</li>
              <li>Meet your experienced guide</li>
              <li>Horse fitting and safety briefing</li>
              <li>Scenic trail ride through our beautiful ranch</li>
              <li>Water and snacks provided</li>
            </ul>

            <h2 style="color: #6B4423;">Important Information</h2>
            <ul>
              <li><strong>Location:</strong> Zolten Ranch, San Antonio, TX</li>
              <li><strong>Hours:</strong> ${ranchSettings.open_time} - ${ranchSettings.close_time}</li>
              <li><strong>Phone:</strong> (210) 555-RIDE</li>
              <li><strong>Cancellation:</strong> Full refund up to 7 days before. 50% refund within 7 days.</li>
            </ul>

            <p style="text-align: center;">
              <a href="https://zoltenranchadventures.com/booking" class="btn">View/Manage Booking</a>
            </p>

            <p>If you have any questions or need to reschedule, please don't hesitate to contact us at (210) 555-RIDE or reply to this email.</p>
            <p>We look forward to seeing you soon!</p>
            <p>Best regards,<br><strong>The Zolten Ranch Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Zolten Ranch Adventures. All rights reserved.</p>
            <p>San Antonio, Texas | Premium Horseback Riding & Ranch Experiences</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    if (!process.env.EMAIL_USER) {
      console.log('Email service not configured - skipping email send');
      return { success: false, message: 'Email service not configured' };
    }
    const result = await transporter.sendMail(mailOptions);
    console.log('✓ Confirmation email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send admin notification email
 */
async function sendAdminNotification(booking) {
  const safeTotalPrice = Number.parseFloat(booking.total_price) || 0;
  const mailOptions = {
    from: process.env.EMAIL_FROM || `Zolten Ranch <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL || 'admin@zoltenranch.com',
    subject: `📅 New Booking - ${booking.name} for ${new Date(booking.booking_date).toLocaleDateString()}`,
    html: `
      <h2>New Booking Received</h2>
      <p><strong>Customer:</strong> ${booking.name}</p>
      <p><strong>Email:</strong> ${booking.email}</p>
      <p><strong>Phone:</strong> ${booking.phone}</p>
      <p><strong>Date:</strong> ${new Date(booking.booking_date).toLocaleDateString()}</p>
      <p><strong>Time:</strong> ${booking.booking_time}</p>
      <p><strong>Riders:</strong> ${booking.number_of_riders}</p>
      <p><strong>Total:</strong> $${safeTotalPrice.toFixed(2)}</p>
      <p><strong>Status:</strong> Pending Confirmation</p>
      <p><a href="https://zoltenranchadventures.com/admin">View in Admin Panel</a></p>
    `
  };

  try {
    if (!process.env.EMAIL_USER) {
      return { success: false, message: 'Email service not configured' };
    }
    const result = await transporter.sendMail(mailOptions);
    console.log('✓ Admin notification sent:', result.messageId);
    return { success: true };
  } catch (error) {
    console.error('Error sending admin notification:', error);
    return { success: false };
  }
}

/**
 * Send cancellation email
 */
async function sendCancellationEmail(booking) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || `Zolten Ranch <${process.env.EMAIL_USER}>`,
    to: booking.email,
    subject: `❌ Booking Cancelled - Zolten Ranch Adventures #${booking.id}`,
    html: `
      <h2>Booking Cancellation Confirmation</h2>
      <p>Dear ${booking.name},</p>
      <p>Your booking has been cancelled as requested.</p>
      <p><strong>Booking ID:</strong> #${booking.id}</p>
      <p><strong>Original Date:</strong> ${new Date(booking.booking_date).toLocaleDateString()}</p>
      <p><strong>Refund Status:</strong> Processing</p>
      <p>You can rebook anytime on our website or call us at (210) 555-RIDE.</p>
      <p>We hope to see you again soon!</p>
      <p>Best regards,<br><strong>The Zolten Ranch Team</strong></p>
    `
  };

  try {
    if (!process.env.EMAIL_USER) {
      return { success: false };
    }
    await transporter.sendMail(mailOptions);
    console.log('✓ Cancellation email sent');
    return { success: true };
  } catch (error) {
    console.error('Error sending cancellation email:', error);
    return { success: false };
  }
}

/**
 * Send reschedule email
 */
async function sendRescheduleEmail(booking, newDate, newTime) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || `Zolten Ranch <${process.env.EMAIL_USER}>`,
    to: booking.email,
    subject: `📅 Booking Rescheduled - Zolten Ranch Adventures #${booking.id}`,
    html: `
      <h2>Booking Rescheduled</h2>
      <p>Dear ${booking.name},</p>
      <p>Your booking has been successfully rescheduled.</p>
      <p><strong>Booking ID:</strong> #${booking.id}</p>
      <p><strong>Old Date & Time:</strong> ${new Date(booking.booking_date).toLocaleDateString()} at ${booking.booking_time}</p>
      <p><strong>New Date & Time:</strong> ${new Date(newDate).toLocaleDateString()} at ${newTime}</p>
      <p><strong>All other details remain the same.</strong></p>
      <p>We look forward to your visit!</p>
      <p>Best regards,<br><strong>The Zolten Ranch Team</strong></p>
    `
  };

  try {
    if (!process.env.EMAIL_USER) {
      return { success: false };
    }
    await transporter.sendMail(mailOptions);
    console.log('✓ Reschedule email sent');
    return { success: true };
  } catch (error) {
    console.error('Error sending reschedule email:', error);
    return { success: false };
  }
}

module.exports = {
  sendBookingConfirmation,
  sendAdminNotification,
  sendCancellationEmail,
  sendRescheduleEmail
};
