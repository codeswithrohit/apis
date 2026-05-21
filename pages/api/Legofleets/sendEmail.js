import nodemailer from "nodemailer";

export default async function handler(req, res) {
  // 1. SET CORS HEADERS TO ALLOW FRONTEND REQUESTS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 2. HANDLE THE CORS PREFLIGHT (OPTIONS) REQUEST
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3. BLOCK ANYTHING THAT IS NOT A POST REQUEST
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const formData = req.body; 
  console.log("Form Data:", formData);

  try {
    // 4. SETUP NODEMAILER TRANSPORTER
    const transporter = nodemailer.createTransport({
      host: "mail.legofleets.in", 
      port: 465, 
      secure: true, 
      auth: {
        user: "sales@legofleets.in", 
        pass: "H@rsiddhi2026", 
      },
    });

    const currentYear = new Date().getFullYear();
    const vehicleType = formData.selectedVehicleType === 'suv' ? 'SUV' :
                        formData.selectedVehicleType === 'miniSuv' ? 'MiniSUV' :   
                        formData.selectedVehicleType === 'sedan' ? 'SEDAN' :
                        formData.selectedVehicleType || 'N/A';

    // 5. SEND THE EMAIL
    const info = await transporter.sendMail({
      from: '"LegoFleets" <sales@legofleets.in>',
      to: formData.email,
      subject: "Booking Confirmation & Invoice - LegoFleets",
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Booking Confirmation</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f7f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f7f6; padding: 40px 20px;">
          <tr>
            <td align="center">
              
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); max-width: 600px; margin: 0 auto;">
                
                <tr>
                  <td style="background-color: #1e293b; padding: 30px 40px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 600; letter-spacing: 1px;">LegoFleets</h1>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin-top: 0; color: #1e293b; font-size: 22px; font-weight: 600;">Booking Confirmed</h2>
                    <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 28px;">
                      Dear <strong>${formData.firstName || ''} ${formData.lastName || ''}</strong>,<br><br>
                      Thank you for choosing LegoFleets. Your booking has been successfully processed. Please review your itinerary details below.
                    </p>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 30px; border-collapse: collapse;">
                      
                      <tr>
                        <th colspan="2" style="background-color: #f8fafc; padding: 14px 18px; text-align: left; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Customer Details</th>
                      </tr>
                      <tr>
                        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 14px; width: 40%;">Name</td>
                        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 14px; font-weight: 600;">${formData.firstName || ''} ${formData.lastName || ''}</td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">Email</td>
                        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 14px; font-weight: 600;">${formData.email || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">Mobile No.</td>
                        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 14px; font-weight: 600;">${formData.phoneNumber || 'N/A'}</td>
                      </tr>
                      ${formData.flightnumber ? `
                      <tr>
                        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">Flight Number</td>
                        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 14px; font-weight: 600;">${formData.flightnumber}</td>
                      </tr>` : ''}
                      ${formData.formattedTime ? `
                      <tr>
                        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">Arrival/Departure Time</td>
                        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 14px; font-weight: 600;">${formData.formattedTime}</td>
                      </tr>` : ''}

                      <tr>
                        <th colspan="2" style="background-color: #f8fafc; padding: 14px 18px; text-align: left; border-top: 2px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Booking Details</th>
                      </tr>
                      <tr>
                        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">Service</td>
                        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 14px; font-weight: 600;">${formData.selectedService || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">Pickup Address</td>
                        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 14px; font-weight: 600;">${formData.pickupaddress || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">Pickup Location</td>
                        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 14px; font-weight: 600;">${formData.selectedPickupLocation || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">Drop-off Address</td>
                        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 14px; font-weight: 600;">${formData.dropoffaddress || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">Drop-off Location</td>
                        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 14px; font-weight: 600;">${formData.selectedDropoffLocation || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">Vehicle</td>
                        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 14px; font-weight: 600;">${vehicleType}</td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">Passenger(s)</td>
                        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 14px; font-weight: 600;">${formData.selectedPassenger || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">Suitcase(s)</td>
                        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 14px; font-weight: 600;">${formData.selectedSuitcase || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">Pickup Date</td>
                        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 14px; font-weight: 600;">${formData.formattedPickupDate || formData.selectedPickupDate || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">Drop-off Date</td>
                        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 14px; font-weight: 600;">${formData.formattedDropoffDate || formData.selectedDropoffDate || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">Distance</td>
                        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 14px; font-weight: 600;">${formData.selectedDistance || 'N/A'}</td>
                      </tr>
                      ${formData.comment ? `
                      <tr>
                        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">Comment</td>
                        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 14px; font-weight: 600;">${formData.comment}</td>
                      </tr>` : ''}
                      <tr>
                        <td style="padding: 14px 18px; color: #64748b; font-size: 14px;">Total Amount</td>
                        <td style="padding: 14px 18px; color: #2563eb; font-size: 16px; font-weight: bold;">₹ ${formData.selectedPrice || '0'}</td>
                      </tr>
                    </table>
                    
                    <div style="color: #475569; font-size: 14px; margin-bottom: 35px;">
                    <p style="background-color: #f8fafc; padding: 15px; margin-top: 0; margin-bottom: 20px; border-radius: 4px;">
                      <strong>Note:</strong> Driver details will be sent to your contact number 2 hours before your pickup time on the date of travel. <br><br>
                      We recommend that you read the terms and conditions on our website carefully prior to travel.
                    </p>
                      <p style="line-height: 1.6; margin-bottom: 20px;">
                        Wishing you a safe and happy journey! We look forward to serving you again.
                      </p>
                      <p style="line-height: 1.6; margin: 0;">
                        Kind regards,<br>
                        <strong>LegoFleets Team</strong>
                      </p>
                    </div>
                    
                  </td>
                </tr>
                
                <tr>
                  <td style="background-color: #f1f5f9; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.5;">
                      &copy; ${currentYear} LegoFleets. All rights reserved.<br>
                      Need assistance? <a href="mailto:sales@legofleets.in" style="color: #2563eb; text-decoration: none;">Contact Support</a>
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `
    });

    console.log("Email sent: %s", info.messageId);

    return res.status(200).json({ message: "Booking confirmed. Email sent successfully." });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}