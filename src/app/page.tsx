"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("uf-user");
    if (user) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-uf-bg dark:bg-uf-bg-dark">
      <div className="w-8 h-8 border-4 border-uf-button border-t-uf-button-hover rounded-full animate-spin" />
    </div>
  );
}
