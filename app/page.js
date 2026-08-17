import { adminDb } from "./lib/firebase-admin";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Link from "next/link";
import DashboardClient from "./components/DashboardClient";

function safeToIsoString(val) {
  if (!val) return new Date().toISOString();
  if (typeof val.toDate === "function") {
    try { return val.toDate().toISOString(); } catch (e) {}
  }
  if (typeof val === "string") return val;
  if (val instanceof Date) return val.toISOString();
  return new Date().toISOString();
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (!session) {
    return (
      <html lang="en">
        <head>
          <meta httpEquiv="refresh" content="0;url=/auth" />
        </head>
        <body style={{ backgroundColor: "#09090b", color: "#fff", fontFamily: "sans-serif", display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
          <p>Redirecting to login...</p>
          <script dangerouslySetInnerHTML={{ __html: 'window.location.replace("/auth");' }} />
        </body>
      </html>
    );
  }

  let decodedToken = { email: "" };
  if (session) {
    try {
      const parsed = JSON.parse(session);
      decodedToken.email = parsed.email || "";
    } catch (e) {
      decodedToken.email = session;
    }
  }

  let initialProjects = [];
  let initialSubscriptions = [];

  try {
    let projectsSnapshot;
    try {
      projectsSnapshot = await adminDb.collection("projects").orderBy("completedAt", "desc").get();
    } catch (e) {
      projectsSnapshot = await adminDb.collection("projects").get();
    }

    if (projectsSnapshot && projectsSnapshot.docs) {
      initialProjects = projectsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          completedAt: safeToIsoString(data.completedAt)
        };
      });
    }

    const subsSnapshot = await adminDb.collection("subscriptions").get();
    if (subsSnapshot && subsSnapshot.docs) {
      initialSubscriptions = subsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  } catch (error) {
    console.error("Firestore data fetch error:", error);
  }

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
              <Link href="/" className="text-foreground transition-colors hover:text-foreground/80">Overview</Link>
              <Link href="/projects" className="text-muted-foreground transition-colors hover:text-foreground">Projects Ledger</Link>
              <Link href="/subscriptions" className="text-muted-foreground transition-colors hover:text-foreground">Subscriptions</Link>
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

      <main className="max-w-6xl mx-auto px-6 py-10">
        <DashboardClient initialProjects={initialProjects} initialSubscriptions={initialSubscriptions} />
      </main>
    </div>
  );
}