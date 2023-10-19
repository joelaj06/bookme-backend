const asyncHandler = require("express-async-handler");
const Booking = require("../models/booking_model");
const paginateResults = require("../utils/paginate");
const { response } = require("express");

//@desc book an agent
//@route /api/bookings
//@access PRIVATE
const addBooking = asyncHandler(async (req, res) => {
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
  } = req.body;
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
  });
  await booking.save();
  if (booking) {
    res.status(201).json(booking);
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
    const bookings = await Booking.find(query)
      .populate({ path: "user", select: "-token -password" })
      .populate({ path: "service" })
      .populate({ path: "agent" })
      .limit(limit)
      .skip(startIndex);

    if (bookings) {
      console.log(userId);
      res.status(200).json(bookings);
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
    });

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

module.exports = {
  addBooking,
  getBookings,
  updateBooking,
  deleteBooking,
};
