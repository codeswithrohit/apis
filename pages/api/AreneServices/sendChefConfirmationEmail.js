import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'rohitssm5533@gmail.com', 
    pass: 'zgnhgrepruwcarpp', 
  },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const { orderData } = req.body;

    const itemsSummary = orderData.items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
          <strong>${item.foodName}</strong><br>
          <small>${item.tenure} (${item.noofthalli} Thalli)</small>
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${item.price}</td>
      </tr>
    `).join('');

    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #4F46E5; text-align: center;">Kitchen Order Confirmed!</h2>
        <p>Hi ${orderData.userName},</p>
        <p>Your delicious meal order has been received and is being prepared.</p>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px;">
          <strong>Order ID:</strong> ${orderData.orderId}<br>
          <strong>Delivery Address:</strong> ${orderData.deliveryAddress}
        </div>
        <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
          <thead>
            <tr style="background: #eee;">
              <th style="text-align: left; padding: 8px;">Item</th>
              <th style="padding: 8px;">Qty</th>
              <th style="text-align: right; padding: 8px;">Price</th>
            </tr>
          </thead>
          <tbody>${itemsSummary}</tbody>
        </table>
        <div style="text-align: right; margin-top: 15px;">
          <strong>Total Amount Paid: ₹${orderData.totalAmount}</strong>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Arene Kitchen" <rohitssm5533@gmail.com>`,
      to: orderData.userEmail,
      subject: `🍽️ Order Confirmed: ${orderData.orderId}`,
      html: htmlTemplate,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}