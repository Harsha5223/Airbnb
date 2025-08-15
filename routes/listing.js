const express=require('express');
const router=express.Router();
const WrapAsync=require("../utils/WrapAsync.js");
const Listing=require("../models/listing.js")
const listingController=require("../controllers/listing.js")
const ExpressError = require("../utils/ExpressError.js");
const multer  = require('multer')
const {storage } = require('../cloudConfig.js');
const upload = multer({ storage })

const {isLoggedIn,isOwner,validateListing}=require("../middleware.js")

router
.route("/")
.get(WrapAsync(listingController.index))
.post(isLoggedIn,
    upload.single('listing[image]'),
    validateListing ,
    WrapAsync(listingController.createListing));

router.get("/new",isLoggedIn,listingController.renderNewForm)

router
.route("/:id")
.get(WrapAsync(listingController.showListing))
.put(isLoggedIn,
    isOwner,
    upload.single('listing[image]'),
    validateListing,
     WrapAsync(listingController.updateListing))
.delete(isLoggedIn,
    isOwner,
    WrapAsync(listingController.destroyListing))

//new route
//show
router.get("/:id",WrapAsync(listingController.showListing))

//create 
//edit
router.get("/:id/edit",
    isLoggedIn,
    isOwner, 
    WrapAsync(listingController.renderEditForm));

//update
router.put("/:id",isLoggedIn,isOwner,validateListing, WrapAsync(listingController.updateListing));
//delete

router.delete("/:id",isLoggedIn,isOwner,WrapAsync(listingController.destroyListing))

module.exports = router;