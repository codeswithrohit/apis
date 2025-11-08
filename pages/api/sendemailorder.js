import nodemailer from 'nodemailer';

// --- HTML Templates (Start) ---

// Define colors for professional, distinct emails
const brandColor = '#0056b3'; // Deep Blue
const accentColor = '#e9ecef'; // Light Gray for backgrounds
const totalColor = '#dc3545'; // Red for total amount emphasis
const successColor = '#28a745'; // Green for success status

// Function to format currency
const formatCurrency = (amount) => `₹${Number(amount).toFixed(2)}`;

/**
 * Generates the HTML content for a New Order email (Invoice Theme)
 */
const generateNewOrderHtml = (orderData) => {
    const orderDate = orderData.createdAt ? new Date(orderData.createdAt.seconds * 1000).toLocaleDateString() : 'N/A';
    return `
        <html lang="en">
          <head>
            <style>
              body { font-family: sans-serif; color: #343a40; background-color: #f8f9fa; padding: 0; margin: 0; }
              .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #dee2e6; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); overflow: hidden; }
              .header { background-color: ${brandColor}; color: #ffffff; padding: 20px 30px; text-align: center; }
              .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
              .content { padding: 30px; }
              h2 { color: ${brandColor}; border-bottom: 2px solid ${accentColor}; padding-bottom: 5px; margin-top: 25px; margin-bottom: 15px; font-size: 20px; }
              p { line-height: 1.6; margin-bottom: 10px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #dee2e6; border-radius: 4px; overflow: hidden; }
              th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #dee2e6; }
              th { background-color: ${accentColor}; color: #495057; font-weight: 600; text-transform: uppercase; font-size: 12px; }
              .total-row { font-weight: bold; background-color: #f0f0f0; }
              .total-amount { color: ${totalColor}; font-size: 18px; font-weight: 700; }
              .summary-box { background-color: ${accentColor}; padding: 15px; border-radius: 4px; margin-top: 20px; }
              .footer { background-color: #f1f1f1; color: #6c757d; padding: 20px 30px; text-align: center; font-size: 12px; border-top: 1px solid #dee2e6; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Your Order Confirmed! - Fayde Ki Dukaan 🎉</h1>
                <p style="font-size: 14px; margin-top: 5px; color: #ffffffcc;">Order ID: **#${orderData.orderId}**</p>
              </div>
              <div class="content">
                <p>Hello **${orderData.name}**, 👋</p>
                <p>Thank you for placing your order! We are currently **${orderData.orderstatus}** your items. You will receive a separate email once your order ships.</p>
                
                <h2>Order Summary (Placed on ${orderDate})</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${orderData.Products.map(
                        (product) => `
                        <tr>
                          <td>${product.name} (${product.selectedVariant?.variant || 'N/A'})</td>
                          <td>${product.quantity}</td>
                          <td>${formatCurrency(product.selectedVariant?.discountPrice)}</td>
                        </tr>`
                    ).join('')}
                    <tr>
                        <td colspan="2" style="text-align: right; font-weight: bold;">Delivery Charge</td>
                        <td>${formatCurrency(orderData.deliveryCharge)}</td>
                    </tr>
                    <tr class="total-row">
                        <td colspan="2" style="text-align: right; font-weight: bold; font-size: 16px;">TOTAL AMOUNT</td>
                        <td class="total-amount">${formatCurrency(orderData.totalmount)}</td>
                    </tr>
                  </tbody>
                </table>
                
                <h2>Delivery Details</h2>
                <div class="summary-box">
                    <p><strong>Shipping Address:</strong> ${orderData.deliveryData.address}, PIN: ${orderData.deliveryData.pincode}</p>
                    <p><strong>Time Slot:</strong> ${orderData.selectedTimeSlot || 'N/A'}</p>
                    <p><strong>Payment Status:</strong> <span style="font-weight: bold; color: ${orderData.paymentStatus === 'Paid' ? successColor : totalColor};">${orderData.paymentStatus}</span></p>
                </div>

              </div>
              <div class="footer">
                <p>Need help? Contact our support team or track your order status in the app.</p>
                <p>© ${new Date().getFullYear()} Fayde Ki Dukaan. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
    `;
};


