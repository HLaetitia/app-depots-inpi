"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("uf-user");
    if (!user) {
      router.replace("/login");
    } else {
      setIsReady(true);
    }
  }, [router]);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-uf-bg dark:bg-uf-bg-dark">
        <div className="w-8 h-8 border-4 border-uf-button border-t-uf-button-hover rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-uf-bg dark:bg-uf-bg-dark">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
