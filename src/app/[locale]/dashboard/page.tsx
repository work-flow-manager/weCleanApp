"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";

export default function LocalizedDashboardPage() {
  const t = useTranslations();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  
  // Redirect to role-specific dashboard
  useEffect(() => {
    if (!isLoading && user) {
      router.push(`/dashboard/${user.role}`);
    } else if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>{t("common.loading")}</p>
    </div>
  );
}