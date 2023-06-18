const asyncHandler = require("express-async-handler");
const Service = require("../models/service_model");

// @desc Get all services
// @route GET /api/services
// @access Private
const getServices = asyncHandler(async (req, res) =>{
    if(!req.params.id){
        const page = req.query.page;
        const limit = req.query.size;
        const startIndex = (page - 1) * limit;
    
        const services = await Service.find({
            "$or" :[
              {title: {$regex :  new RegExp(`^${req.query.query}.*`,'i') }}, 
              {title: {$regex : req.query.query ? req.query.query : ''}},
              {location: {$regex : req.query.query ? req.query.query : ''}},
              {category: {$regex : req.query.query ? req.query.query : ''}},
              { 'category.name': { $regex: req.query.query ? req.query.query : '' } },
            ]
          }).populate({
            path: 'user',
            select: '-password -tokens', // Exclude "password" and "tokens"
          }).
          populate({path: 'categories'})
          .limit(limit).skip(startIndex);
        res.status(200).json(services);
    }else{
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

     if(service){
        res.status(201).json(service);
     }else{
       throw new Error("Failed to save service")
     }

});


//@desc update service
//route /api/services/:id
//access PRIVATE

const updateService = asyncHandler( async (req, res) =>{
    console.log(req.body);
    if(!req.body){
        res.status(500);
        throw Error("Internal server error");
    }
     const service = await Service.findById(req.params.id);
     if(service){
        const updatedService = await Service.findByIdAndUpdate(req.params.id,
            req.body,{
            new: true
        });

        if(updatedService){
            res.status(200).json(updatedService);
        }else{
            res.status(400);
            throw new Error('Failed to update service');
        }
     }else{
        res.status(400);
        throw new Error('Service does not exist');
     }
});

//@desc Delete service
//@route /api/services/:id
//@access PRIVATE

const deleteService = asyncHandler(async (req,res) =>{
    const service = await Service.findById(req.params.id);
    if(service){
        await service.deleteOne();
        res.status(200).json({id: req.params.id});
    }else{
        res.status(400);
        throw new Error("Service does not exist")
    }
});

module.exports = {
    addService,
    updateService,
    deleteService,
    getServices,
}