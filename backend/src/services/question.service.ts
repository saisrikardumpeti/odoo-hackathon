import { db } from '../db';
import { questions, questionTags, tags, users, votes } from '../db/schema';
import { eq, desc, sql, and, like } from 'drizzle-orm';
import { createQuestionSchema, updateQuestionSchema } from '../lib/validation/question.schema';
import { slugify } from '../lib/utils/slugify';
import { notificationService } from './notification.service';
import z from 'zod';

export class QuestionService {
  async create(userId: string, data: z.infer<typeof createQuestionSchema>) {
    const slug = slugify(data.title);
    
    return await db.transaction(async (tx) => {
      // Create question
      const [question] = await tx.insert(questions).values({
        userId,
        title: data.title,
        description: data.description,
        slug,
      }).returning();

      // Add tags
      for (const tagName of data.tags) {
        // Get or create tag
        let [tag] = await tx.select().from(tags).where(eq(tags.name, tagName));
        
        if (!tag) {
          [tag] = await tx.insert(tags).values({
            name: tagName,
          }).returning();
        }

        // Link tag to question
        await tx.insert(questionTags).values({
          questionId: question.id,
          tagId: tag.id,
        });
      }

      // Check for mentions and create notifications
      const mentions = this.extractMentions(data.description);
      for (const username of mentions) {
        await notificationService.createMentionNotification(username, userId, question.id, 'question');
      }

      return question;
    });
  }

  async findAll(params: {
    page: number;
    limit: number;
    tag?: string;
    search?: string;
    sort: 'newest' | 'votes' | 'unanswered';
  }) {
    const offset = (params.page - 1) * params.limit;

    let query = db.select({
      question: questions,
      user: users,
      voteCount: sql<number>`
        COALESCE(
          (SELECT COUNT(*) 
           FROM ${votes} 
           WHERE ${votes.voteableId} = ${questions.id} 
           AND ${votes.voteableType} = 'question' 
           AND ${votes.voteType} = 'upvote'), 0
        ) - 
        COALESCE(
          (SELECT COUNT(*) 
           FROM ${votes} 
           WHERE ${votes.voteableId} = ${questions.id} 
           AND ${votes.voteableType} = 'question' 
           AND ${votes.voteType} = 'downvote'), 0
        )
      `.as('vote_count'),
      answerCount: sql<number>`
        (SELECT COUNT(*) FROM answers WHERE question_id = ${questions.id})
      `.as('answer_count'),
    })
    .from(questions)
    .leftJoin(users, eq(questions.userId, users.id));

    // Apply filters
    const conditions = [];
    if (params.search) {
      conditions.push(
        sql`${questions.title} ILIKE ${`%${params.search}%`} OR ${questions.description} ILIKE ${`%${params.search}%`}`
      );
    }

    if (params.tag) {
      query = query.where(
        sql`EXISTS (
          SELECT 1 FROM ${questionTags} qt
          JOIN ${tags} t ON qt.tag_id = t.id
          WHERE qt.question_id = ${questions.id}
          AND t.name = ${params.tag}
        )`
      );
    }

    // Apply sorting
    switch (params.sort) {
      case 'newest':
        query = query.orderBy(desc(questions.createdAt));
        break;
      case 'votes':
        query = query.orderBy(desc(sql`vote_count`));
        break;
      case 'unanswered':
        query = query.where(sql`answer_count = 0`);
        query = query.orderBy(desc(questions.createdAt));
        break;
    }

    const results = await query.limit(params.limit).offset(offset);

    // Get tags for each question
    const questionsWithTags = await Promise.all(
      results.map(async (result) => {
        const questionTag = await db.select({
          name: tags.name,
        })
        .from(tags)
        .innerJoin(questionTags, eq(tags.id, questionTags.tagId))
        .where(eq(questionTags.questionId, result.question.id));

        return {
          ...result.question,
          user: result.user,
          tags: questionTags.map(t => t.name),
          voteCount: result.voteCount,
          answerCount: result.answerCount,
        };
      })
    );

    return questionsWithTags;
  }

  async findById(id: string) {
    const [result] = await db.select({
      question: questions,
      user: users,
    })
    .from(questions)
    .leftJoin(users, eq(questions.userId, users.id))
    .where(eq(questions.id, id));

    if (!result) {
      return null;
    }

    // Increment view count
    await db.update(questions)
      .set({ viewCount: sql`${questions.viewCount} + 1` })
      .where(eq(questions.id, id));

    // Get tags
    const questionTag = await db.select({
      name: tags.name,
    })
    .from(tags)
    .innerJoin(questionTags, eq(tags.id, questionTags.tagId))
    .where(eq(questionTags.questionId, id));

    return {
      ...result.question,
      user: result.user,
      tags: questionTags.map(t => t.name),
    };
  }

  async update(id: string, userId: string, data: z.infer<typeof updateQuestionSchema>) {
    const [question] = await db.select()
      .from(questions)
      .where(and(eq(questions.id, id), eq(questions.userId, userId)));

    if (!question) {
      throw new Error('Question not found or unauthorized');
    }

    return await db.update(questions)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(questions.id, id))
      .returning();
  }

  async delete(id: string, userId: string) {
    const [question] = await db.select()
      .from(questions)
      .where(and(eq(questions.id, id), eq(questions.userId, userId)));

    if (!question) {
      throw new Error('Question not found or unauthorized');
    }

    await db.delete(questions).where(eq(questions.id, id));
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

export const questionService = new QuestionService();