"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ClientRedirect({ to = "/auth" }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(to);
  }, [router, to]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground text-sm font-medium">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span>Redirecting...</span>
      </div>
    </div>
  );
}
