

import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/hooks/useNotifications"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Bell, Check, CheckCheck } from "lucide-react"
import { toast } from "sonner"

export default function Notifications() {
  const { data: notifications, isLoading } = useNotifications()
  const markReadMutation = useMarkNotificationRead()
  const markAllReadMutation = useMarkAllNotificationsRead()

  const unreadCount = notifications?.filter((n) => !n.read).length || 0

  const handleMarkRead = async (id: string) => {
    try {
      await markReadMutation.mutateAsync(id)
    } catch (error) {
      toast("Error",{
        description: "Failed to mark notification as read.",
      })
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllReadMutation.mutateAsync()
      toast("Success", {
        description: "All notifications marked as read.",
      })
    } catch (error) {
      toast("Error",{
        description: "Failed to mark all notifications as read.",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-muted-foreground">
              You have {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {unreadCount > 0 && (
          <Button onClick={handleMarkAllRead} disabled={markAllReadMutation.isPending} variant="outline">
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark All Read
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {!notifications || notifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No notifications yet.</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card key={notification.id} className={`${!notification.read ? "border-primary/50 bg-primary/5" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <>
                        <Badge variant="secondary">New</Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMarkRead(notification.id)}
                          disabled={markReadMutation.isPending}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
