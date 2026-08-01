const express = require('express');
const router = express.Router();

const { getProducts, getProduct, createProduct, updateProduct } = require('../controllers/product-controller');
const { protect, authorize } = require('../middleware/auth-middleware');

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', protect, authorize('admin'), createProduct);
router.patch('/:id', protect, authorize('admin'), updateProduct);

module.exports = router; 
