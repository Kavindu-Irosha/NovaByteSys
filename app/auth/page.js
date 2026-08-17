"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { auth, googleAuthprovider } from "../lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogIn } from "lucide-react";

export default function Authentication() {

    const router = useRouter();
    const [Loading, setLoading] = useState(false);

    const handleGoogleAuth = async() => {
        try {
            setLoading(true);
            const result = await signInWithPopup(auth, googleAuthprovider);
            const idToken = await result.user.getIdToken();

            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken })
            });


            if (res.ok) {
                router.push("/")
                router.refresh();
            } else {
                let errorMsg = `Server error (${res.status})`;
                try {
                    const text = await res.text();
                    try {
                        const data = JSON.parse(text);
                        errorMsg = data.error || errorMsg;
                    } catch (e) {
                        errorMsg = text || errorMsg;
                    }
                } catch (e) {
                    // Ignore text parse failure
                }
                throw new Error(errorMsg);
            }

        } catch (error) {
            console.error("Login failed", error)
            alert("Login failed: " + (error.message || error))
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md shadow-lg border-muted">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-3xl font-bold tracking-tight">Welcome Back</CardTitle>
                    <CardDescription className="text-base">Sign in to access your dashboard</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center pb-8 pt-4">
                    {Loading ? (
                        <Button variant="outline" disabled className="w-full h-12 text-lg">
                            <Spinner className="mr-2 h-5 w-5" />
                            Signing in...
                        </Button>
                    ) : (
                        <Button
                            onClick={handleGoogleAuth}
                            disabled={Loading}
                            className="w-full h-12 text-lg font-semibold shadow-sm transition-all hover:scale-[1.02]"
                        >
                            <LogIn className="mr-2 h-5 w-5" />
                            Sign in with Google
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}