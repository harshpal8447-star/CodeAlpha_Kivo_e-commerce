import express from 'express';
import {
  updateProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validateAddress } from '../middleware/validate.js';

const router = express.Router();

router.use(authenticate);

router.put('/profile', updateProfile);
router.get('/addresses', getAddresses);
router.post('/addresses', validateAddress, addAddress);
router.put('/addresses/:id', updateAddress);
router.delete('/addresses/:id', deleteAddress);

export default router;
