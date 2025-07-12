import { Router } from 'express';
import { answerService } from '../services/answer.service';
import { createAnswerSchema, updateAnswerSchema } from '../lib/validation/answer.schema';
import { idParamSchema } from '../lib/validation/common.schema';
import { authenticatedUser } from '../middleware/auth.middleware.js';

const router = Router();

// Get answers for a question (public)
router.get('/question/:questionId', async (req, res) => {
  try {
    const { questionId } = req.params;
    const answers = await answerService.findByQuestionId(questionId);
    res.json(answers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create answer (authenticated)
router.post('/', authenticatedUser, async (req , res) => {
  try {
    const data = createAnswerSchema.parse(req.body);
    const answer = await answerService.create(req.user!.id, data);
    res.status(201).json(answer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update answer (owner only)
router.patch('/:id', authenticatedUser, async (req, res) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const data = updateAnswerSchema.parse(req.body);
    const answer = await answerService.update(id, req.user!.id, data);
    res.json(answer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Accept answer (question owner only)
router.post('/:id/accept', authenticatedUser, async (req, res) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const answer = await answerService.acceptAnswer(id, req.user!.id);
    res.json(answer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete answer (owner only)
router.delete('/:id', authenticatedUser, async (req, res) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    await answerService.delete(id, req.user!.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;