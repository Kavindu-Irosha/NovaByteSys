import { adminAuth } from "@/app/lib/firebase-admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { idToken } = await request.json();
        if (!idToken) {
            return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
        }
        const expiresIn = 60 * 60 * 24 * 5 * 1000;
        const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

        const cookieStore = await cookies();
        cookieStore.set("session", sessionCookie, {
            maxAge: expiresIn,
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