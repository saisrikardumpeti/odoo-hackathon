import { db } from '../db';
import { tags, questionTags } from '../db/schema';
import { eq, like, sql, desc } from 'drizzle-orm';

export class TagService {
  async search(query?: string, limit = 10) {
    let baseQuery = db.select({
      id: tags.id,
      name: tags.name,
      description: tags.description,
      questionCount: sql<number>`
        (SELECT COUNT(*) FROM ${questionTags} WHERE tag_id = ${tags.id})
      `.as('question_count'),
    }).from(tags);
    
    if (query) {
      baseQuery = baseQuery.where(like(tags.name, `%${query}%`));
    }
    
    return await baseQuery
      .orderBy(desc(sql`question_count`))
      .limit(limit);
  }
  
  async getPopular(limit = 20) {
    return await db.select({
      id: tags.id,
      name: tags.name,
      description: tags.description,
      questionCount: sql<number>`
        (SELECT COUNT(*) FROM ${questionTags} WHERE tag_id = ${tags.id})
      `.as('question_count'),
    })
    .from(tags)
    .orderBy(desc(sql`question_count`))
    .limit(limit);
  }
  
  async findByName(name: string) {
    const [tag] = await db.select({
      id: tags.id,
      name: tags.name,
      description: tags.description,
      questionCount: sql<number>`
        (SELECT COUNT(*) FROM ${questionTags} WHERE tag_id = ${tags.id})
      `.as('question_count'),
    })
    .from(tags)
    .where(eq(tags.name, name));
    
    return tag;
  }
  
  async create(name: string, description?: string) {
    const [tag] = await db.insert(tags).values({
      name,
      description,
    }).returning();
    
    return tag;
  }
}

export const tagService = new TagService();