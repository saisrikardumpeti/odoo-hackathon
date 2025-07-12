

import { useState } from "react"
import { Link } from "react-router-dom"
import { useQuestions } from "@/hooks/useQuestions"
import { useTags } from "@/hooks/useTags"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, MessageSquare, Eye } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Pagination from "@/components/ui/Pagination"
import VoteButtons from "@/components/questions/VoteButtons"

export default function Home() {
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [tagFilter, setTagFilter] = useState("all") // Updated default value to 'all'
  const [page, setPage] = useState(1)

  const { data: questionsData, isLoading: questionsLoading } = useQuestions({
    search,
    sortBy,
    tag: tagFilter,
    page,
    limit: 10,
  })

  const { data: tags } = useTags()

  const questions = questionsData?.items || []
  const totalPages = questionsData ? Math.ceil(questionsData.total / questionsData.limit) : 0

  if (questionsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">All Questions</h1>
        <Link to="/ask">
          <Button>Ask Question</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="votes">Most Votes</SelectItem>
            <SelectItem value="answers">Most Answers</SelectItem>
          </SelectContent>
        </Select>

        <Select value={tagFilter} onValueChange={setTagFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filter by tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {tags?.map((tag) => (
              <SelectItem key={tag.id} value={tag.name}>
                {tag.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No questions found.</p>
            </CardContent>
          </Card>
        ) : (
          questions.map((question) => (
            <Card key={question.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <VoteButtons type="question" id={question.id} votes={question.votes} userVote={question.userVote} />

                  <div className="flex-1 space-y-3">
                    <Link to={`/questions/${question.id}`} className="block hover:text-primary">
                      <h3 className="text-lg font-semibold">{question.title}</h3>
                    </Link>

                    <p className="text-muted-foreground line-clamp-2">{question.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {question.tags?.map((tag) => (
                        <Badge key={tag.id} variant="secondary">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          {question.answerCount} answers
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {question.views} views
                        </span>
                      </div>
                      <div>
                        asked by <span className="font-medium">{question.author.username}</span>{" "}
                        {new Date(question.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
    </div>
  )
}
