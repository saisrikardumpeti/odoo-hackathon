import { Router } from 'express';
import { tagService } from '../services/tag.service';
import { z } from 'zod';

const router = Router();

const searchQuerySchema = z.object({
  q: z.string().optional(),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

// Search tags
router.get('/search', async (req, res) => {
  try {
    const { q, limit } = searchQuerySchema.parse(req.query);
    const tags = await tagService.search(q, limit);
    res.json(tags);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get popular tags
router.get('/popular', async (req, res) => {
  try {
    const tags = await tagService.getPopular(20);
    res.json(tags);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get tag details
router.get('/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const tag = await tagService.findByName(name);
    
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    
    res.json(tag);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;