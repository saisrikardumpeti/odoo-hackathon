import { z } from 'zod';

export const createQuestionSchema = z.object({
  title: z.string()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string()
    .min(20, 'Description must be at least 20 characters'),
  tags: z.array(z.string())
    .min(1, 'At least one tag is required')
    .max(5, 'Maximum 5 tags allowed'),
});

export const updateQuestionSchema = createQuestionSchema.partial();

export const questionQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  tag: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(['newest', 'votes', 'unanswered']).default('newest'),
});