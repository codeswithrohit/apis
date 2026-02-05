import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use any email service
  auth: {
    user: 'rohitssm5533@gmail.com', // Your email
    pass: 'zgnhgrepruwcarpp', // Your email password or app password
  },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Missing expected fields:', 
      ['Name', 'roomType', 'roomprice', 'location', 'email', 'name', 'checkInDate', 'orderId', 'paymentAmount', 'payAtCheckIn', 'total', 'phoneNumber', 'address']
        .filter(key => !req.body.hasOwnProperty(key))
    );
    
    const {
      Name,
      roomType,
      roomprice,
      location,
      email,
      name,
      checkInDate,
      checkOutDate,
      orderId,
      paymentAmount,
      payAtCheckIn,
      total,
      phoneNumber,
      address
    } = req.body;

    // Validate required fields
    if (!email || !Name) {
      return res.status(400).json({ message: 'Email and property name are required' });
    }

    // HTML email template
    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #10b981;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background-color: #f9fafb;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .details {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #10b981;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e5e7eb;
          }
          .label {
            font-weight: bold;
            color: #4b5563;
          }
          .value {
            color: #111827;
          }
          .highlight {
            background-color: #dcfce7;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            text-align: center;
            font-weight: bold;
            color: #065f46;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Booking Confirmation</h1>
          <p>Thank you for choosing Arene Services</p>
        </div>
        
        <div class="content">
          <p>Dear ${name},</p>
          <p>Your booking has been confirmed. Here are your booking details:</p>
          
          <div class="details">
            <div class="detail-row">
              <span class="label">Booking ID:</span>
              <span class="value">${orderId || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Property Name:</span>
              <span class="value">${Name}</span>
            </div>
            <div class="detail-row">
              <span class="label">Location:</span>
              <span class="value">${location}</span>
            </div>
            <div class="detail-row">
              <span class="label">Room Type:</span>
              <span class="value">${roomType}</span>
            </div>
            <div class="detail-row">
              <span class="label">Check-in Date:</span>
              <span class="value">${checkInDate}</span>
            </div>
                ${checkOutDate ? `
            <div class="detail-row">
              <span class="label">Check-out Date:</span>
              <span class="value">${checkOutDate}</span>
            </div>
            ` : ''}
            <div class="detail-row">
              <span class="label">Room Price:</span>
              <span class="value">₹${roomprice}</span>
            </div>
            ${phoneNumber ? `
            <div class="detail-row">
              <span class="label">Phone Number:</span>
              <span class="value">${phoneNumber}</span>
            </div>
            ` : ''}
            ${address ? `
            <div class="detail-row">
              <span class="label">Address:</span>
              <span class="value">${address}</span>
            </div>
            ` : ''}
          </div>
          
          ${paymentAmount !== undefined ? `
          <div class="highlight">
            <div>Amount Paid: ₹${paymentAmount}</div>
            <div>Amount Due at Check-in: ₹${payAtCheckIn || 0}</div>
            <div style="margin-top: 10px; font-size: 18px;">Total: ₹${total || roomprice}</div>
          </div>
          ` : ''}
          
          <p>Please keep this email for your records. If you have any questions, please contact our support team.</p>
          
          <div class="footer">
            <p>Best regards,<br>The Arene Services Team</p>
            <p>© ${new Date().getFullYear()} Arene Services. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Plain text version
    const textTemplate = `
      Booking Confirmation - Arene Services
      
      Dear ${name},
      
      Your booking has been confirmed. Here are your booking details:
      
      Booking ID: ${orderId || 'N/A'}
      Property Name: ${Name}
      Location: ${location}
      Room Type: ${roomType}
      Check-in Date: ${checkInDate}
      Room Price: ₹${roomprice}
      ${phoneNumber ? `Phone Number: ${phoneNumber}` : ''}
      ${address ? `Address: ${address}` : ''}
      
      ${paymentAmount !== undefined ? `
      Payment Summary:
      Amount Paid: ₹${paymentAmount}
      Amount Due at Check-in: ₹${payAtCheckIn || 0}
      Total: ₹${total || roomprice}
      ` : ''}
      
      Please keep this information for your records.
      
      Best regards,
      The Arene Services Team
      
      © ${new Date().getFullYear()} Arene Services. All rights reserved.
    `;

    // Email options
    const mailOptions = {
      from: `"Arene Services" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Booking Confirmation - ${Name}`,
      text: textTemplate,
      html: htmlTemplate,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent:', info.messageId);
    
    return res.status(200).json({ 
      message: 'Email sent successfully',
      messageId: info.messageId 
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ 
      message: 'Failed to send email',
      error: error.message 
    });
  }
}