import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

interface Answer {
  id: string
  content: string
  votes: number
  userVote?: "up" | "down" | null
  accepted: boolean
  author: {
    id: string
    username: string
    avatar: string
  }
  createdAt: string
  updatedAt: string
}

interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

export function useAnswers(questionId: string) {
  return useQuery({
    queryKey: ["answers", questionId],
    queryFn: async () => {
      const response = await api.get(`/questions/${questionId}/answers`)
      return response.data as PaginatedResponse<Answer>
    },
    enabled: !!questionId,
  })
}

export function useCreateAnswer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { questionId: string; content: string }) => {
      const response = await api.post(`/questions/${data.questionId}/answers`, {
        content: data.content,
      })
      return response.data as Answer
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["answers", variables.questionId] })
      queryClient.invalidateQueries({ queryKey: ["questions", variables.questionId] })
    },
  })
}
