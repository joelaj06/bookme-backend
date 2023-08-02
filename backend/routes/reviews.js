const {protect} = require('../middleware/auth_middleware');
const express = require('express');
const validateEmptyPayload = require('../middleware/validate_payload');
const {
    addReview,
    updateReview,
    deleteReview,
    getReviews,
    getAgentAverageReview,
} = require('../controllers/review_controller');

const router = express.Router();

router.get('/:id?',protect, validateEmptyPayload, getReviews);
router.post('/', protect, validateEmptyPayload, addReview);
router.route('/:id').put(protect, validateEmptyPayload,updateReview).
delete(protect, validateEmptyPayload,deleteReview)

module.exports = router;