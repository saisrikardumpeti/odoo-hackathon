import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"

interface Tag {
  id: string
  name: string
  description?: string
  questionCount: number
}

export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const response = await api.get("/tags")
      return response.data as Tag[]
    },
  })
}
