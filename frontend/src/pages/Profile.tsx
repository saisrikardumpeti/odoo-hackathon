

import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar } from "lucide-react"

export default function Profile() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.username} />
              <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user.username}</CardTitle>
              <p className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">{user.reputation || 0}</div>
              <div className="text-sm text-muted-foreground">Reputation</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">{user.questionCount || 0}</div>
              <div className="text-sm text-muted-foreground">Questions</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">{user.answerCount || 0}</div>
              <div className="text-sm text-muted-foreground">Answers</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No recent activity to display.</p>
        </CardContent>
      </Card>
    </div>
  )
}
