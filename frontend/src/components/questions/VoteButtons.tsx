

import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown } from "lucide-react"
import { useVote } from "@/hooks/useVote"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

interface VoteButtonsProps {
  type: "question" | "answer"
  id: string
  votes: number
  userVote?: "up" | "down" | null
}

export default function VoteButtons({ type, id, votes, userVote }: VoteButtonsProps) {
  const { user } = useAuth()
  const voteMutation = useVote()

  const handleVote = async (voteType: "up" | "down") => {
    if (!user) {
      toast("Login required", {
        description: "You need to be logged in to vote.",
      })
      return
    }

    try {
      await voteMutation.mutateAsync({
        type,
        id,
        vote: userVote === voteType ? null : voteType,
      })
    } catch (error) {
      toast("Error", {
        description: "Failed to submit vote. Please try again.",
      })
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote("up")}
        className={`p-1 h-8 w-8 ${userVote === "up" ? "text-green-600 bg-green-50" : ""}`}
        disabled={voteMutation.isPending}
      >
        <ChevronUp className="h-5 w-5" />
      </Button>

      <span
        className={`text-lg font-semibold ${
          votes > 0 ? "text-green-600" : votes < 0 ? "text-red-600" : "text-muted-foreground"
        }`}
      >
        {votes}
      </span>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote("down")}
        className={`p-1 h-8 w-8 ${userVote === "down" ? "text-red-600 bg-red-50" : ""}`}
        disabled={voteMutation.isPending}
      >
        <ChevronDown className="h-5 w-5" />
      </Button>
    </div>
  )
}
