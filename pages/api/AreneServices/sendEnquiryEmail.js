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
    console.log('Enquiry request body:', req.body);
    
    const {
      name,
      phone,
      propertyname,
      propertylocation,
      AgentId,
      email, // If you want to collect email in form
      enquiryDate,
      Type = 'Property',
      message = '' // Optional message field
    } = req.body;

    // Validate required fields
    if (!name || !phone || !propertyname) {
      return res.status(400).json({ 
        message: 'Name, phone and property name are required' 
      });
    }

    // Determine recipient email (you might want to send to agent or admin)
    const agentEmail = AgentId ? `${AgentId}@example.com` : 'rohitssm5533@gmail.com'; // Update with your logic
    const recipientEmail = email || agentEmail;

    // HTML email template for enquiry
    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Property Enquiry</title>
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
            background-color: #3b82f6;
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
            border-left: 4px solid #3b82f6;
          }
          .detail-row {
            display: flex;
            margin-bottom: 12px;
            padding-bottom: 12px;
            border-bottom: 1px solid #e5e7eb;
          }
          .label {
            font-weight: bold;
            color: #4b5563;
            width: 150px;
            flex-shrink: 0;
          }
          .value {
            color: #111827;
            flex-grow: 1;
          }
          .highlight {
            background-color: #dbeafe;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            text-align: center;
            font-weight: bold;
            color: #1e40af;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
          }
          .priority {
            display: inline-block;
            background-color: #10b981;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            margin-left: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏠 New Property Enquiry</h1>
          <p>${Type} Enquiry Received</p>
        </div>
        
        <div class="content">
          <p>A new enquiry has been submitted for your property. Here are the details:</p>
          
          <div class="details">
            <div class="detail-row">
              <span class="label">Enquiry Date:</span>
              <span class="value">${enquiryDate || new Date().toLocaleString()}</span>
            </div>
            <div class="detail-row">
              <span class="label">Customer Name:</span>
              <span class="value">${name}</span>
            </div>
            <div class="detail-row">
              <span class="label">Phone Number:</span>
              <span class="value">
                <a href="tel:${phone}">${phone}</a>
                <span class="priority">PRIORITY</span>
              </span>
            </div>
            ${email ? `
            <div class="detail-row">
              <span class="label">Email:</span>
              <span class="value">
                <a href="mailto:${email}">${email}</a>
              </span>
            </div>
            ` : ''}
            <div class="detail-row">
              <span class="label">Property Name:</span>
              <span class="value">${propertyname}</span>
            </div>
            <div class="detail-row">
              <span class="label">Location:</span>
              <span class="value">${propertylocation}</span>
            </div>
            ${AgentId ? `
            <div class="detail-row">
              <span class="label">Agent ID:</span>
              <span class="value">${AgentId}</span>
            </div>
            ` : ''}
            ${message ? `
            <div class="detail-row">
              <span class="label">Message:</span>
              <span class="value">${message}</span>
            </div>
            ` : ''}
          </div>
          
          <div class="highlight">
            ⚡ <strong>Action Required:</strong> Please contact the customer within 24 hours
          </div>
          
          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>Contact the customer at your earliest convenience</li>
            <li>Provide detailed property information</li>
            <li>Schedule a property visit if requested</li>
            <li>Update the enquiry status in the system</li>
          </ul>
          
          <div class="footer">
            <p>Best regards,<br>The Arene Services Team</p>
            <p>© ${new Date().getFullYear()} Arene Services. All rights reserved.</p>
            <p style="font-size: 12px; margin-top: 10px;">
              This is an automated notification. Please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Plain text version
    const textTemplate = `
      NEW PROPERTY ENQUIRY - ARENE SERVICES
      ========================================
      
      A new enquiry has been submitted for your property.
      
      Enquiry Details:
      ---------------
      Enquiry Date: ${enquiryDate || new Date().toLocaleString()}
      Customer Name: ${name}
      Phone Number: ${phone} (PRIORITY)
      ${email ? `Email: ${email}` : ''}
      Property Name: ${propertyname}
      Location: ${propertylocation}
      ${AgentId ? `Agent ID: ${AgentId}` : ''}
      ${message ? `Message: ${message}` : ''}
      
      Action Required:
      --------------
      Please contact the customer within 24 hours.
      
      Next Steps:
      ----------
      1. Contact the customer at your earliest convenience
      2. Provide detailed property information
      3. Schedule a property visit if requested
      4. Update the enquiry status in the system
      
      Best regards,
      The Arene Services Team
      
      © ${new Date().getFullYear()} Arene Services. All rights reserved.
      
      This is an automated notification. Please do not reply to this email.
    `;
    const isBanquetHall = Type === 'Banquet Hall' || propertyname?.toLowerCase().includes('banquet') || propertyname?.toLowerCase().includes('hall');
    const subject = isBanquetHall 
    ? `🎉 New Banquet Hall Enquiry: ${propertyname}`
    : `New Enquiry: ${propertyname}`;
    // Email options
    const mailOptions = {
      from: `"Arene Services Enquiries" <rohitssm5533@gmail.com>`,
      to: recipientEmail,
      cc: 'rohitssm5533@gmail.com', // Send copy to admin
      subject: subject,
      text: textTemplate,
      html: htmlTemplate,
      replyTo: email || 'rohitssm5533@gmail.com', // Set reply-to for customer emails
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Enquiry email sent:', info.messageId);
    
    return res.status(200).json({ 
      message: 'Enquiry email sent successfully',
      messageId: info.messageId 
    });

  } catch (error) {
    console.error('Error sending enquiry email:', error);
    return res.status(500).json({ 
      message: 'Failed to send enquiry email',
      error: error.message 
    });
  }
}