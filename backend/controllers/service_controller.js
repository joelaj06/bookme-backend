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
          { location: { $regex: req.query.query ? req.query.query : "" } },
          { category: { $regex: req.query.query ? req.query.query : "" } },
          {
            "category.name": { $regex: req.query.query ? req.query.query : "" },
          },
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
    totalCount = services.length
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
  console.log(req.body);
  if (!req.body) {
    res.status(500);
    throw Error("Internal server error");
  }
  const service = await Service.findById(req.params.id);
  if (service) {
    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );

    if (updatedService) {
      res.status(200).json(updatedService);
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
const getPopularServices = asyncHandler( async(req, res) => {
  const popularServices = await Review.aggregate([
    {
      $lookup: {
        from: "services",          // The collection to join with (services collection)
        localField: "service",   // The field from the reviews collection
        foreignField: "_id",       // The field from the services collection
        as: "service_data"          // The field where the service data will be populated
      }
    },
    {
      $unwind: "$service_data"     // Deconstruct the serviceData array (optional, if you want to have a single object instead of an array)
    },
    {$sort: {rating : -1}},
    { $limit : 5 },
  ]);
  if(popularServices){
    res.status(200).json(popularServices);
  }else{
    throw new Error('Failed to fetch popular services')
  }
}
)

module.exports = {
  addService,
  updateService,
  deleteService,
  getServices,
  getPopularServices,
};
