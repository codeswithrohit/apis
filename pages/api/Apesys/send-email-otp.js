// pages/api/Apesys/send-email-otp.js (on the live server)

import nodemailer from 'nodemailer';
// Ensure this import points to your server-side Firebase setup (preferably Admin SDK)
// Since the path is relative, ensure your folder structure on the API server matches:
import { firebase } from '../../../Firebase/config'; 

// 🚨 Security Note: Using hardcoded credentials is risky. Use process.env variables.
// If your live server uses a .env file, you should use process.env.EMAIL_USER/PASS here.
const EMAIL_USER = 'apesysapp@gmail.com'; 
const EMAIL_PASS = 'lndesebasvhvuupr';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

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

export default async function handler(req, res) {
    // -----------------------------------------------------
    // 🌟 CORS FIX: Allow access from your frontend domain
    // -----------------------------------------------------
    // Replace '*' with your actual deployed frontend URL (e.g., 'https://my-frontend.com') 
    // for maximum security. Using '*' for testing initially is okay.
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle pre-flight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    // -----------------------------------------------------

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { email } = req.body; 

    if (!email) {
        console.error('Email field is missing from request body.');
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

        // 4. Send Email
        const mailOptions = {
            from: EMAIL_USER, // Using the defined sender email
            to: email,
            subject: 'APESys Email Verification OTP',
            html: getEmailTemplate(otp), 
        };

        await transporter.sendMail(mailOptions);

        // 5. Respond to the frontend
        res.status(200).json({ message: 'OTP sent successfully', success: true });

    } catch (error) {
        console.error('Error sending email OTP:', error);
        res.status(500).json({ message: 'Failed to send OTP. Check API logs.', error: error.message });
    }
}