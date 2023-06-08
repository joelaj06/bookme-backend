const Category = require('../models/category_model');
const asyncHandler = require('express-async-handler');

//@desc add category
//@route /api/categories
//@access PRIVATE

const addCategory = asyncHandler(async (req, res) =>{
  const {name, description} = req.body;

  const category = new Category({name, description});
  await category.save();
  if(category){
    res.status(201).json(category);
  }else{
    res.status(400);
    throw new Error("Failed to create category");
  }
});

//@desc get categories
//@route /api/categories
//@access PRIVATE

const getCategories = asyncHandler(async (req, res)=>{
    if(!req.params.id){
        const page = req.query.page;
        const limit = req.query.limit;
        const startIndex = (page - 1) * limit;
        const categories = await Category.find({}).limit(limit).skip(startIndex);
        if(categories){
            res.status(200).json(categories);
        }
    }else{
        const catId = req.params.id;
        const category = await Category.findById(catId);
        if(category) {
            res.status(200).json(category);
        }else{
            res.status(400);
            throw new Error('Category not found');
        }
    }
});

//@desc update category
//@route /api/categories/:id
//@access PRIVATE

const updateCategory = asyncHandler(async (req, res)=> {
    const catId = req.params.id;
    if(!req.body){
        res.status(500);
        throw Error("Internal server error");
    }
    const category = await Category.findById(catId);
    if(category){
        const updatedCategory = await Category.findByIdAndUpdate(catId,
            req.body,{new : true});
        if(updatedCategory){
            res.status(200).json(updatedCategory);
        }else{
            res.status(400);
            throw new Error('Failed to update category');
        }
    }else{
        res.status(400);
        throw new Error('Category not found')
    }
});

//desc delete category
//@route /api/categories/:id
//@access PRIVATE
const deleteCategory = asyncHandler(async (req, res)=>{
    const catId = req.params.id;
    const category = await Category.findById(catId);
    if(category){
        await category.deleteOne()
        res.status(200).json({id: catId})
    }else{
       res.status(400);
       throw new Error('Category not found');
    }
});

module.exports ={
    addCategory,
    updateCategory,
    getCategories,
    deleteCategory,
}