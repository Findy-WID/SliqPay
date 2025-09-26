import { auth } from "@/lib/auth";
import { publicUser } from "@/lib/user";
import { handleError } from "@/lib/errors";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const authRequest = auth.handleRequest(req);
    const session = await authRequest.validate();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ user: publicUser(session.user) });
  } catch (error) {
    return handleError(error);
  }
}
