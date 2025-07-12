import { db } from '../db';
import { users, questions, answers } from '../db/schema';
import { eq, desc, sql } from 'drizzle-orm';

export class UserService {
  async findById(id: string) {
    const [user] = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      bio: users.bio,
      reputation: users.reputation,
      role: users.role,
      createdAt: users.createdAt,
      questionCount: sql<number>`
        (SELECT COUNT(*) FROM ${questions} WHERE user_id = ${users.id})
      `.as('question_count'),
      answerCount: sql<number>`
        (SELECT COUNT(*) FROM ${answers} WHERE user_id = ${users.id})
      `.as('answer_count'),
    })
    .from(users)
    .where(eq(users.id, id));
    
    return user;
  }
  
  async findByUsername(username: string) {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.name, username));
    
    return user;
  }
  
  async updateProfile(id: string, data: {
    name?: string;
    bio?: string;
  }) {
    const [updatedUser] = await db.update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }
  
  async getTopUsers(limit = 10) {
    return await db.select({
      id: users.id,
      name: users.name,
      image: users.image,
      reputation: users.reputation,
      questionCount: sql<number>`
        (SELECT COUNT(*) FROM ${questions} WHERE user_id = ${users.id})
      `.as('question_count'),
      answerCount: sql<number>`
        (SELECT COUNT(*) FROM ${answers} WHERE user_id = ${users.id})
      `.as('answer_count'),
    })
    .from(users)
    .orderBy(desc(users.reputation))
    .limit(limit);
  }
}

export const userService = new UserService();