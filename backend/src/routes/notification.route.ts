import { Router } from 'express';
import { authenticatedUser } from '../middleware/auth.middleware';
import { notificationService } from '../services/notification.service';
import { idParamSchema } from '../lib/validation/common.schema';

const router = Router();

// Get user notifications
router.get('/', authenticatedUser, async (req, res) => {
  try {
    const notifications = await notificationService.getUserNotifications(req.user!.id);
    res.json(notifications);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get unread count
router.get('/unread-count', authenticatedUser, async (req, res) => {
  try {
    const count = await notificationService.getUnreadCount(req.user!.id);
    res.json({ count });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Mark notification as read
router.patch('/:id/read', authenticatedUser, async (req, res) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const notification = await notificationService.markAsRead(id, req.user!.id);
    res.json(notification);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Mark all as read
router.patch('/mark-all-read', authenticatedUser, async (req, res) => {
  try {
    await notificationService.markAllAsRead(req.user!.id);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;