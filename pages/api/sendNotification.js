import admin from '../../firebaseAdmin';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { tokens, title, body, imageUrl } = req.body;

        if (!tokens || tokens.length === 0) {
            return res.status(400).json({ error: 'No FCM tokens provided' });
        }

        const messages = tokens.map(token => ({
            token,
            notification: {
                title,
                body,
                image: imageUrl,
            },
        }));

        const response = await admin.messaging().sendEach(messages);
        console.log('Notifications sent successfully:', response);

        res.status(200).json({ success: true, response });
    } catch (error) {
        console.error('Error sending notifications:', error);
        res.status(500).json({ error: 'Failed to send notifications' });
    }
}
