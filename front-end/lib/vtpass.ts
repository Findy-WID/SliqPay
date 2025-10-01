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

  const headers = {
    "api-key": apiKey,
    "public-key": publicKey,
    "secret-key": secretKey,
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
  console.log("- Public Key:", publicKey ? `${publicKey.substring(0, 4)}...${publicKey.substring(publicKey.length - 4)}` : "NOT_SET");
  console.log("- Secret Key:", secretKey ? "PRESENT" : "NOT_SET");
  console.log("- Base URL:", baseUrl);
  console.log("- Full URL:", `${baseUrl}/pay`);

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

export const requeryTransaction = async (payload: { request_id: string }) => {
  const VTPASS_API_KEY = env.VTPASS_API_KEY;
  const VTPASS_SECRET_KEY = env.VTPASS_SECRET_KEY;
  const VTPASS_BASE_URL = env.VTPASS_BASE_URL;

  if (!VTPASS_API_KEY || !VTPASS_SECRET_KEY || !VTPASS_BASE_URL) {
    throw new Error("VTpass API credentials or base URL are not set in environment variables.");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${VTPASS_BASE_URL}/requery`, {
      method: "POST",
      headers: {
        "api-key": VTPASS_API_KEY,
        "secret-key": VTPASS_SECRET_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ request_id: payload.request_id }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      console.error("Fetch error requerying transaction:", data);
      throw new Error(data?.response_description || data?.message || "Failed to requery transaction.");
    }

    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error("Transaction requery timed out. Please try again later.");
    }
    console.error("Unknown error requerying transaction:", error);
    throw new Error("An unknown error occurred while requerying the transaction.");
  }
};
