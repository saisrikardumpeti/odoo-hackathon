import { Router } from 'express';
import questionRoutes from './question.route';
import answerRoutes from './answer.route';
import voteRoutes from './vote.route';
import tagRoutes from './tag.route';
import notificationRoutes from './notification.route';

const router = Router();

router.use('/questions', questionRoutes);
router.use('/answers', answerRoutes);
router.use('/votes', voteRoutes);
router.use('/tags', tagRoutes);
router.use('/notifications', notificationRoutes);

export default router;