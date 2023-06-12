const asyncHandler = require("express-async-handler");
const Review = require("../models/review_model");

//@desc add review
//@route /api/reviews
//@access PRIVATE
const addReview = asyncHandler(async (req, res) => {
  const {
    user,
    agent,
    comment,
    rating,
    service,
    user_id,
    service_id,
    agent_id,
  } = req.body;
  const review = new Review({
    user,
    agent,
    comment,
    rating,
    service,
    user_id,
    service_id,
    agent_id,
  });
  await review.save();
  if (review) {
    res.status(200).json(review);
  } else {
    res.status(400);
    throw new Error("Failed to create review");
  }
});

//@desc get review(s)
//@route /api/reviews/:id?
//@access PRIVATE
const getReviews = asyncHandler(async (req, res) => {
  if (!req.params.id) {
    const userId = req.query.user_id;
    const agentId = req.query.agent_id;

    if (!agentId) {
      res.status(400);
      throw new Error("agent_id is required.");
    }

    let query = {};

    if (userId) {
      query = {
        user_id: userId,
        agent_id: agentId,
      };
    } else {
      query = {
        agent_id: agentId,
      };
    }

    const page = req.query.page;
    const limit = req.query.size;
    const startIndex = (page - 1) * limit;
    const reviews = await Review.find(query)
      .skip(startIndex)
      .limit(limit)
      .populate({ path: "user", select: "-password -tokens" })
      .populate({ path: "agent", select: "-password -tokens" })
      .populate({ path: "service" });
    if (reviews) {
      res.status(200).json(reviews);
    } else {
      res.status(400);
      throw new Error("Failed to get reviews");
    }
  } else {
    const id = req.params.id;
    const review = await Review.findById(id);
    if (review) {
      res.status(200).json(review);
    } else {
      res.status(400);
      throw new Error("Review not found");
    }
  }
});

//@desc update review
//@route /api/reviews/:id
//@access PRIVATE

const updateReview = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const review = await Review.findById(id);
  if (review) {
    const updatedReview = await Review.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (updatedReview) {
      res.status(200).json(updatedReview);
    } else {
      res.status(400);
      throw new Error("Failed to update review");
    }
  } else {
    res.status(400);
    throw new Error("Review not found");
  }
});

//@desc delete review
//@route /api/reviews/:id
//@access PRIVATE
const deleteReview = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const review = await Review.findById(id);
  if (review) {
    await review.deleteOne();
    res.status(200).json({ id: id });
  } else {
    res.status(400);
    throw new Error("Review not found");
  }
});

module.exports = {
  updateReview,
  getReviews,
  addReview,
  deleteReview,
};
