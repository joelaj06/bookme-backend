const express = require('express');
const { getCategories, deleteCategory, updateCategory, addCategory } = require('../controllers/category_controller');
const {protect} = require('../middleware/auth_middleware')
const router = express.Router();

router.get('/:id?',getCategories);
router.route('/:id').delete(protect,deleteCategory).put(protect,updateCategory);
router.post('/',protect,addCategory);

module.exports = router;