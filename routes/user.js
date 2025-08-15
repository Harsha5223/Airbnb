const express = require('express');
const ExpressError = require("../utils/ExpressError.js");
const router = express.Router();
const User = require('../models/user.js');
const WrapAsync = require('../utils/WrapAsync.js');
const passport = require('passport');
const { savedRedirectUrl } = require("../middleware.js");
const userController=require("../controllers/users.js")
router
.route("/signup")
.get(userController.renderSignupForm )
.post(WrapAsync(userController.signup));

router
.route("/login")
.get(userController.renderLoginForm)
.post(savedRedirectUrl,
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true
    }),
    userController.login
    
);


router.get("/logout",userController.logout );

module.exports = router;
