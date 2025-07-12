import { z } from 'zod';

export const createAnswerSchema = z.object({
  content: z.string()
    .min(20, 'Answer must be at least 20 characters'),
  questionId: z.string(),
});

export const updateAnswerSchema = z.object({
  content: z.string()
    .min(20, 'Answer must be at least 20 characters'),
});