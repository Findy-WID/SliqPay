export interface VtpassVtuPayload {
  serviceID: string; // e.g. "mtn"
  phone: string; // recipient phone number
  amount: string; // amount in Naira
  request_id: string; // unique per transaction
}

export interface VtpassVtuResponse {
  code: string;
  content: {
    transactions: {
      status: string;
      product_name: string;
      unique_element: string;
      unit_price: string;
      quantity: number;
      service_verification: null;
      channel: string;
      commission: number;
      total_amount: number;
      discount: null;
      type: string;
      email: string;
      phone: string;
      name: null;
      convinience_fee: number;
      amount: string;
      platform: string;
      method: string;
      transactionId: string;
      commission_details: {
        amount: number;
        rate: string;
        rate_type: string;
        computation_type: string;
      };
    };
  };
  response_description: string;
  requestId: string;
  amount: number;
  transaction_date: string;
  purchased_code: string;
}

import { env } from '@/lib/env';

/**
 * Sends a VTU (airtime) request to the VTPass API
 * Documentation: https://vtpass.com/documentation/mtn-airtime-vtu-api/
 * 
 * For successful sandbox testing, use these test phone numbers:
 * - 08011111111: Returns a successful response
 * - 201000000000: Simulates a pending response
 * - 500000000000: Simulates an unexpected response
 * - 400000000000: Simulates no response
 * - 300000000000: Simulates a timeout scenario
 * - Any other number: Simulates a failed transaction
 */
export async function sendVtu({ serviceID, phone, amount, request_id }: { serviceID: string; phone: string; amount: string | number; request_id: string }) {
  // Ensure amount is a string
  const amountString = typeof amount === 'number' ? amount.toString() : amount;
  
  // Validate phone number format - must be 10-11 digits
  const cleanPhone = phone.replace(/\D/g, '');
  if (!/^\d{10,11}$/.test(cleanPhone)) {
    throw new Error(`Invalid phone number format: ${phone}`);
  }
  
  const apiKey = env.VTPASS_API_KEY;
  const publicKey = env.VTPASS_PUBLIC_KEY;
  const secretKey = env.VTPASS_SECRET_KEY;
  const baseUrl = env.VTPASS_BASE_URL;

  if (!apiKey || !publicKey || !secretKey || !baseUrl) {
    throw new Error("VTpass API keys or base URL are not set in environment variables");
  }

  const payload: VtpassVtuPayload = {
    serviceID,
    phone: cleanPhone,
    amount: amountString,
    request_id,
  };

  // For POST requests, use api-key and secret-key as per documentation
  const headers = {
    "api-key": apiKey,
    "secret-key": secretKey, // For POST requests we use secret-key, not public-key
    "Content-Type": "application/json",
    Accept: "application/json",
  } as Record<string, string>;

  // Debug: log VTpass request details (without full secrets)
  console.log("VTPass Request Details:");
  console.log("- Service ID:", serviceID);
  console.log("- Phone:", cleanPhone);
  console.log("- Amount:", amountString);
  console.log("- Request ID:", request_id);
  console.log("- API Key:", apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : "NOT_SET");
  console.log("- Secret Key:", secretKey ? `${secretKey.substring(0, 4)}...${secretKey.substring(secretKey.length - 4)}` : "NOT_SET");
  console.log("- Base URL:", baseUrl);
  console.log("- Full URL:", `${baseUrl}/pay`);
  
  // Validate required credentials
  if (!apiKey || !secretKey) {
    throw new Error("VTPass API credentials are not properly configured. Please check your environment variables.");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    console.log("Making VTPass API request with payload:", JSON.stringify(payload));
    
    const response = await fetch(`${baseUrl}/pay`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    console.log("VTPass HTTP status:", response.status, response.statusText);
    
    // Try to get the response data
    let data;
    try {
      data = await response.json();
      console.log("VTPass raw response:", JSON.stringify(data));
    } catch (jsonError) {
      console.error("Failed to parse VTPass response as JSON:", await response.text());
      throw new Error("Invalid response from VTPass API");
    }

    // Check for specific error patterns in the VTPass response
    if (data?.response_description?.includes("TRANSACTION FAILED")) {
      console.error("VTPass transaction failed:", data);
      throw new Error("Transaction failed. Please check your phone number and try again.");
    }
    
    if (!response.ok || data?.code !== "000") {
      console.error("VTPass API error response:", data);
      throw new Error(
        data?.response_description || 
        data?.message || 
        `VTPass API error (${response.status})`
      );
    }

    console.log("VTPass API successful response:", data);
    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error("VTPass API request timed out");
    }
    // Log the full error for debugging
    console.error("VTPass API call failed:", error);
    // Re-throw with a more user-friendly message if possible
    throw new Error(error.message || "Failed to process airtime purchase");
  }
}

/**
 * Query the status of a transaction using the VTPass API
 * Documentation: https://vtpass.com/documentation/mtn-airtime-vtu-api/
 */
/**
 * Query the status of a transaction using the VTPass API
 * Documentation: https://vtpass.com/documentation/mtn-airtime-vtu-api/
 */
export async function requeryTransaction({ request_id }: { request_id: string }) {
  const apiKey = env.VTPASS_API_KEY;
  const secretKey = env.VTPASS_SECRET_KEY; // For POST requests we use secret-key as per documentation
  const baseUrl = env.VTPASS_BASE_URL;

  if (!apiKey || !secretKey || !baseUrl) {
    throw new Error("VTpass API keys or base URL are not set in environment variables");
  }
  
  console.log(`Requerying transaction with request_id: ${request_id}`);
  
  const headers = {
    "api-key": apiKey,
    "secret-key": secretKey,
    "Content-Type": "application/json",
    Accept: "application/json",
  } as Record<string, string>;

  // Debug log (without showing full secrets)
  console.log("VTPass Requery Details:");
  console.log("- Request ID:", request_id);
  console.log("- API Key:", apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : "NOT_SET");
  console.log("- Secret Key:", secretKey ? `${secretKey.substring(0, 4)}...${secretKey.substring(secretKey.length - 4)}` : "NOT_SET");
  console.log("- Base URL:", baseUrl);
  console.log("- Full URL:", `${baseUrl}/requery`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    console.log("Making VTPass requery request with payload:", JSON.stringify({ request_id }));
    
    const response = await fetch(`${baseUrl}/requery`, {
      method: "POST",
      headers,
      body: JSON.stringify({ request_id }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    console.log("VTPass requery HTTP status:", response.status, response.statusText);
    
    // Try to get the response data
    let data;
    try {
      data = await response.json();
      console.log("VTPass requery raw response:", JSON.stringify(data));
    } catch (jsonError) {
      console.error("Failed to parse VTPass requery response as JSON:", await response.text());
      throw new Error("Invalid response from VTPass API");
    }

    if (!response.ok || data?.code !== "000") {
      console.error("VTPass API requery error response:", data);
      throw new Error(
        data?.response_description || 
        data?.message || 
        `VTPass API requery error (${response.status})`
      );
    }

    console.log("VTPass API requery successful response:", data);
    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error("VTPass API requery request timed out");
    }
    console.error("VTPass API requery failed:", error);
    throw new Error(error.message || "Failed to check transaction status");
  }
}
