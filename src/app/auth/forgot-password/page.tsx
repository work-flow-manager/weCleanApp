"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2, CheckCircle2, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)

  const validateForm = () => {
    let isValid = true
    
    // Email validation
    if (!email) {
      setEmailError("Email is required")
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address")
      isValid = false
    } else {
      setEmailError(null)
    }
    
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reset errors
    setError(null)
    
    // Validate form
    if (!validateForm()) {
      return
    }
    
    setLoading(true)

    try {
      // Send password reset email with Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      
      if (error) throw error
      
      // Show success message
      setSuccess(true)
    } catch (err: any) {
      console.error("Password reset error:", err)
      setError(err.message || "Failed to send password reset email. Please try again.")
      setSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Reset your password</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {success ? (
        <div className="space-y-6">
          <div className="bg-green-500/10 text-green-500 p-4 rounded-md flex items-start">
            <CheckCircle2 className="h-5 w-5 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium">Check your email</h3>
              <p className="text-sm mt-1">
                We've sent a password reset link to <strong>{email}</strong>. 
                Please check your inbox and follow the instructions to reset your password.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col space-y-3">
            <Link 
              href="/auth/login"
              className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary-600 transition-colors text-center"
            >
              Return to login
            </Link>
            
            <button
              onClick={() => setSuccess(false)}
              className="text-sm text-primary hover:underline flex items-center justify-center"
            >
              <ArrowLeft className="h-3 w-3 mr-1" />
              Try another email
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setEmailError(null)
              }}
              className={`glass-input w-full ${emailError ? 'border-destructive' : ''}`}
              placeholder="you@example.com"
              required
            />
            {emailError && (
              <p className="text-destructive text-xs mt-1">{emailError}</p>
            )}
          </div>
          
          <div>
            <button
              type="submit"
              className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary-600 transition-colors flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending reset link...
                </>
              ) : (
                "Send reset link"
              )}
            </button>
          </div>
        </form>
      )}

      <div className="text-center">
        <p className="text-sm">
          Remember your password?{" "}
          <Link href="/auth/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}