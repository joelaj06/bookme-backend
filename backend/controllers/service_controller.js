const asyncHandler = require("express-async-handler");
const Service = require("../models/service_model");
const Review = require("../models/review_model");

// @desc Get all services
// @route GET /api/services
// @access Private
const getServices = asyncHandler(async (req, res) => {
  if (!req.params.id) {
    const page = req.query.page;
    const limit = req.query.size;
    const startIndex = (page - 1) * limit;
    const query = req.query.query;
    const categoryId = req.query.category_id;
    let totalCount = 0;
    let services;
    if (categoryId) {
      services = await Service.find({
        categories: categoryId,
      })
        .populate({
          path: "user",
          select: "-password -tokens", // Exclude "password" and "tokens"
        })
        .populate({ path: "categories" })
        .limit(limit)
        .skip(startIndex);

      totalCount = services.length;
    } else if (query) {
      services = await Service.find({
        $or: [
          { title: { $regex: new RegExp(`^${req.query.query}.*`, "i") } },
          { title: { $regex: req.query.query ? req.query.query : "" } },
          { location: { $regex: req.query.query ? req.query.query : "",$options: 'i' } },
        ],
      })
        .populate({
          path: "user",
          select: "-password -tokens", // Exclude "password" and "tokens"
        })
        .populate({ path: "categories" })
        .limit(limit)
        .skip(startIndex);
    } else {
      services = await Service.find({})
        .populate({
          path: "user",
          select: "-password -tokens", // Exclude "password" and "tokens"
        })
        .populate({ path: "categories" })
        .limit(limit)
        .skip(startIndex);
    }
    totalCount = services.length;
    res.set("total-count", totalCount);
    res.status(200).json(services);
  } else {
    const service = await Service.findById(req.params.id);
    if (service) {
      res.status(200).json(service);
    } else {
      throw new Error("Service not found");
    }
  }
});

// @desc Register service
// @route POST /api/services
// @access Private
const addService = asyncHandler(async (req, res) => {
  const {
    title,
    user,
    description,
    location,
    cover_image,
    images,
    categories,
    price,
    discount,
  } = req.body;

  const service = new Service({
    title: title,
    user: user,
    description: description,
    location: location,
    cover_image: cover_image,
    images: images,
    categories: categories,
    price: price,
    discount: discount,
  });
  await service.save();

  if (service) {
    res.status(201).json(service);
  } else {
    throw new Error("Failed to save service");
  }
});

//@desc update service
//route /api/services/:id
//access PRIVATE

const updateService = asyncHandler(async (req, res) => {
  if (!req.body) {
    res.status(500);
    throw Error("Internal server error");
  }
  const service = await Service.findById(req.params.id);
  if (service) {
    let base64Strings =['']
     base64Strings = req.body.images;
      const bufferImages = base64Strings.map(base64String =>{
        return Buffer.from(base64String, "base64")}) ;
  
    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      {...req.body, images: bufferImages},
      {
        new: true,
      }
    );

    if (updatedService) {
      const updatedImagesBase64 = updatedService.images.map(buffer => buffer.toString('base64'));
      
      console.log(updatedImagesBase64);
      const responseWithBase64Images = {
        ...updatedService.toObject(), // Convert to plain object to avoid Mongoose methods
        images: updatedImagesBase64
      };
      
      res.status(200).json(responseWithBase64Images);
    } else {
      res.status(400);
      throw new Error("Failed to update service");
    }
  } else {
    res.status(400);
    throw new Error("Service does not exist");
  }
});

//@desc Delete service
//@route /api/services/:id
//@access PRIVATE

const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (service) {
    await service.deleteOne();
    res.status(200).json({ id: req.params.id });
  } else {
    res.status(400);
    throw new Error("Service does not exist");
  }
});

//@desc fetch popular services
//@route /api/services/popular_services
//@access PUBLIC
const getPopularServices = asyncHandler(async (req, res) => {
  const popularServices = await Review.aggregate([
    {
      $lookup: {
        from: "services", // The collection to join with (services collection)
        localField: "service", // The field from the reviews collection
        foreignField: "_id", // The field from the services collection
        as: "service_data", // The field where the service data will be populated
      },
    },
    {
      $unwind: "$service_data", // Deconstruct the serviceData array (optional, if you want to have a single object instead of an array)
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user_data",
      },
    },
    {
      $unwind: "$user_data",
    },
    {
      $lookup: {
        from: "users",
        localField: "agent",
        foreignField: "_id",
        as: "agent_data",
      },
    },
    {
      $unwind: "$agent_data", // If you want a single object instead of an array
    },
    {
      $project: {
        "user_data.password": 0,
        "agent_data.password": 0,
        "user_data.tokens": 0,
        "agent_data.tokens": 0,
        "service_data.user": 0,
        "service_data.categories": 0,
        service: 0, // Exclude the "service" field from the output
        user: 0, // Exclude the "user" field from the output
        agent: 0, // Exclude the "agent" field from the output
        __v: 0, // Exclude the "__v" field from the output (optional, if present)
      },
    },
    { $sort: { rating: -1 } },
    // {
    //   $group: {
    //     _id: "$service_data._id",
    //     service_data: { $first: "$service_data" }, // Preserve the service_data of the document with the highest rating within each group
    //     rating: { $first: "$rating" } // Preserve the highest rating within each group
    //   }
    // },
    { $limit: 5 },
  ]);
  if (popularServices) {
    res.status(200).json(popularServices);
  } else {
    throw new Error("Failed to fetch popular services");
  }
});

//@desc fetch promotions
//@route /api/services/promotions
//@access PUBLIC
const getPromotions = asyncHandler(async (req, res) => {
  const page = req.query.page;
  const limit = req.query.size;
  const startIndex = (page - 1) * limit;
  const searchQuery = req.query.query;

  let query = {};

  if (searchQuery) {
    query = {
      $or: [
        { title: { $regex: new RegExp(`^${req.query.query}.*`, "i") } },
        { title: { $regex: req.query.query ? req.query.query : "" } },
        { 'discount.title':{$regex: searchQuery,$options: 'i'} },
      ],
      is_special_offer: true,
    };
  }else{
    query = {
      is_special_offer: true,
    }
  }

  const services = await Service.find(query)
    .populate({
      path: "user",
      select: "-password -tokens", // Exclude "password" and "tokens"
    })
    .populate({ path: "categories" })
    .limit(limit)
    .skip(startIndex);

  if (services) {
    const totalCount = services.length;
    res.set("total-count", totalCount);
    res.status(200).json(services);
  } else {
    throw new Error("Failed to fetch promotions");
  }
});

module.exports = {
  getPromotions,
  addService,
  updateService,
  deleteService,
  getServices,
  getPopularServices,
};
