

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Github } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

export default function Login() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate("/")
    }
  }, [user, navigate])

  const handleLogin = () => {
    window.location.href = "http://localhost:3000/api/auth/github"
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to StackIt</CardTitle>
          <p className="text-muted-foreground">Sign in to ask questions, provide answers, and join our community.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleLogin} className="w-full" size="lg">
            <Github className="mr-2 h-5 w-5" />
            Continue with GitHub
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            By signing in, you agree to our terms of service and privacy policy.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
