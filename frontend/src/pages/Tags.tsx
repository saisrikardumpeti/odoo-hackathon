

import { useState } from "react"
import { useTags } from "@/hooks/useTags"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Search } from "lucide-react"

export default function Tags() {
  const [search, setSearch] = useState("")
  const { data: tags, isLoading } = useTags()

  const filteredTags = tags?.filter((tag) => tag.name.toLowerCase().includes(search.toLowerCase())) || []

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-20 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Tags</h1>
        <p className="text-muted-foreground">Browse questions by tags to find topics you're interested in.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTags.map((tag) => (
          <Card key={tag.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary" className="text-sm">
                  {tag.name}
                </Badge>
                <span className="text-sm text-muted-foreground">{tag.questionCount} questions</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {tag.description || `Questions tagged with ${tag.name}`}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTags.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              {search ? "No tags found matching your search." : "No tags available."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
