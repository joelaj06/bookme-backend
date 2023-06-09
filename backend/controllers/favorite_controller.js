const asyncHandler = require('express-async-handler');
const Favorite = require('../models/favorite_model');


//@desc add service to favorite
//@route /api/favorites
//@access PRIVATE
const addFavorite = asyncHandler(async (req, res) =>{
    const {service, user, user_id} = req.body;
    const favorite =  new Favorite({service, user, user_id});
    await favorite.save();
    if(favorite){
        res.status(200).json(favorite);
    }else{
        res.status(400);
        throw new Error('Failed to create favorite');
    }
});

//@desc get user's favorites
//@route /api/favorites/:id?
//@access PRIVATE
const getFavorites = asyncHandler(async (req, res) =>{
  const page = req.query.page;
  const limit = req.query.limit;
  const startIndex = (page - 1) * limit;
    const userId = req.query.user_id;
    const id = req.params.id;
    if(!id){
        const favorites = await Favorite.find({user_id: userId})
        .limit(limit)
        .skip(startIndex)
        .populate({path: 'service'});

        if(favorites){
            res.status(200).json(favorites);
        }else{
            res.status(400);
            throw new Error('Failed to get favorites');
        }
    }else{
        const favorite = await Favorite.findById(id).populate({path: 'service'});;
        if(favorite){
            res.status(200).json(favorite);
        }else{
            res.status(400);
            throw new Error('Favorite not found');
        }
    }
});

//@desc delete user's favorite service
//@route /api/favorites/:id
//access PRIVATE
const deleteFavorite = asyncHandler(async (req, res) =>{
    const id = req.params.id;
    const favorite = await Favorite.findById(id);
    if(favorite){
        await favorite.deleteOne();
        res.status(200).json({id: id});
    }else{
        res.status(400);
        throw new Error('Favorite service not found');
    }
});

module.exports = {
    addFavorite,
    deleteFavorite,
    getFavorites,
}