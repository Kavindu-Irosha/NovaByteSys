import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { idToken, email } = await request.json();
        if (!idToken) {
            return NextResponse.json({ error: "Missing token" }, { status: 400 });
        }

        const sessionData = JSON.stringify({ email: email || "", token: idToken });
        const cookieStore = await cookies();

        cookieStore.set("session", sessionData, {
            maxAge: 60 * 60 * 24 * 7, // 7 days
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/"
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Login API error:", error);
        return NextResponse.json({ error: error?.message || String(error) }, { status: 500 });
    }
}                                                                                                                                             