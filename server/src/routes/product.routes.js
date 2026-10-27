import express from 'express';
import {
  getProducts,
  getFeaturedProducts,
  getProductBySlugOrId,
  createProductReview,
} from '../controllers/product.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:identifier', getProductBySlugOrId);
router.post('/:id/reviews', authenticate, createProductReview);

export default router;
