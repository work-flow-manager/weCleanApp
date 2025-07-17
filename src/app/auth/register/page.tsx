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
      <div>
        <h1 className="text-2xl font-semibold">Create an account</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Enter your details to create a new account
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-500/10 text-green-500 p-3 rounded-md text-sm flex items-center">
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Account created successfully! Redirecting to dashboard...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setNameError(null)
            }}
            className={`glass-input w-full ${nameError ? 'border-destructive' : ''}`}
            placeholder="John Doe"
            required
          />
          {nameError && (
            <p className="text-destructive text-xs mt-1">{nameError}</p>
          )}
        </div>
        
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
          <label htmlFor="role" className="block text-sm font-medium mb-1">
            I am a
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="glass-input w-full"
          >
            <option value="customer">Customer looking for cleaning services</option>
            <option value="team">Cleaning professional</option>
            <option value="manager">Cleaning business manager</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
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
              className={`glass-input w-full pr-10 ${passwordError ? 'border-destructive' : ''}`}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          
          {password && (
            <div className="mt-2">
              <div className="flex justify-between items-center mb-1">
                <div className="text-xs">Password strength: {getPasswordStrengthLabel()}</div>
                <div className="text-xs">{passwordStrength}/5</div>
              </div>
              <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getPasswordStrengthColor()}`} 
                  style={{ width: `${(passwordStrength / 5) * 100}%` }}
                ></div>
              </div>
              
              <ul className="mt-2 space-y-1 text-xs">
                <li className="flex items-center">
                  {hasMinLength ? (
                    <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <XCircle className="h-3 w-3 text-muted-foreground mr-1" />
                  )}
                  At least 8 characters
                </li>
                <li className="flex items-center">
                  {hasUpperCase ? (
                    <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <XCircle className="h-3 w-3 text-muted-foreground mr-1" />
                  )}
                  At least one uppercase letter
                </li>
                <li className="flex items-center">
                  {hasLowerCase ? (
                    <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <XCircle className="h-3 w-3 text-muted-foreground mr-1" />
                  )}
                  At least one lowercase letter
                </li>
                <li className="flex items-center">
                  {hasNumber ? (
                    <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <XCircle className="h-3 w-3 text-muted-foreground mr-1" />
                  )}
                  At least one number
                </li>
                <li className="flex items-center">
                  {hasSpecialChar ? (
                    <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <XCircle className="h-3 w-3 text-muted-foreground mr-1" />
                  )}
                  At least one special character
                </li>
              </ul>
            </div>
          )}
          
          {passwordError && (
            <p className="text-destructive text-xs mt-1">{passwordError}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
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
              className={`glass-input w-full pr-10 ${confirmPasswordError ? 'border-destructive' : ''}`}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
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
            className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary-600 transition-colors flex items-center justify-center"
            disabled={loading || success}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : success ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Account created!
              </>
            ) : (
              "Create account"
            )}
          </button>
        </div>
      </form>

      <div className="text-center">
        <p className="text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}