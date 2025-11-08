import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

import * as blogController from '../controllers/blog.controller';

// Public routes
router.get('/', blogController.listBlogPosts);
router.get('/:slug', blogController.getBlogPostBySlug);

// Admin routes
router.post('/', authenticate, authorize('ADMIN'), blogController.createBlogPost);
router.put('/:id', authenticate, authorize('ADMIN'), blogController.updateBlogPost);
router.delete('/:id', authenticate, authorize('ADMIN'), blogController.deleteBlogPost);

export default router;
