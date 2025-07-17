"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle } from "lucide-react"
import { UserRole } from "@/lib/supabase"

export default function RegisterPage() {
  const router = useRouter()
  const { signUp } = useAuth()
  
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<UserRole>("customer")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // Form validation errors
  const [nameError, setNameError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null)

  // Password strength indicators
  const hasMinLength = password.length >= 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  
  const passwordStrength = [
    hasMinLength,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
    hasSpecialChar
  ].filter(Boolean).length

  const getPasswordStrengthLabel = () => {
    if (passwordStrength <= 2) return "Weak"
    if (passwordStrength <= 4) return "Medium"
    return "Strong"
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-destructive"
    if (passwordStrength <= 4) return "bg-amber-500"
    return "bg-green-500"
  }

  const validateForm = () => {
    let isValid = true
    
    // Name validation
    if (!name.trim()) {
      setNameError("Full name is required")
      isValid = false
    } else if (name.trim().length < 2) {
      setNameError("Name is too short")
      isValid = false
    } else {
      setNameError(null)
    }
    
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
    
    // Password validation
    if (!password) {
      setPasswordError("Password is required")
      isValid = false
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      isValid = false
    } else if (passwordStrength < 3) {
      setPasswordError("Password is too weak")
      isValid = false
    } else {
      setPasswordError(null)
    }
    
    // Confirm password validation
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match")
      isValid = false
    } else {
      setConfirmPasswordError(null)
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
      // Sign up with Supabase
      await signUp(email, password, name, role)
      
      // Show success message
      setSuccess(true)
      
      // Redirect to dashboard after a delay
      setTimeout(() => {
        router.push("/dashboard/" + role)
      }, 2000)
    } catch (err: any) {
      console.error("Registration error:", err)
      setError(err.message || "Failed to create account. Please try again.")
      setSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Enter your details to create a new account
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-500/10 text-green-500 p-4 rounded-lg text-sm flex items-center">
          <CheckCircle2 className="h-5 w-5 mr-2" />
          <div>
            <p className="font-medium">Account created successfully!</p>
            <p>Redirecting to dashboard...</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Full Name
          </label>
          <div className="relative">
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setNameError(null)
              }}
              className={`w-full px-4 py-3 rounded-lg border ${nameError ? 'border-destructive' : 'border-input'} bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
              placeholder="John Doe"
              required
            />
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-transparent">.</span>
            </div>
          </div>
          {nameError && (
            <p className="text-destructive text-xs mt-1">{nameError}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setEmailError(null)
              }}
              className={`w-full px-4 py-3 rounded-lg border ${emailError ? 'border-destructive' : 'border-input'} bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
              placeholder="you@example.com"
              required
            />
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-transparent">.</span>
            </div>
          </div>
          {emailError && (
            <p className="text-destructive text-xs mt-1">{emailError}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="role" className="block text-sm font-medium mb-2">
            I am a
          </label>
          <div className="relative">
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
            >
              <option value="customer">Customer looking for cleaning services</option>
              <option value="team">Cleaning professional</option>
              <option value="manager">Cleaning business manager</option>
            </select>
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-transparent">.</span>
            </div>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setPasswordError(null)
              }}
              className={`w-full px-4 py-3 rounded-lg border ${passwordError ? 'border-destructive' : 'border-input'} bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
              required
            />
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-transparent">.</span>
            </div>
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          
          {password && (
            <div className="mt-3 p-3 bg-background border border-input rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium">Password strength: {getPasswordStrengthLabel()}</div>
                <div className="text-sm">{passwordStrength}/5</div>
              </div>
              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden mb-3">
                <div 
                  className={`h-full ${getPasswordStrengthColor()}`} 
                  style={{ width: `${(passwordStrength / 5) * 100}%` }}
                ></div>
              </div>
              
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <li className="flex items-center">
                  {hasMinLength ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground mr-2 flex-shrink-0" />
                  )}
                  <span className={hasMinLength ? "" : "text-muted-foreground"}>At least 8 characters</span>
                </li>
                <li className="flex items-center">
                  {hasUpperCase ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground mr-2 flex-shrink-0" />
                  )}
                  <span className={hasUpperCase ? "" : "text-muted-foreground"}>Uppercase letter</span>
                </li>
                <li className="flex items-center">
                  {hasLowerCase ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground mr-2 flex-shrink-0" />
                  )}
                  <span className={hasLowerCase ? "" : "text-muted-foreground"}>Lowercase letter</span>
                </li>
                <li className="flex items-center">
                  {hasNumber ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground mr-2 flex-shrink-0" />
                  )}
                  <span className={hasNumber ? "" : "text-muted-foreground"}>Number</span>
                </li>
                <li className="flex items-center">
                  {hasSpecialChar ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground mr-2 flex-shrink-0" />
                  )}
                  <span className={hasSpecialChar ? "" : "text-muted-foreground"}>Special character</span>
                </li>
              </ul>
            </div>
          )}
          
          {passwordError && (
            <p className="text-destructive text-xs mt-1">{passwordError}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                setConfirmPasswordError(null)
              }}
              className={`w-full px-4 py-3 rounded-lg border ${confirmPasswordError ? 'border-destructive' : 'border-input'} bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
              required
            />
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-transparent">.</span>
            </div>
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {confirmPasswordError && (
            <p className="text-destructive text-xs mt-1">{confirmPasswordError}</p>
          )}
        </div>
        
        <div>
          <button
            type="submit"
            className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center font-medium shadow-sm"
            disabled={loading || success}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating account...
              </>
            ) : success ? (
              <>
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Account created!
              </>
            ) : (
              "Create account"
            )}
          </button>
        </div>
      </form>

      <div className="text-center pt-4">
        <p className="text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}