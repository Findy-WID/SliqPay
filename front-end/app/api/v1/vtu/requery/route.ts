import { NextRequest, NextResponse } from "next/server";
import { requeryTransaction } from "@/lib/vtpass";

export async function POST(req: NextRequest) {
  try {
    const { request_id } = await req.json();
    if (!request_id) {
      return NextResponse.json({ error: "Request ID is required" }, { status: 400 });
    }

    const vtpassRes = await requeryTransaction({ request_id });

    return NextResponse.json(vtpassRes);
  } catch (error: any) {
    console.error("Requery API error:", error);
    return NextResponse.json({ error: error.message || "Requery request failed" }, { status: 500 });
  }
}
