"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DemoLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      // Demo credentials
      const email = "demo@example.com";
      const password = "password123";

      // Store in localStorage for client-side access
      localStorage.setItem('demoUserLoggedIn', 'true');
      localStorage.setItem('demoUserRole', 'admin');

      // Set cookies via API for server-side access
      await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: 'admin' }),
      });

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error("Demo login error:", err);
      setError("Failed to log in with demo account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 border-t pt-6">
      <p className="text-center text-sm text-muted-foreground mb-4">
        Want to try the app without creating an account?
      </p>
      <button
        onClick={handleDemoLogin}
        className="w-full bg-secondary text-secondary-foreground py-3 rounded-lg hover:bg-secondary/90 transition-colors flex items-center justify-center font-medium"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Logging in...
          </>
        ) : (
          "Try Demo Account"
        )}
      </button>
      {error && (
        <p className="text-destructive text-xs mt-2 text-center">{error}</p>
      )}
    </div>
  );
}