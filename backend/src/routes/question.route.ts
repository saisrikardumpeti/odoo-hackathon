import { Router } from 'express';
import {  authenticatedUser} from '../middleware/auth.middleware';
import { questionService } from '../services/question.service';
import { createQuestionSchema, updateQuestionSchema, questionQuerySchema } from '../lib/validation/question.schema';
import { idParamSchema } from '../lib/validation/common.schema';

const router = Router();

// Get all questions (public)
router.get('/', async (req, res) => {
  try {
    const query = questionQuerySchema.parse(req.query);
    const questions = await questionService.findAll(query);
    res.json(questions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get single question (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const question = await questionService.findById(id);
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    res.json(question);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create question (authenticated)
router.post('/', authenticatedUser, async (req, res) => {
  try {
    const data = createQuestionSchema.parse(req.body);
    const question = await questionService.create(req.user!.id, data);
    res.status(201).json(question);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update question (owner only)
router.patch('/:id', authenticatedUser, async (req, res) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const data = updateQuestionSchema.parse(req.body);
    const question = await questionService.update(id, req.user!.id, data);
    res.json(question);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete question (owner only)
router.delete('/:id', authenticatedUser, async (req, res) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    await questionService.delete(id, req.user!.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;