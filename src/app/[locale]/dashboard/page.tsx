"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";

export default function LocalizedDashboardPage() {
  const t = useTranslations();
  const router = useRouter();
  const { user, loading } = useAuth();
  
  // Redirect to role-specific dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push(`/dashboard/${user.role}`);
    } else if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>{t("common.loading")}</p>
    </div>
  );
}