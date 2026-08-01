const express = require('express');
const Router = express.Router();

const {
    createDealer,
    getDealer,
    getMyDealerProfile,
    updateDealer,
    deleteDealer,
} = require('../controllers/dealer-controller');

const { protect, authorize } = require('../middleware/auth-middleware');

Router.post('/', protect, authorize('dealer'), createDealer);
Router.get('/me', protect, authorize('dealer'), getMyDealerProfile);
Router.get('/:id', getDealer);
Router.patch('/:id', protect, authorize('dealer'), updateDealer);
Router.delete('/:id', protect, authorize('dealer', 'admin'), deleteDealer);

module.exports = Router; 