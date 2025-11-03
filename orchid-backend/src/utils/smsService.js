import axios from 'axios';
import dotenv from 'dotenv';
// Load environment variables (assuming you run this file in an environment that loads them, like Express server)
dotenv.config(); 

// --- Configuration from .env ---
const SMS_GATEWAY_URL = process.env.SMS_GATEWAY_URL || 'YOUR_SMS_GATEWAY_ENDPOINT_HERE'; 
const SENDER_ID = process.env.SENDER_ID;
const SMS_API_KEY = process.env.SMS_API_KEY;
const OTP_EXPIRY_MINUTES = process.env.OTP_EXPIRY_MINUTES || 10;
// -------------------------------

/**
 * Sends an OTP via SMS to the specified phone number.
 * @param {string} phone - The recipient's phone number.
 * @param {string} otp - The generated OTP.
 */
export const sendOTP = async (phone, otp) => {
  if (SMS_GATEWAY_URL === 'YOUR_SMS_GATEWAY_ENDPOINT_HERE') {
    console.warn(`
      🚨 SMS SERVICE NOT CONFIGURED 🚨
      Please set the SMS_GATEWAY_URL environment variable in your .env file
      and/or update the default value in smsService.js.
      Simulating SMS: OTP ${otp} sent to ${phone}
    `);
    // In a real application, you would proceed with the actual API call:
    return { success: true, message: `OTP ${otp} simulated successfully sent to ${phone}` };
  }
  
  try {
    const message = `Your password reset OTP is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`;

    // 🚨 IMPORTANT: The payload structure below is GENERIC and MUST be adjusted 
    // to match your specific SMS provider's documentation (e.g., parameter names, headers).
    const response = await axios.post(SMS_GATEWAY_URL, {
      api_key: SMS_API_KEY,      // May need to be passed in a header instead
      sender_id: SENDER_ID,      // Or 'from' or 'source'
      to: phone,                 // Or 'recipients'
      message: message,
      // You may need more parameters like DLT template ID, etc.
    });

    // Check response status according to your provider
    // This example assumes a response with a status code 2xx and/or a 'success' field in the body
    if (response.status >= 200 && response.status < 300) {
      // Add more specific success checks based on your provider's response body
      return { success: true, response: response.data };
    } else {
      console.error('SMS Gateway Non-200 Response:', response.status, response.data);
      return { success: false, message: 'Failed to send SMS via gateway (Non-200 status).' };
    }
  } catch (error) {
    // Check if the error is an Axios error (network issues, timeouts, etc.)
    if (axios.isAxiosError(error)) {
        console.error('Error sending SMS via Axios:', error.message, error.response?.data);
        return { success: false, message: `Network or API error: ${error.message}` };
    }
    console.error('Unexpected Error sending SMS:', error.message);
    return { success: false, message: `Server error while trying to send SMS: ${error.message}` };
  }
};
