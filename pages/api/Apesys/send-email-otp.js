// pages/api/send-email-otp.js

import nodemailer from 'nodemailer';
import { firebase } from '../../../Firebase/config'; // Adjust path as needed

// 1. Initialize Nodemailer Transporter
// Use environment variables for security!
const transporter = nodemailer.createTransport({
  service: 'gmail', // or 'smtp.sendgrid.net', etc.
  auth: {
    user: 'apesysapp@gmail.com', // e.g., 'youremail@gmail.com'
    pass: 'lndesebasvhvuupr', // e.g., 'your_app_password'
  },
});

// 2. Generate OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email } = req.body; 

  if (!email) {
    // If this log fires, the client didn't send the email field correctly
    console.error('Email field is missing from request body.');
    return res.status(400).json({ message: 'Email is required' });
  }
  //

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const otp = generateOtp();
    const firestore = firebase.firestore();
    const now = new Date();
    const expirationTime = new Date(now.getTime() + 10 * 60000); // 10 minutes expiry

    // 3. Store OTP securely in Firestore with an expiration time
    await firestore.collection('emailOtps').doc(email).set({
      otp: otp,
      createdAt: now,
      expiresAt: expirationTime,
    });

    // 4. Send Email using the BEST TEMPLATE (Simple HTML Example)
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'APESys Email Verification OTP',
      html: getEmailTemplate(otp), // Use a dedicated template function
    };

    await transporter.sendMail(mailOptions);

    // 5. Respond to the frontend
    res.status(200).json({ message: 'OTP sent successfully', success: true });

  } catch (error) {
    console.error('Error sending email OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
}

// 6. Recommended: The "Best" Simple HTML Email Template Function
// Use a service like Mailchimp or SendGrid for complex/professional templates.
const getEmailTemplate = (otp) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="background-color: #4f46e5; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">APESys Verification</h1>
        </div>
        <div style="padding: 30px; text-align: center;">
            <p style="font-size: 16px; color: #333;">Use the following One-Time Password (OTP) to verify your email address. This code is valid for 10 minutes.</p>
            <div style="margin: 30px 0; padding: 15px 25px; background-color: #f0f4ff; border-radius: 8px; display: inline-block; border: 2px dashed #a5b4fc;">
                <strong style="font-size: 32px; color: #4f46e5; letter-spacing: 5px;">${otp}</strong>
            </div>
            <p style="font-size: 14px; color: #777;">If you did not request this, please ignore this email.</p>
        </div>
        <div style="background-color: #f7f7f7; padding: 15px; text-align: center; font-size: 12px; color: #999;">
            &copy; APESys Academic Progress Evaluation System
        </div>
    </div>
  `;
};