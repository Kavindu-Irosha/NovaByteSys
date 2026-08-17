import { adminDb, adminAuth } from "../lib/firebase-admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
import SubscriptionsClient from "../components/SubscriptionsClient";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function SubscriptionsPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (!session) {
    redirect("/auth");
  }

  let decodedToken;
  try {
    decodedToken = await adminAuth.verifySessionCookie(session, true);
  } catch (error) {
    redirect("/auth");
  }

  // Server-Side Data Fetching
  const snapshot = await adminDb.collection("subscriptions").orderBy("createdAt", "desc").get();
  const initialSubscriptions = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt ? data.createdAt.toDate().toLocaleDateString() : "N/A"
    };
  });

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b border-muted shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-bold">N</div>
              <h1 className="text-xl font-bold tracking-tight mr-4">NovaByte Dashboard</h1>
            </div>
            <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
              <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">Overview</Link>
              <Link href="/projects" className="text-muted-foreground transition-colors hover:text-foreground">Projects Ledger</Link>
              <Link href="/subscriptions" className="text-foreground transition-colors hover:text-foreground/80">Subscriptions</Link>
              <Link href="/reports" className="text-muted-foreground transition-colors hover:text-foreground">Audit Reports</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground hidden md:block">
              {decodedToken.email}
            </div>
            <form action="/api/logout" method="POST">
              <Button variant="destructive" size="sm" type="submit" className="font-medium">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 bg-background min-h-[calc(100vh-4rem)]">
        <SubscriptionsClient initialSubscriptions={initialSubscriptions} />
      </main>
    </div>
  );
}
