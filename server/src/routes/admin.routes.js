import express from 'express';
import {
  getAdminMetrics,
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  getAdminOrders,
  updateAdminOrderStatus,
  getAdminSellers,
  updateAdminSellerStatus,
} from '../controllers/admin.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Enforce both authentication and administrator privileges
router.use(authenticate, requireAdmin);

router.get('/metrics', getAdminMetrics);

// Product management
router.get('/products', getAdminProducts);
router.post('/products', createAdminProduct);
router.put('/products/:id', updateAdminProduct);
router.delete('/products/:id', deleteAdminProduct);

// Order management
router.get('/orders', getAdminOrders);
router.patch('/orders/:id/status', updateAdminOrderStatus);

// Seller management
router.get('/sellers', getAdminSellers);
router.patch('/sellers/:id/status', updateAdminSellerStatus);

export default router;
