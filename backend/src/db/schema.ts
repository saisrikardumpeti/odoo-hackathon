import { pgTable, text, timestamp, varchar, integer, boolean, pgEnum, primaryKey } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const userRoleEnum = pgEnum('user_role', ['guest', 'user', 'moderator']);

export const answers = pgTable('answers', {
  id: varchar('id', { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: varchar('user_id', { length: 128 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  questionId: varchar('question_id', { length: 128 })
    .notNull()
    .references(() => questions.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  isAccepted: boolean('is_accepted').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const questions = pgTable('questions', {
  id: varchar('id', { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: varchar('user_id', { length: 128 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  slug: text('slug').notNull().unique(),
  acceptedAnswerId: varchar('accepted_answer_id', { length: 128 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const users = pgTable('users', {
  id: varchar('id', { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  email: text('email').notNull().unique(),
  name: text('name'),
  role: userRoleEnum('role').default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const voteTypeEnum = pgEnum('vote_type', ['upvote', 'downvote']);
export const voteableTypeEnum = pgEnum('voteable_type', ['question', 'answer']);

export const votes = pgTable('votes', {
  userId: varchar('user_id', { length: 128 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  voteableId: varchar('voteable_id', { length: 128 }).notNull(),
  voteableType: voteableTypeEnum('voteable_type').notNull(),
  voteType: voteTypeEnum('vote_type').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  primaryKey({ columns: [table.userId, table.voteableId, table.voteableType] }),
]);

export const tags = pgTable('tags', {
  id: varchar('id', { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const questionTags = pgTable('question_tags', {
  questionId: varchar('question_id', { length: 128 })
    .notNull()
    .references(() => questions.id, { onDelete: 'cascade' }),
  tagId: varchar('tag_id', { length: 128 })
    .notNull()
    .references(() => tags.id, { onDelete: 'cascade' }),
}, (table) => [
  primaryKey({ columns: [table.questionId, table.tagId] }),
]);

export const notificationTypeEnum = pgEnum('notification_type', [
  'answer_to_question',
  'comment_on_answer',
  'mention',
  'accepted_answer',
  'vote_milestone'
]);

export const notifications = pgTable('notifications', {
  id: varchar('id', { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: varchar('user_id', { length: 128 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: notificationTypeEnum('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  relatedEntityId: varchar('related_entity_id', { length: 128 }),
  relatedEntityType: text('related_entity_type'),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});