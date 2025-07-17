"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Phone, Globe, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/client"

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [language, setLanguage] = useState("en")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient()
      
      // Get user
      const { data: { user: userData }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !userData) {
        router.push("/auth/login")
        return
      }
      
      setUser(userData)
      
      // Get profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.id)
        .single()
      
      if (profileError) {
        console.error("Error fetching profile:", profileError)
        setError("Failed to load profile data")
      } else if (profileData) {
        setProfile(profileData)
        setFullName(profileData.full_name || "")
        setLanguage(profileData.language || "en")
      }
      
      setLoading(false)
    }
    
    fetchProfile()
  }, [router])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage("")
    setError("")
    
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          language,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
      
      if (error) {
        throw error
      }
      
      setMessage("Profile updated successfully")
    } catch (err: any) {
      console.error("Error updating profile:", err)
      setError(err.message || "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card glass className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>
            Update your personal information and preferences
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleUpdateProfile}>
          <CardContent className="space-y-6">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive">
                {error}
              </div>
            )}
            {message && (
              <div className="rounded-md bg-green-50 p-3 text-center text-sm text-green-800">
                {message}
              </div>
            )}
            
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="h-24 w-24 overflow-hidden rounded-full bg-primary/20 text-center">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <User className="h-12 w-12 text-primary" />
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="absolute bottom-0 right-0 rounded-full"
                >
                  Edit
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <div className="glass-input flex items-center">
                <Mail className="ml-2 h-4 w-4 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  className="flex-1 bg-transparent px-3 py-2 text-sm outline-none"
                  value={user?.email || ""}
                  disabled
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium">
                Full Name
              </label>
              <div className="glass-input flex items-center">
                <User className="ml-2 h-4 w-4 text-muted-foreground" />
                <input
                  id="fullName"
                  type="text"
                  className="flex-1 bg-transparent px-3 py-2 text-sm outline-none"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="language" className="text-sm font-medium">
                Language
              </label>
              <div className="glass-input flex items-center">
                <Globe className="ml-2 h-4 w-4 text-muted-foreground" />
                <select
                  id="language"
                  className="flex-1 bg-transparent px-3 py-2 text-sm outline-none"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="pt">Português</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">
                Role
              </label>
              <div className="glass-input flex items-center">
                <User className="ml-2 h-4 w-4 text-muted-foreground" />
                <input
                  id="role"
                  type="text"
                  className="flex-1 bg-transparent px-3 py-2 text-sm outline-none"
                  value={profile?.role || ""}
                  disabled
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Role cannot be changed
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="ml-auto" disabled={saving}>
              {saving ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}