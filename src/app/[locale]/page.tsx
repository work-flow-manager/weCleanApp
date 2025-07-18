"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function LocalizedHomePage() {
  const t = useTranslations();
  const router = useRouter();
  
  // Redirect to dashboard
  useEffect(() => {
    router.push("/dashboard");
  }, [router]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>{t("common.loading")}</p>
    </div>
  );
}