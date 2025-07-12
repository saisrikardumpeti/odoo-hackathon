import { Router } from 'express';
import { voteService } from '../services/vote.service';
import { voteSchema } from '../lib/validation/common.schema';
import { authenticatedUser } from '../middleware/auth.middleware';

const router = Router();

// Vote on question
router.post('/question/:id', authenticatedUser, async (req , res) => {
  try {
    const { id } = req.params;
    const { voteType } = voteSchema.parse(req.body);
    
    const result = await voteService.vote(
      req.user!.id,
      id,
      'question',
      voteType
    );
    
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Vote on answer
router.post('/answer/:id', authenticatedUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { voteType } = voteSchema.parse(req.body);
    
    const result = await voteService.vote(
      req.user!.id,
      id,
      'answer',
      voteType
    );
    
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user votes for multiple items
router.post('/user-votes', authenticatedUser, async (req , res) => {
  try {
    const { ids, type } = req.body as { ids: string[], type: 'question' | 'answer' };
    
    if (!ids || !Array.isArray(ids) || !type) {
      return res.status(400).json({ error: 'Invalid request body' });
    }
    
    const votes = await voteService.getUserVotes(req.user!.id, ids, type);
    res.json(votes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;