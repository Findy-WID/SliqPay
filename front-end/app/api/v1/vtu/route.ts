import { NextRequest, NextResponse } from "next/server";
import { sendVtu } from "@/lib/vtpass";
import { generateRequestId } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { serviceID, phone, amount } = await req.json();
    if (!serviceID || !phone || !amount) {
      return NextResponse.json({ error: "serviceID, phone and amount are required" }, { status: 400 });
    }

    const request_id = generateRequestId();
    const vtpassRes = await sendVtu({ serviceID, phone, amount: String(amount), request_id });
    return NextResponse.json(vtpassRes);
  } catch (error: any) {
    console.error("VTU API error:", error);
    return NextResponse.json({ error: error.message || "VTU request failed" }, { status: 500 });
  }
}
