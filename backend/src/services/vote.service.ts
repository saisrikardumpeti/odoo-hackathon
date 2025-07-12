import { db } from '../db';
import { votes, questions, answers, users } from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { voteSchema } from '../lib/validation/common.schema';

export class VoteService {
  async vote(
    userId: string,
    voteableId: string,
    voteableType: 'question' | 'answer',
    voteType: 'upvote' | 'downvote'
  ) {
    return await db.transaction(async (tx) => {
      // Check if user already voted
      const [existingVote] = await tx.select()
        .from(votes)
        .where(and(
          eq(votes.userId, userId),
          eq(votes.voteableId, voteableId),
          eq(votes.voteableType, voteableType)
        ));

      if (existingVote) {
        if (existingVote.voteType === voteType) {
          // Remove vote if same type
          await tx.delete(votes)
            .where(and(
              eq(votes.userId, userId),
              eq(votes.voteableId, voteableId),
              eq(votes.voteableType, voteableType)
            ));
          return { action: 'removed' };
        } else {
          // Update vote type
          await tx.update(votes)
            .set({ voteType })
            .where(and(
              eq(votes.userId, userId),
              eq(votes.voteableId, voteableId),
              eq(votes.voteableType, voteableType)
            ));
          return { action: 'updated' };
        }
      } else {
        // Create new vote
        await tx.insert(votes).values({
          userId,
          voteableId,
          voteableType,
          voteType,
        });

        // Update user reputation
        const targetTable = voteableType === 'question' ? questions : answers;
        const [target] = await tx.select({ userId: targetTable.userId })
          .from(targetTable)
          .where(eq(targetTable.id, voteableId));

        if (target) {
          const reputationChange = voteType === 'upvote' ? 10 : -5;
          await tx.update(users)
            .set({ 
              reputation: sql`${users.reputation} + ${reputationChange}` 
            })
            .where(eq(users.id, target.userId));
        }

        return { action: 'created' };
      }
    });
  }

  async getUserVotes(userId: string, voteableIds: string[], voteableType: 'question' | 'answer') {
    const userVotes = await db.select()
      .from(votes)
      .where(and(
        eq(votes.userId, userId),
        eq(votes.voteableType, voteableType),
        sql`${votes.voteableId} = ANY(${voteableIds})`
      ));

    return userVotes.reduce((acc, vote) => {
      acc[vote.voteableId] = vote.voteType;
      return acc;
    }, {} as Record<string, 'upvote' | 'downvote'>);
  }
}

export const voteService = new VoteService();