/**
 * Generates the HTML content for an Order Status Update email (Suggests another UI theme)
 */
const generateStatusUpdateHtml = (orderData) => {
    let statusText = '';
    let statusColor = brandColor; // Default
    let actionHtml = '';
    let icon = '📦';
    
    // Safely destructure deliveryBoyData
    const deliveryBoyName = orderData.deliveryBoyData?.name || 'N/A';
    const deliveryBoyMobile = orderData.deliveryBoyData?.mobilenumber || 'N/A';
    const assignedPartnerInfo = `
        <p style="font-size: 14px; margin-top: 10px;">**Delivery Partner:** **${deliveryBoyName}**</p>
        <p style="font-size: 14px;">**Partner Contact:** **${deliveryBoyMobile}**</p>
    `;


    switch (orderData.orderstatus) {
        case 'Shipped':
            statusText = 'is on its way to the delivery hub, and a partner has been assigned.';
            statusColor = '#ffc107'; // Yellow for caution/in transit
            actionHtml = `
                <p>Your package is ready and leaving the warehouse. It has been assigned to a delivery partner.</p>
                <p style="font-weight: bold; margin-top: 10px;">Next Step: Out for Delivery.</p>
                <div style="margin-top: 15px; padding: 10px; border: 1px solid #ddd; background-color: #fff;">
                    <p style="font-weight: 700; margin-bottom: 5px; color: ${brandColor};">Delivery Partner Details:</p>
                    ${assignedPartnerInfo}
                </div>
            `;
            icon = '🚚';
            break;
        case 'Out of Delivery':
            statusText = 'is **OUT FOR DELIVERY**!';
            statusColor = successColor;
            actionHtml = `
                <p style="font-size: 16px;">Your order is on its way to your doorstep. The delivery partner will be reaching you soon!</p>
                <p style="background-color: #e6f7ee; padding: 10px; border-radius: 4px; border: 1px dashed ${successColor}; font-weight: bold; margin-top: 15px;">
                    Please keep your **OTP: ${orderData.otp || 'N/A'}** ready to receive your order.
                </p>
                ${assignedPartnerInfo}
            `;
            icon = '🏍️';
            break;
        case 'Delivered':
            statusText = 'has been **SUCCESSFULLY DELIVERED**!';
            statusColor = '#6f42c1'; // Purple
            actionHtml = `
                <p style="font-size: 16px;">The order has been marked as complete. Thank you for your purchase from Fayde Ki Dukaan!</p>
                <p style="font-weight: bold; margin-top: 15px;">Enjoy your products!</p>
            `;
            icon = '✅';
            break;
        case 'Cancelled':
            statusText = 'has been **CANCELLED**.';
            statusColor = totalColor;
            actionHtml = `
                <p style="font-size: 16px;">Your order was cancelled due to the following reason: **${orderData.cancellationReason || 'Reason not specified'}**.</p>
                <p style="margin-top: 10px;">A refund will be processed shortly if payment was made online.</p>
            `;
            icon = '❌';
            break;
        default:
            statusText = `is now **${orderData.orderstatus}**`;
            statusColor = brandColor;
            actionHtml = `<p>There has been an update to your order. Please check your app for more details.</p>`;
            icon = '⚙️';
    }

    return `
        <html lang="en">
          <head>
            <style>
              body { font-family: sans-serif; color: #343a40; background-color: #f8f9fa; padding: 0; margin: 0; }
              .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #dee2e6; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); overflow: hidden; }
              .header { background-color: ${statusColor}; color: #ffffff; padding: 20px 30px; text-align: center; }
              .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
              .content { padding: 30px; }
              .status-box { 
                background-color: ${accentColor}; 
                border-left: 5px solid ${statusColor};
                padding: 20px; 
                border-radius: 6px; 
                margin-bottom: 25px; 
              }
              .status-box p { font-size: 18px; font-weight: 600; margin: 0; color: #343a40; }
              .action-area { margin-top: 20px; padding: 15px; border-radius: 4px; background-color: #f7f9fa; border: 1px solid #ced4da; }
              .action-area p { margin: 0; } /* Reset margin for paragraphs in action area */
              .footer { background-color: #f1f1f1; color: #6c757d; padding: 20px 30px; text-align: center; font-size: 12px; border-top: 1px solid #dee2e6; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${icon} Order Status Update ${icon}</h1>
              </div>
              <div class="content">
                <p>Hello **${orderData.name}**, 👋</p>
                <div class="status-box">
                    <p style="color: ${statusColor}; font-weight: 700;">Order **#${orderData.orderId}** ${statusText}</p>
                </div>
                
                <p><strong>Current Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${orderData.orderstatus}</span></p>
                <p><strong>Shipping To:</strong> ${orderData.deliveryData.address}</p>

                <div class="action-area">
                    ${actionHtml}
                </div>

              </div>
              <div class="footer">
                <p>Track your order status within the app.</p>
                <p>© ${new Date().getFullYear()} Fayde Ki Dukaan. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
    `;
};
// --- HTML Templates (End) ---


