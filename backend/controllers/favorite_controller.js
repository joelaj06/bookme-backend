const asyncHandler = require("express-async-handler");
const Favorite = require("../models/favorite_model");

//@desc add service to favorite
//@route /api/favorites
//@access PRIVATE
const addFavorite = asyncHandler(async (req, res) => {
  const { service, user, user_id } = req.body;

  const serv = await Favorite.findOne({service: service,user_id: user_id});
  if(serv){
    res.status(400);
    throw new Error('Service already exist in favorites');
  }
  const favorite = new Favorite({ service, user, user_id });
  const savedFavorite = await favorite.save();

  // Populate the 'service' and 'user' fields in the saved 'favorite'
  if (savedFavorite) {
    res.status(200).json({
      _id: savedFavorite._id
    });
  } else {
    res.status(400);
    throw new Error("Failed to create favorite");
  }
});

//@desc get user's favorites
//@route /api/favorites/:id?
//@access PRIVATE
const getFavorites = asyncHandler(async (req, res) => {
  const page = req.query.page;
  const limit = req.query.size;
  const startIndex = (page - 1) * limit;
  const userId = req.query.user_id;
  const id = req.params.id;
  if (!id) {
    let favorites = await Favorite.find({ user_id: userId })
      .limit(limit)
      .skip(startIndex)
      .populate({
        path: "user",
        select: "-password -tokens", // Exclude "password" and "tokens"
      })
      .populate({
        path: "service",
        populate: {
          path: "user",
          select: "-password -tokens", // Exclude "password" and "tokens"
        },
        select: "-categories"
      });

    if (favorites) {
      //iterate through the data and convert the Buffer Images to base64 Strings
      const data = favorites.map((item) => {
        /*create a new object structure to maintain the original
                 structure of favorites while modifying the images array within
                 the service property.
                 */
        return {
          ...item._doc,
          service: {
            ...item.service._doc,
            images: item.service.images.map((imageBuffer) =>
              imageBuffer.toString("base64")
            ),
          },
        };
      });

      res.status(200).json(data);
    } else {
      res.status(400);
      throw new Error("Failed to get favorites");
    }
  } else {
    const favorite = await Favorite.findById(id).populate({ path: "service" });
    if (favorite) {
      res.status(200).json(favorite);
    } else {
      res.status(400);
      throw new Error("Favorite not found");
    }
  }
});

//@desc delete user's favorite service
//@route /api/favorites/:id
//access PRIVATE
const deleteFavorite = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const favorite = await Favorite.findById(id);
  if (favorite) {
    await favorite.deleteOne();
    res.status(200).json({ _id: id });
  } else {
    res.status(400);
    throw new Error("Favorite service not found");
  }
});

module.exports = {
  addFavorite,
  deleteFavorite,
  getFavorites,
};
