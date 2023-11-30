const asyncHandler = require("express-async-handler");
const {Booking,validateBooking} = require("../models/booking_model");
const { User } = require("../models/user_model");
const { sendPushNotification } = require("./push_notification_controller");

//@desc book an agent
//@route /api/bookings
//@access PRIVATE
const addBooking = asyncHandler(async (req, res) => {
  const { error } = validateBooking(req.body);
  if(error){
    res.status(400);
    throw new Error(error.details[0].message);
  }
  const {
    user,
    service,
    start_date,
    end_date,
    status,
    preliminary_cost,
    location,
    notes,
    agent,
    agent_id,
    user_id,
    fcm_notification,
  } = req.body;

  const client = await User.findById(user);
  const provider = await User.findById(agent);
  if(client.device_token){
    const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    const date = new Date(end_date).toLocaleDateString('en-us',
    options);
    const notification = {
      title: 'Your Expertise Requested',
      body: `Great news! You\'ve got a new booking from ${client.first_name} ${client.last_name} for ${date}`
    }
    const data = {
      route : fcm_notification.route,
    }
    const payload = {
      notification,
      data,
      token: provider.device_token,
    }
     sendPushNotification(payload);
  }

 
  const booking = new Booking({
    user,
    service,
    start_date,
    end_date,
    status,
    preliminary_cost,
    location,
    notes,
    agent,
    agent_id,
    user_id,
  });
  await booking.save();
  if (booking) {
    const response = await Booking.findById(booking._id)
    .select('-user -agent -service');
    if(response){
      res.status(201).json(response);
    }
  } else {
    res.status(400);
    throw new Error("Failed to create booking");
  }
});

//@desc get bookings
//@route /api/bookings/:id?
//@access PRIVATE
const getBookings = asyncHandler(async (req, res) => {
  const page = req.query.page;
  const limit = req.query.limit;
  const startIndex = (page - 1) * limit;
  const userId = req.query.user_id;
  const agentId = req.query.agent_id;
  let query = {};
  if(!userId){
    query = {
     agent_id: agentId,
    }
  }else{
    query = {
      user_id: userId,
     }
  }

  if (!req.params.id) {
    if(!userId && !agentId){
      res.status(400);
      throw new Error('Invalid query');
    }
    const bookings = await Booking.find(query)
      .populate({ path: "user", select: "-token -password -tokens -image" })
      .populate({ path: "service", select: "-categories -images -user"})
      .populate({ path: "agent", select: "-token, -password -tokens" })
      .limit(limit)
      .skip(startIndex);

    if (bookings) {
      res.status(200).json(bookings);
      console.log(bookings.length);
    //  res.set({ total_count: totalCount });
    } else {
      res.status(400);
      throw new Error("Failed to get bookings");
    }
  }
});

//@desc update booking
//@route /api/bookings/:id
//@access PRIVATE

const updateBooking = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const booking = await Booking.findById(id);
  if (booking) {
    const updatedBooking = await Booking.findByIdAndUpdate(id, req.body, {
      new: true,
    }) .populate({ path: "user", select: "-token -password -tokens -image" })
    .populate({ path: "service", select: "-categories -images -user"})
    .populate({ path: "agent", select: "-token, -password -tokens -image" });

    if (updatedBooking) {
      res.status(200).json(updatedBooking);
    } else {
      res.status(400);
      throw new Error("Failed to update booking");
    }
  } else {
    res.status(400);
    throw new Error("Booking not found");
  }
});

//@desc delete booking
//@route /api/bookings/:id
//@access PRIVATE
const deleteBooking = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const booking = await Booking.findById();
  if (booking) {
    await booking.deleteOne();
    res.status(200).json({ id: id });
  } else {
    res.status(400);
    throw new Error("Booking not found");
  }
});

//TODO implement booking status

module.exports = {
  addBooking,
  getBookings,
  updateBooking,
  deleteBooking,
};
