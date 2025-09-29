export interface VtpassVtuPayload {
  serviceID: string; // e.g. "mtn"
  phone: string; // recipient phone number
  amount: string; // amount in Naira
  request_id: string; // unique per transaction
}

export async function sendVtu({ serviceID, phone, amount, request_id }: { serviceID: string; phone: string; amount: string; request_id: string }) {
  const apiKey = process.env.VTPASS_API_KEY;
  const publicKey = process.env.VTPASS_PUBLIC_KEY;
  const secretKey = process.env.VTPASS_SECRET_KEY;
  const baseUrl = process.env.VTPASS_BASE_URL;

  if (!apiKey || !publicKey || !secretKey || !baseUrl) {
    throw new Error("VTpass API keys or base URL are not set in environment variables");
  }

  const payload: VtpassVtuPayload = {
    serviceID,
    phone,
    amount,
    request_id,
  };

  const headers = {
    "api-key": apiKey,
    "public-key": publicKey,
    "secret-key": secretKey,
    "Content-Type": "application/json",
    Accept: "application/json",
  } as Record<string, string>;

  // Debug: log VTpass env vars and URL
  console.log("VTPASS_API_KEY", apiKey);
  console.log("VTPASS_PUBLIC_KEY", publicKey);
  console.log("VTPASS_SECRET_KEY", secretKey);
  console.log("VTPASS_BASE_URL", baseUrl);
  console.log("VTpass full URL", `${baseUrl}/pay`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${baseUrl}/pay`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      console.error("VTpass API error response:", data);
      throw new Error(data?.response_description || data?.message || "VTpass API error");
    }

    console.log("VTpass API response:", data);
    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error("VTpass API request timed out");
    }
    // Re-throw other errors so callers see the real VTpass message (e.g., INVALID CREDENTIALS)
    throw error;
  }
}

export const requeryTransaction = async (payload: { request_id: string }) => {
  const VTPASS_API_KEY = process.env.VTPASS_API_KEY;
  const VTPASS_SECRET_KEY = process.env.VTPASS_SECRET_KEY;
  const VTPASS_BASE_URL = process.env.VTPASS_BASE_URL;

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
