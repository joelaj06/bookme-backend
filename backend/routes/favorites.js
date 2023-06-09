const express = require('express');
const validateEmptyPayload = require('../middleware/validate_payload');
const {protect} = require('../middleware/auth_middleware');
const {
    addFavorite,
    deleteFavorite,
    getFavorites
} = require('../controllers/favorite_controller');

const router = express.Router();

router.get('/:id?', protect, validateEmptyPayload, getFavorites);
router.post('/',protect, validateEmptyPayload, addFavorite);
router.delete('/:id', protect, validateEmptyPayload, deleteFavorite);


module.exports = router;