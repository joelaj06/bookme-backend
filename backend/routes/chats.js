const {protect} = require('../middleware/auth_middleware');
const validateEmptyPayload = require('../middleware/validate_payload');
const {
    initiateChat, getChats
} = require('../controllers/chat_controller');

const express = require('express');
const { postMessage, getMessages } = require('../controllers/message_controller');
const { validate } = require('../models/booking_model');
const router = express.Router();

router.post('/initiate', protect, validateEmptyPayload, initiateChat);
router.post('/:id/message', protect, validateEmptyPayload, postMessage);
router.get('/:id',protect, validateEmptyPayload, getChats);
router.get('/:id/messages', protect, validateEmptyPayload, getMessages);


module.exports = router;