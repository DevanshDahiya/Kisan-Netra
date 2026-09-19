const express = require('express');
const router = express.Router();

const { getProducts, getProduct, createProduct, updateProduct, deleteProduct } = require('../controllers/product-controller');
const { protect, authorize } = require('../middleware/auth-middleware');

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', protect, authorize('admin', 'dealer'), createProduct);
router.patch('/:id', protect, authorize('admin'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;