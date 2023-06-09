const express = require('express');

const {
    addService,
    deleteService,
    getServices,
    updateService,
} = require('../controllers/service_controller');
const router = express.Router();
const {protect} = require('../middleware/auth_middleware');
const validateEmptyPayload = require('../middleware/validate_payload');


router.get("/:id?",validateEmptyPayload,getServices,);
router.post('/',protect,validateEmptyPayload, addService);
router.route('/:id').put(protect,validateEmptyPayload, updateService).delete(protect, deleteService);

module.exports = router;



