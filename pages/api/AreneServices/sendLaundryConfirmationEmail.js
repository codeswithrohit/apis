import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
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
    console.log('Laundry confirmation request body:', req.body);
    
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      address,
      orderId,
      orderDate,
      pickupDate,
      totalPayment,
      subtotal,
      tax,
      savings,
      cartItems,
      pincode,
      couponCode = '',
      isMonthlyPackage = false,
      orderHistory = []
    } = req.body;

    // Validate required fields
    if (!firstName || !email || !phoneNumber || !orderId || !totalPayment) {
      return res.status(400).json({ 
        message: 'Required fields are missing' 
      });
    }

    // Calculate items summary
    const itemsSummary = cartItems.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
          <div style="display: flex; align-items: center;">
            ${item.image ? `<img src="${item.image}" alt="${item.productName}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px; border-radius: 4px;">` : ''}
            <div>
              <strong>${item.productName}</strong>
              <div style="font-size: 12px; color: #6b7280;">${item.service}</div>
            </div>
          </div>
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${parseFloat(item.price).toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    // Calculate pickup schedule for monthly package
    let pickupScheduleHTML = '';
    if (isMonthlyPackage && orderHistory.length > 0) {
      pickupScheduleHTML = `
        <div style="margin: 20px 0; padding: 15px; background-color: #f0f9ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
          <h3 style="color: #1e40af; margin-top: 0;">📅 Monthly Package Pickup Schedule</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr style="background-color: #dbeafe;">
                <th style="padding: 8px; text-align: left;">Pickup</th>
                <th style="padding: 8px; text-align: left;">Status</th>
                <th style="padding: 8px; text-align: left;">Scheduled Date</th>
              </tr>
            </thead>
            <tbody>
              ${orderHistory.map((pickup, index) => `
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #93c5fd;">${pickup.pickupName}</td>
                  <td style="padding: 8px; border-bottom: 1px solid #93c5fd;">
                    <span style="padding: 2px 8px; background-color: #fef3c7; color: #92400e; border-radius: 12px; font-size: 12px;">
                      ${pickup.pickupStatus}
                    </span>
                  </td>
                  <td style="padding: 8px; border-bottom: 1px solid #93c5fd;">${pickup.pickupDate || 'To be scheduled'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    // HTML email template for laundry confirmation
    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Laundry Order Confirmation - Arene Services</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 700px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
          }
          .header {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            padding: 30px 20px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background-color: white;
            padding: 40px;
            border-radius: 0 0 10px 10px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          .order-info {
            background-color: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
            border-left: 4px solid #3b82f6;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
          }
          .info-item {
            background-color: white;
            padding: 15px;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
          }
          .info-label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
          }
          .info-value {
            font-weight: bold;
            color: #111827;
            font-size: 16px;
          }
          .table-container {
            overflow-x: auto;
            margin: 30px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th {
            background-color: #f3f4f6;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            color: #374151;
            border-bottom: 2px solid #e5e7eb;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
          }
          .total-row {
            background-color: #f9fafb;
            font-weight: bold;
          }
          .savings {
            color: #10b981;
            font-weight: bold;
          }
          .important-note {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin: 25px 0;
            border-radius: 6px;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            background-color: #10b981;
            color: white;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
          }
          .contact-info {
            background-color: #eff6ff;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">🧺 Laundry Order Confirmed!</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">Thank you for choosing Arene Laundry Services</p>
        </div>
        
        <div class="content">
          <div style="text-align: center; margin-bottom: 30px;">
            <span class="status-badge">ORDER CONFIRMED</span>
            <p style="margin-top: 10px; color: #6b7280;">Order ID: <strong>${orderId}</strong></p>
          </div>
          
          <div class="order-info">
            <h2 style="color: #1e40af; margin-top: 0;">Order Summary</h2>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Customer Name</div>
                <div class="info-value">${firstName} ${lastName}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Order Date</div>
                <div class="info-value">${orderDate}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Pickup Date</div>
                <div class="info-value">${pickupDate || 'To be scheduled'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Pin Code</div>
                <div class="info-value">${pincode}</div>
              </div>
            </div>
          </div>
          
          ${pickupScheduleHTML}
          
          <h3 style="color: #374151; margin-bottom: 15px;">📋 Order Details</h3>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsSummary}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="text-align: right; padding: 12px; border-bottom: none;">Subtotal:</td>
                  <td style="padding: 12px; border-bottom: none; text-align: right;">₹${parseFloat(subtotal || totalPayment).toFixed(2)}</td>
                </tr>
                ${savings > 0 ? `
                <tr>
                  <td colspan="3" style="text-align: right; padding: 12px; border-bottom: none;">
                    <span class="savings">Coupon Savings (${couponCode}):</span>
                  </td>
                  <td style="padding: 12px; border-bottom: none; text-align: right; color: #10b981;">
                    -₹${parseFloat(savings).toFixed(2)}
                  </td>
                </tr>
                ` : ''}
                ${tax > 0 ? `
                <tr>
                  <td colspan="3" style="text-align: right; padding: 12px; border-bottom: none;">Tax:</td>
                  <td style="padding: 12px; border-bottom: none; text-align: right;">₹${parseFloat(tax).toFixed(2)}</td>
                </tr>
                ` : ''}
                <tr class="total-row">
                  <td colspan="3" style="text-align: right; padding: 12px; font-size: 18px;">Total Amount:</td>
                  <td style="padding: 12px; text-align: right; font-size: 18px; color: #1e40af;">
                    ₹${parseFloat(totalPayment).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div class="important-note">
            <h4 style="color: #92400e; margin-top: 0;">⚠️ Important Information</h4>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Our delivery executive will arrive at your location between 9 AM - 7 PM on the scheduled pickup date</li>
              <li>Please keep your clothes ready for pickup</li>
              <li>Standard delivery time is 24-48 hours from pickup</li>
              <li>For any changes or cancellations, please contact us at least 6 hours before scheduled pickup</li>
            </ul>
          </div>
          
          <div class="contact-info">
            <h4 style="color: #1e40af; margin-top: 0;">📞 Need Help?</h4>
            <p style="margin: 10px 0;">
              <strong>Customer Support:</strong> +91 1234567890<br>
              <strong>Email:</strong> support@areneservices.in<br>
              <strong>Hours:</strong> 8:00 AM - 8:00 PM (7 days a week)
            </p>
          </div>
          
          <div class="footer">
            <p style="margin: 0;">Thank you for choosing Arene Laundry Services!</p>
            <p style="margin: 5px 0;">We're committed to providing you with the best laundry experience.</p>
            <p style="margin-top: 15px; font-size: 12px; color: #9ca3af;">
              © ${new Date().getFullYear()} Arene Services. All rights reserved.<br>
              This is an automated confirmation email. Please do not reply directly to this message.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Plain text version
    const textTemplate = `
      LAUNDRY ORDER CONFIRMATION - ARENE SERVICES
      ============================================
      
      Thank you for your laundry order! Your order has been confirmed and is being processed.
      
      ORDER SUMMARY:
      --------------
      Order ID: ${orderId}
      Customer: ${firstName} ${lastName}
      Order Date: ${orderDate}
      Pickup Date: ${pickupDate || 'To be scheduled'}
      Delivery Address: ${address}
      Pin Code: ${pincode}
      
      ORDER DETAILS:
      -------------
      ${cartItems.map(item => `
        - ${item.productName} (${item.service})
          Quantity: ${item.quantity}
          Price: ₹${item.price} each
          Total: ₹${(item.price * item.quantity).toFixed(2)}
      `).join('\n')}
      
      PRICE BREAKDOWN:
      ---------------
      Subtotal: ₹${parseFloat(subtotal || totalPayment).toFixed(2)}
      ${savings > 0 ? `Coupon Savings (${couponCode}): -₹${parseFloat(savings).toFixed(2)}` : ''}
      ${tax > 0 ? `Tax: ₹${parseFloat(tax).toFixed(2)}` : ''}
      Total Amount: ₹${parseFloat(totalPayment).toFixed(2)}
      
      ${isMonthlyPackage ? `
      MONTHLY PACKAGE PICKUP SCHEDULE:
      --------------------------------
      ${orderHistory.map((pickup, index) => `
        ${pickup.pickupName}: ${pickup.pickupStatus} - ${pickup.pickupDate || 'To be scheduled'}
      `).join('\n')}
      ` : ''}
      
      IMPORTANT INFORMATION:
      ---------------------
      - Our delivery executive will arrive between 9 AM - 7 PM
      - Please keep your clothes ready for pickup
      - Standard delivery: 24-48 hours from pickup
      - Changes/cancellations: Contact us 6 hours before pickup
      
      CONTACT SUPPORT:
      ---------------
      Phone: +91 1234567890
      Email: support@areneservices.in
      Hours: 8:00 AM - 8:00 PM (7 days a week)
      
      Thank you for choosing Arene Laundry Services!
      
      © ${new Date().getFullYear()} Arene Services. All rights reserved.
      
      This is an automated confirmation email. Please do not reply directly to this message.
    `;

    // Email options
    const mailOptions = {
      from: `"Arene Laundry Services" <rohitssm5533@gmail.com>`,
      to: email, // Customer email
      cc: 'rohitssm5533@gmail.com', // Send copy to admin
      bcc: 'admin@areneservices.in', // Additional BCC if needed
      subject: `🧺 Laundry Order Confirmed! Order ID: ${orderId}`,
      text: textTemplate,
      html: htmlTemplate,
      replyTo: 'support@areneservices.in',
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Laundry confirmation email sent:', info.messageId);
    
    return res.status(200).json({ 
      message: 'Laundry confirmation email sent successfully',
      messageId: info.messageId 
    });

  } catch (error) {
    console.error('Error sending laundry confirmation email:', error);
    return res.status(500).json({ 
      message: 'Failed to send laundry confirmation email',
      error: error.message 
    });
  }
}