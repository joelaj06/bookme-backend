const express = require('express');
const {protect} = require('../middleware/auth_middleware');
const validateEmptyPayload = require('../middleware/validate_payload');
const {
    addBooking,
    updateBooking,
    deleteBooking,
    getBookings,
} = require('../controllers/booking_controller');

const router = express.Router();

router.get('/:id?',protect,validateEmptyPayload,getBookings);
router.post('/',protect,validateEmptyPayload,addBooking);
router.route('/:id').put(protect, validateEmptyPayload,updateBooking).
delete(protect, validateEmptyPayload,deleteBooking);

module.exports = router;