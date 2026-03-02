import nodemailer from "nodemailer";
import puppeteer from "puppeteer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const formData = req.body; 
  console.log("Form Data:", formData);

  try {
    // Determine the base URL for the image. 
    // IMPORTANT: Ensure NEXT_PUBLIC_HOST is set in your .env.local file!
    // Example: NEXT_PUBLIC_HOST=http://localhost:3000
    const baseUrl = process.env.NEXT_PUBLIC_HOST || 'https://legofleets.in';
    const logoUrl = `${baseUrl}/logo.png`;

    // 1. GENERATE THE PDF HTML LOCALLY
    const pdfHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body class="bg-white text-gray-800">
        <div class="max-w-[85rem] px-4 sm:px-6 lg:px-8 mx-auto">
          <div class="sm:w-11/12 lg:w-3/4 mx-auto py-4">
            
            <div class="flex bg-[#541e50] justify-between">
              <div class="p-4 flex items-center">
                <img src="${logoUrl}" width="120" height="50" alt="LegoFleets Logo" />
              </div>
              <div class="text-end p-4">
                <h2 class="text-2xl md:text-3xl font-semibold text-white">Invoice #</h2>
                <span class="mt-1 block text-white">${formData.orderId || formData.docId || 'N/A'}</span>
                <address class="mt-4 not-italic text-white">
                  Add : Undri, Pune. 
                </address>
              </div>
            </div>

            <div class="flex flex-col p-4 sm:p-10 bg-white shadow-md rounded-sm border border-gray-200 mt-2">
              <div class="mt-8 grid sm:grid-cols-2 gap-3">
                <div>
                  <h3 class="text-md font-semibold text-gray-800">${formData.firstName || ''} ${formData.lastName || ''}</h3>
                  <h3 class="text-md font-semibold text-gray-800">${formData.email || ''}</h3>
                  <h3 class="text-md font-semibold text-gray-800">${formData.phoneNumber || ''}</h3>
                  
                  <h6 class="text-sm font-bold text-gray-800 mt-4">Pickup Address:</h6>
                  <address class="not-italic text-gray-500">${formData.pickupaddress || 'N/A'}</address>
                  
                  <h6 class="text-sm font-bold text-gray-800 mt-2">Pickup location:</h6>
                  <address class="not-italic text-gray-500">${formData.selectedPickupLocation || 'N/A'}</address>
                  
                  <h6 class="text-sm font-bold text-gray-800 mt-2">Drop-off Address:</h6>
                  <address class="mt-1 not-italic text-gray-500">${formData.dropoffaddress || 'N/A'}</address>
                  
                  <h6 class="text-sm font-bold text-gray-800 mt-2">Drop-off location:</h6>
                  <address class="mt-1 not-italic text-gray-500">${formData.selectedDropoffLocation || 'N/A'}</address>
                </div>

                <div class="sm:text-end space-y-2">
                  <div class="grid grid-cols-2 sm:grid-cols-1 gap-3 sm:gap-2">
                    <dl class="grid sm:grid-cols-5 gap-x-3">
                      <dt class="col-span-3 font-semibold text-gray-800">Booking date:</dt>
                      <dd class="col-span-2 text-gray-500">${new Date().toLocaleDateString('en-GB')}</dd>
                    </dl>
                    <dl class="grid sm:grid-cols-5 gap-x-3">
                      <dt class="col-span-3 font-semibold text-gray-800">Pickup date:</dt>
                      <dd class="col-span-2 text-gray-500">${formData.formattedPickupDate || formData.selectedPickupDate || 'N/A'}</dd>
                    </dl>
                    <dl class="grid sm:grid-cols-5 gap-x-3">
                      <dt class="col-span-3 font-semibold text-gray-800">Drop-off date:</dt>
                      <dd class="col-span-2 text-gray-500">${formData.formattedDropoffDate || formData.selectedDropoffDate || 'N/A'}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div class="mt-6">
                <div class="overflow-x-auto">
                  <table class="table-auto w-full border-collapse border border-gray-200">
                    <thead class="bg-gray-100">
                      <tr>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Service</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Vehicle</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Passenger</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Suitcase</th>
                        <th class="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase">Distance</th>
                        <th class="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                      <tr>
                        <td class="px-4 py-3 text-sm text-gray-800">${formData.selectedService || 'N/A'}</td>
                        <td class="px-4 py-3 text-sm text-gray-800 uppercase">${formData.selectedVehicleType || 'N/A'}</td>
                        <td class="px-4 py-3 text-sm text-gray-800">${formData.selectedPassenger || 'N/A'}</td>
                        <td class="px-4 py-3 text-sm text-gray-800">${formData.selectedSuitcase || 'N/A'}</td>
                        <td class="px-4 py-3 text-sm text-right text-gray-800">${formData.selectedDistance || 'N/A'}</td>
                        <td class="px-4 py-3 text-sm text-right text-gray-800">₹${formData.selectedPrice || '0'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div class="mt-8 flex sm:justify-end">
                <div class="w-full max-w-2xl sm:text-end space-y-2">
                  <div class="grid grid-cols-2 sm:grid-cols-1 gap-3 sm:gap-2">
                    <dl class="grid sm:grid-cols-5 gap-x-3">
                      <dt class="col-span-3 font-semibold text-gray-800">Subtotal:</dt>
                      <dd class="col-span-2 text-gray-500">₹${formData.selectedPrice || '0'}</dd>
                    </dl>
                    <dl class="grid sm:grid-cols-5 gap-x-3">
                      <dt class="col-span-3 font-semibold text-gray-800">Total:</dt>
                      <dd class="col-span-2 text-gray-500 font-bold">₹${formData.selectedPrice || '0'}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div class="mt-8 sm:mt-12">
                <h4 class="text-lg font-semibold text-gray-800">Thank you!</h4>
                <p class="text-gray-500">“If you have any questions concerning this invoice, use the following contact information”</p>
                <div class="mt-2">
                  <p class="block text-sm font-medium text-gray-800">sales@legofleets.in</p>
                  <p class="block text-sm font-medium text-gray-800">+91 9021077996</p>
                </div>
              </div>
              <p class="mt-5 text-sm text-gray-500">© ${new Date().getFullYear()} Legofleets.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // 2. RUN PUPPETEER TO GENERATE BUFFER
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    // networkidle0 waits for all network requests (including your logo image and Tailwind CDN) to finish loading
    await page.setContent(pdfHtml, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
    });
    
    await browser.close();

    // 3. SEND EMAIL VIA NODEMAILER
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
  <strong>Note:</strong> Driver details will be sent to your contact number before 2 hours of your pickup time on the date of travel. <br><br>
  We have attached a PDF of the invoice with terms and conditions for your reference. We recommend that you read the terms and conditions carefully prior to travel.
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
                          `,
                          attachments: [
                            {
                              filename: `Invoice_${formData.orderId || 'LegoFleets'}.pdf`,
                              content: pdfBuffer,
                              contentType: 'application/pdf'
                            }
                          ]
                        });

    console.log("Email sent: %s", info.messageId);

    return res.status(200).json({ message: "Booking confirmed. Email with PDF sent successfully." });
  } catch (error) {
    console.error("Error generating PDF or sending email:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}