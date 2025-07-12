import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

interface Question {
  id: string
  title: string
  description: string
  votes: number
  userVote?: "up" | "down" | null
  views: number
  answerCount: number
  accepted: boolean
  author: {
    id: string
    username: string
    avatar: string
  }
  tags: Array<{
    id: string
    name: string
  }>
  createdAt: string
  updatedAt: string
}

interface QuestionsParams {
  search?: string
  sortBy?: string
  tag?: string
  page?: number
  limit?: number
}

interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

export function useQuestions(params: QuestionsParams = {}) {
  return useQuery({
    queryKey: ["questions", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams()

      if (params.search) searchParams.set("search", params.search)
      if (params.sortBy) searchParams.set("sortBy", params.sortBy)
      if (params.tag) searchParams.set("tag", params.tag)
      if (params.page) searchParams.set("page", params.page.toString())
      if (params.limit) searchParams.set("limit", params.limit.toString())

      const response = await api.get(`/questions?${searchParams.toString()}`)
      return response.data as PaginatedResponse<Question>
    },
  })
}

export function useQuestion(id: string) {
  return useQuery({
    queryKey: ["questions", id],
    queryFn: async () => {
      const response = await api.get(`/questions/${id}`)
      return response.data as Question
    },
    enabled: !!id,
  })
}

export function useCreateQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { title: string; description: string; tags: string[] }) => {
      const response = await api.post("/questions", data)
      return response.data as Question
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] })
    },
  })
}
