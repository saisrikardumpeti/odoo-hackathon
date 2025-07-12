

import type React from "react"

import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useQuestion } from "@/hooks/useQuestions"
import { useAnswers } from "@/hooks/useAnswers"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Eye, Check } from "lucide-react"
import VoteButtons from "@/components/questions/VoteButtons"
import { useCreateAnswer } from "@/hooks/useAnswers"
import { toast } from "sonner"

export default function QuestionDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [answerContent, setAnswerContent] = useState("")

  const { data: question, isLoading: questionLoading } = useQuestion(id!)
  const { data: answersData, isLoading: answersLoading } = useAnswers(id!)
  const createAnswerMutation = useCreateAnswer()

  const answers = answersData?.items || []

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!answerContent.trim()) return

    try {
      await createAnswerMutation.mutateAsync({
        questionId: id!,
        content: answerContent,
      })
      setAnswerContent("")
      toast("Answer submitted", {
        description: "Your answer has been posted successfully.",
      })
    } catch (error) {
      toast("Error", {
        description: "Failed to submit answer. Please try again.",
      })
    }
  }

  if (questionLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-3/4" />
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!question) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Question not found.</p>
          <Link to="/">
            <Button className="mt-4">Back to Home</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Question */}
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">{question.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              Asked by <span className="font-medium">{question.author.username}</span>
            </span>
            <span>{new Date(question.createdAt).toLocaleDateString()}</span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {question.views} views
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <VoteButtons type="question" id={question.id} votes={question.votes} userVote={question.userVote} />

            <div className="flex-1 space-y-4">
              <div className="prose max-w-none">
                <p>{question.description}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {question.tags?.map((tag) => (
                  <Badge key={tag.id} variant="secondary">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Answers Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {answers.length} Answer{answers.length !== 1 ? "s" : ""}
        </h2>
      </div>

      {/* Answers */}
      <div className="space-y-4">
        {answersLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))
        ) : answers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No answers yet. Be the first to answer!</p>
            </CardContent>
          </Card>
        ) : (
          answers.map((answer) => (
            <Card key={answer.id} className={answer.accepted ? "border-green-200 bg-green-50" : ""}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <VoteButtons type="answer" id={answer.id} votes={answer.votes} userVote={answer.userVote} />

                  <div className="flex-1 space-y-3">
                    {answer.accepted && (
                      <div className="flex items-center gap-2 text-green-600">
                        <Check className="h-4 w-4" />
                        <span className="text-sm font-medium">Accepted Answer</span>
                      </div>
                    )}

                    <div className="prose max-w-none">
                      <p>{answer.content}</p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div>
                        answered by <span className="font-medium">{answer.author.username}</span>{" "}
                        {new Date(answer.createdAt).toLocaleDateString()}
                      </div>

                      {user?.id === question.author.id && !answer.accepted && (
                        <Button size="sm" variant="outline">
                          Accept Answer
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Answer Form */}
      {user ? (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Your Answer</h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <Textarea
                placeholder="Write your answer here..."
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                rows={6}
                required
              />
              <Button type="submit" disabled={createAnswerMutation.isPending || !answerContent.trim()}>
                {createAnswerMutation.isPending ? "Submitting..." : "Submit Answer"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">You need to be logged in to post an answer.</p>
            <Link to="/login">
              <Button>Login to Answer</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