export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { orderData, emailType } = req.body; 

        if (!orderData || !emailType || !orderData.email) {
            return res.status(400).json({ message: 'Missing required data (orderData, emailType, or customer email).' });
        }

        let emailSubject = '';
        let emailHtml = '';
        let recipients = ''; 

        // Determine Subject, HTML, and Recipients based on emailType
        switch (emailType) {
            case 'new_order_only':
                emailSubject = `🥳 NEW ORDER Placed: #${orderData.orderId} Confirmed! - Fayde Ki Dukaan`;
                emailHtml = generateNewOrderHtml(orderData);
                // Recipients: User and Admin (as requested for new order)
                recipients = `${orderData.email}, faydekidukaan@gmail.com`;
                break;
            
            case 'shipped_to_all':
                // Check if the actual status being processed is 'Shipped' to be safe
                if (orderData.orderstatus !== 'Shipped') {
                    return res.status(200).json({ message: 'Email skipped: Status does not match emailType (Expected Shipped).' });
                }
                emailSubject = `🚚 Your Order #${orderData.orderId} has been SHIPPED!`;
                emailHtml = generateStatusUpdateHtml(orderData);
                
                // Recipients: User, Admin, and Delivery Boy (as requested for shipped)
                const dbEmail = orderData.deliveryBoyData?.email;
                let shippedRecipients = [orderData.email, 'faydekidukaan@gmail.com'];
                if (dbEmail) {
                    shippedRecipients.push(dbEmail);
                }
                recipients = shippedRecipients.join(', ');
                break;
            
            default:
                // SKIP all other email types (status_update, delivered, cancelled)
                console.log(`Email skipped for type: ${emailType}`);
                return res.status(200).json({ message: 'Email skipped as per custom logic.' });
        }

        if (!recipients) {
             return res.status(200).json({ message: 'No recipients defined for this email type.' });
        }

        // Create a transporter for nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail', 
            auth: {
                user: 'faydekidukaan@gmail.com', 
                pass: 'adldolingygaqaqn', 
            },
        });
        
        // Compose the mail options
        const mailOptions = {
            from: 'faydekidukaan@gmail.com', 
            to: recipients, 
            subject: emailSubject, 
            html: emailHtml, 
        };

        try {
            await transporter.sendMail(mailOptions);
            res.status(200).json({ message: `Email sent successfully for ${emailType} to: ${recipients}` });
        } catch (error) {
            console.error('Error sending email:', error);
            res.status(500).json({ message: 'Failed to send email', error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}