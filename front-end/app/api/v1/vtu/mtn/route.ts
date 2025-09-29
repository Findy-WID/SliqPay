import { NextRequest, NextResponse } from "next/server";
import { sendVtu } from "@/lib/vtpass";
import { generateRequestId } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { phone, amount } = await req.json();
    if (!phone || !amount) {
      return NextResponse.json({ error: "Phone and amount are required" }, { status: 400 });
    }

    const request_id = generateRequestId();
    const vtpassRes = await sendVtu({ serviceID: "mtn", phone, amount: String(amount), request_id });
    return NextResponse.json(vtpassRes);
  } catch (error: any) {
    console.error("VTU API error:", error);
    return NextResponse.json({ error: error.message || error.toString() || "VTU request failed", stack: error.stack }, { status: 500 });
  }
}
