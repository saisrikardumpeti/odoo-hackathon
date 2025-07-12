import { db } from '../db';
import { notifications, users } from '../db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export class NotificationService {
  async create(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    relatedEntityId?: string;
    relatedEntityType?: string;
  }) {
    const [notification] = await db.insert(notifications).values(data).returning();
    return notification;
  }

  async createMentionNotification(
    username: string,
    mentionedByUserId: string,
    entityId: string,
    entityType: string
  ) {
    // Find user by username
    const [user] = await db.select()
      .from(users)
      .where(eq(users.name, username));

    if (!user || user.id === mentionedByUserId) {
      return;
    }

    const [mentionedBy] = await db.select()
      .from(users)
      .where(eq(users.id, mentionedByUserId));

    await this.create({
      userId: user.id,
      type: 'mention',
      title: 'You were mentioned',
      message: `${mentionedBy.name} mentioned you in a ${entityType}`,
      relatedEntityId: entityId,
      relatedEntityType: entityType,
    });
  }

  async getUserNotifications(userId: string, limit = 20) {
    return await db.select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async getUnreadCount(userId: string) {
    const [result] = await db.select({
      count: sql<number>`COUNT(*)`,
    })
    .from(notifications)
    .where(and(
      eq(notifications.userId, userId),
      eq(notifications.isRead, false)
    ));

    return result.count;
  }

  async markAsRead(notificationId: string, userId: string) {
    return await db.update(notifications)
      .set({ isRead: true })
      .where(and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      ))
      .returning();
  }

  async markAllAsRead(userId: string) {
    return await db.update(notifications)
      .set({ isRead: true })
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ));
  }
}

export const notificationService = new NotificationService();