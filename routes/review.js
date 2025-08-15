const express=require('express');
const router=express.Router({mergeParams: true});
const WrapAsync=require("../utils/WrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const Review=require("../models/review.js");
const Listing=require("../models/listing.js")
const mongoose = require("mongoose");
const {isLoggedIn,isReviewAuthor,validateReview}=require("../middleware.js");
const reviewController = require("../controllers/reviews.js")





router.post("/",isLoggedIn,validateReview,WrapAsync(reviewController.createReview));

// Delete review route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor, WrapAsync(reviewController.destroyReview));

module.exports = router;