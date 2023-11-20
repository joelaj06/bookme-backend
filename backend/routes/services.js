const express = require('express');

const {
    addService,
    deleteService,
    getServices,
    updateService,
    getPopularServices,
    getPromotions,
    getServiceByUser,

} = require('../controllers/service_controller');
const router = express.Router();
const {protect} = require('../middleware/auth_middleware');
const validateEmptyPayload = require('../middleware/validate_payload');

router.get('/user',protect,validateEmptyPayload,getServiceByUser,);
router.get('/popular_services',validateEmptyPayload,getPopularServices,);
router.get('/promotions',validateEmptyPayload,getPromotions,);
router.get("/:id?",validateEmptyPayload,getServices,);
router.post('/',validateEmptyPayload, addService);
router.route('/:id').put(protect,validateEmptyPayload, updateService).delete(protect, deleteService);

module.exports = router;



