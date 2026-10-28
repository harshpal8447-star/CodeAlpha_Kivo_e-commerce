import { Router } from 'express';
import {
  getSellerProfile,
  updateSellerProfile,
  getSellerMetrics,
  getSellerProducts,
  createSellerProduct,
  updateSellerProduct,
  deleteSellerProduct,
  getSellerOrders,
  updateSellerOrderItemStatus,
} from '../controllers/seller.controller.js';
import { authenticate, requireSeller } from '../middleware/auth.js';

const router = Router();

// All seller routes require authentication and seller role
router.use(authenticate, requireSeller);

router.get('/profile', getSellerProfile);
router.put('/profile', updateSellerProfile);
router.get('/metrics', getSellerMetrics);
router.get('/products', getSellerProducts);
router.post('/products', createSellerProduct);
router.put('/products/:id', updateSellerProduct);
router.delete('/products/:id', deleteSellerProduct);
router.get('/orders', getSellerOrders);
router.put('/orders/items/:itemId/status', updateSellerOrderItemStatus);

export default router;
