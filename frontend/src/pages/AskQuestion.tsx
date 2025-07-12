import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { useCreateQuestion } from "@/hooks/useQuestions"
import { toast } from "sonner"

export default function AskQuestion() {
  const navigate = useNavigate()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")

  const createQuestionMutation = useCreateQuestion()

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      const tag = tagInput.trim().toLowerCase()
      if (tag && !tags.includes(tag) && tags.length < 5) {
        setTags([...tags, tag])
        setTagInput("")
      }
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !description.trim()) {
      toast("Error", {
        description: "Please fill in all required fields.",
      })
      return
    }

    try {
      const question = await createQuestionMutation.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        tags,
      })

      toast("Question posted", {
        description: "Your question has been posted successfully.",
      })

      navigate(`/questions/${question.id}`)
    } catch (error) {
      toast("Error",{
        description: "Failed to post question. Please try again.",
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Ask a Question</CardTitle>
          <p className="text-muted-foreground">Be specific and imagine you're asking a question to another person.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="What's your programming question? Be specific."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">
                Be specific and imagine you're asking a question to another person.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Provide all the details someone would need to answer your question..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={8}
                required
              />
              <p className="text-sm text-muted-foreground">
                Include all the information someone would need to answer your question.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="Add up to 5 tags (press Enter or comma to add)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                disabled={tags.length >= 5}
              />
              <p className="text-sm text-muted-foreground">
                Add tags to describe what your question is about. Press Enter or comma to add a tag.
              </p>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={createQuestionMutation.isPending}>
                {createQuestionMutation.isPending ? "Posting..." : "Post Question"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
