import axios from 'axios';

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

  const { bookingDetails } = req.body;
  const AISENSY_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMDE5ZTZjYzg4Njk1NjYyNTA0YzAxOCIsIm5hbWUiOiJURUNIIEJBQlVBIiwiYXBwTmFtZSI6IkFpU2Vuc3kiLCJjbGllbnRJZCI6IjZhMDE5ZTZjYzg4Njk1NjYyNTA0YzAxMyIsImFjdGl2ZVBsYW4iOiJGUkVFX0ZPUkVWRVIiLCJpYXQiOjE3Nzg0OTA5ODh9.EZ1e3RbhJe1juaPpRjSx47-ii58YVQfwZy9knHte5Zs';

  try {
    let cleanNumber = bookingDetails.phoneNumber.replace(/\D/g, '');
    if (!cleanNumber.startsWith('91')) cleanNumber = `91${cleanNumber}`;

    // Format the vehicle type (e.g., 'suv' to 'SUV')
    const formatVehicle = (type) => {
      if (!type) return "Car";
      if (type === 'suv') return 'SUV';
      if (type === 'miniSuv') return 'MiniSUV';
      if (type === 'sedan') return 'Sedan';
      return type;
    };

    // The order of these 8 items MUST MATCH the {{1}} through {{8}} in your template
    const params = [
      String(bookingDetails.firstName || "Customer"),                    // {{1}} Name
      String(bookingDetails.orderId || "Pending"),                       // {{2}} Order ID
      String(bookingDetails.selectedService || "Transport"),             // {{3}} Service
      String(formatVehicle(bookingDetails.selectedVehicleType)),         // {{4}} Vehicle
      String(bookingDetails.selectedPickupLocation || "TBD"),            // {{5}} Pickup Loc
      String(bookingDetails.selectedDropoffLocation || "TBD"),           // {{6}} Drop-off Loc
      String(bookingDetails.selectedPickupDate || "TBD"),                // {{7}} Date
      String(bookingDetails.selectedPrice || "0")                        // {{8}} Amount
    ];

    const payload = {
      apiKey: AISENSY_API_KEY,
      campaignName: "booking_alert_v2", // MUST BE YOUR NEW CAMPAIGN NAME
      destination: cleanNumber,
      userName: bookingDetails.firstName || "Customer",
      templateParams: params, 
      source: "NextJS Website"
    };

    console.log("Sending WhatsApp payload:", JSON.stringify(payload, null, 2));

    const response = await axios.post('https://backend.aisensy.com/campaign/t1/api/v2', payload);
    return res.status(200).json({ success: true, data: response.data });

  } catch (error) {
    console.error('AISENSY REJECTION:', JSON.stringify(error.response?.data, null, 2));
    return res.status(500).json({ success: false, error: 'Failed' });
  }
}