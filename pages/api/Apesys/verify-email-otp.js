// pages/api/Apesys/verify-email-otp.js (on the live server)

import { firebase } from '../../../Firebase/config'; // Adjust path as needed

export default async function handler(req, res) {
    // -----------------------------------------------------
    // 🌟 CORS FIX: Allow access from your frontend domain
    // -----------------------------------------------------
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

    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required' });
    }

    try {
        const firestore = firebase.firestore();
        const docRef = firestore.collection('emailOtps').doc(email);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(400).json({ message: 'OTP expired or not found. Please request a new OTP.' });
        }

        const storedData = doc.data();
        const now = new Date();
        
        // Firestore timestamps usually need to be converted to Date objects
        const expiryDate = storedData.expiresAt.toDate(); 
        
        // Check for expiration
        if (expiryDate < now) {
            await docRef.delete(); // Clean up expired OTP
            return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
        }

        // Check for OTP match
        if (storedData.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP. Please check and try again.' });
        }

        // OTP verified successfully: Delete the OTP from the database
        await docRef.delete();
        
        res.status(200).json({ message: 'Email verified successfully!', success: true });

    } catch (error) {
        console.error('Error verifying email OTP:', error);
        res.status(500).json({ message: 'Verification failed. Please try again.', error: error.message });
    }
}