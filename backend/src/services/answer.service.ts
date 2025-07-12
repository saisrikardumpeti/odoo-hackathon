import { db } from '../db';
import { answers, questions, users, votes } from '../db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { createAnswerSchema, updateAnswerSchema } from '../lib/validation/answer.schema';
import { notificationService } from './notification.service';
import z from 'zod';

export class AnswerService {
  async create(userId: string, data: z.infer<typeof createAnswerSchema>) {
    const [answer] = await db.insert(answers).values({
      userId,
      questionId: data.questionId,
      content: data.content,
    }).returning();

    // Get question details for notification
    const [question] = await db.select()
      .from(questions)
      .where(eq(questions.id, data.questionId));

    // Notify question owner
    if (question && question.userId !== userId) {
      await notificationService.create({
        userId: question.userId,
        type: 'answer_to_question',
        title: 'New answer to your question',
        message: `Someone answered your question: "${question.title}"`,
        relatedEntityId: answer.id,
        relatedEntityType: 'answer',
      });
    }

    // Check for mentions
    const mentions = this.extractMentions(data.content);
    for (const username of mentions) {
      await notificationService.createMentionNotification(username, userId, answer.id, 'answer');
    }

    return answer;
  }

  async findByQuestionId(questionId: string) {
    const results = await db.select({
      answer: answers,
      user: users,
      voteCount: sql<number>`
        COALESCE(
          (SELECT COUNT(*) 
           FROM ${votes} 
           WHERE ${votes.voteableId} = ${answers.id} 
           AND ${votes.voteableType} = 'answer' 
           AND ${votes.voteType} = 'upvote'), 0
        ) - 
        COALESCE(
          (SELECT COUNT(*) 
           FROM ${votes} 
           WHERE ${votes.voteableId} = ${answers.id} 
           AND ${votes.voteableType} = 'answer' 
           AND ${votes.voteType} = 'downvote'), 0
        )
      `.as('vote_count'),
    })
    .from(answers)
    .leftJoin(users, eq(answers.userId, users.id))
    .where(eq(answers.questionId, questionId))
    .orderBy(desc(answers.isAccepted), desc(sql`vote_count`), desc(answers.createdAt));

    return results.map(r => ({
      ...r.answer,
      user: r.user,
      voteCount: r.voteCount,
    }));
  }

  async update(id: string, userId: string, data: z.infer<typeof updateAnswerSchema>) {
    const [answer] = await db.select()
      .from(answers)
      .where(and(eq(answers.id, id), eq(answers.userId, userId)));

    if (!answer) {
      throw new Error('Answer not found or unauthorized');
    }

    return await db.update(answers)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(answers.id, id))
      .returning();
  }

  async acceptAnswer(answerId: string, userId: string) {
    // Get the answer and its question
    const [answer] = await db.select({
      answer: answers,
      question: questions,
    })
    .from(answers)
    .innerJoin(questions, eq(answers.questionId, questions.id))
    .where(eq(answers.id, answerId));

    if (!answer) {
      throw new Error('Answer not found');
    }

    // Check if user owns the question
    if (answer.question.userId !== userId) {
      throw new Error('Only question owner can accept answers');
    }

    return await db.transaction(async (tx) => {
      // Unaccept any previously accepted answer
      await tx.update(answers)
        .set({ isAccepted: false })
        .where(and(
          eq(answers.questionId, answer.question.id),
          eq(answers.isAccepted, true)
        ));

      // Accept the new answer
      const [updatedAnswer] = await tx.update(answers)
        .set({ isAccepted: true })
        .where(eq(answers.id, answerId))
        .returning();

      // Update question with accepted answer
      await tx.update(questions)
        .set({ acceptedAnswerId: answerId })
        .where(eq(questions.id, answer.question.id));

      // Notify answer owner
      if (answer.answer.userId !== userId) {
        await notificationService.create({
          userId: answer.answer.userId,
          type: 'accepted_answer',
          title: 'Your answer was accepted!',
          message: `Your answer to "${answer.question.title}" was accepted`,
          relatedEntityId: answerId,
          relatedEntityType: 'answer',
        });
      }

      return updatedAnswer;
    });
  }

  async delete(id: string, userId: string) {
    const [answer] = await db.select()
      .from(answers)
      .where(and(eq(answers.id, id), eq(answers.userId, userId)));

    if (!answer) {
      throw new Error('Answer not found or unauthorized');
    }

    await db.delete(answers).where(eq(answers.id, id));
  }

  private extractMentions(text: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }
    
    return [...new Set(mentions)];
  }
}

export const answerService = new AnswerService();