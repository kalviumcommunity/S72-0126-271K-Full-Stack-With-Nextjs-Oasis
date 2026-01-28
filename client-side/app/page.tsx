"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Root Page - Redirects to dashboard
 */
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard");
  }, [router]);

  return null;
}
