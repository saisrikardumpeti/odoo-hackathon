import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

interface VoteParams {
  type: "question" | "answer"
  id: string
  vote: "up" | "down" | null
}

export function useVote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ type, id, vote }: VoteParams) => {
      const endpoint = type === "question" ? `/questions/${id}/vote` : `/answers/${id}/vote`
      await api.post(endpoint, { vote })
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      if (variables.type === "question") {
        queryClient.invalidateQueries({ queryKey: ["questions"] })
        queryClient.invalidateQueries({ queryKey: ["questions", variables.id] })
      } else {
        queryClient.invalidateQueries({ queryKey: ["answers"] })
      }
    },
  })
}
