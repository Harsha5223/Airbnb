require('dotenv').config();
const express=require("express");
const app= express();
const mongoose=require("mongoose");
// const MONGO_URL="mongodb://127.0.0.1:27017/Hotel"
const dbUrl=process.env.ATLASDB_URL;
const path=require("path");
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const session=require("express-session");
const MongoStore = require('connect-mongo');

const flash=require("connect-flash"); 
const passport=require("passport");
const User=require("./models/user.js");

const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js"); 
const LocalStrategy=require("passport-local");
const UserRouter=require("./routes/user.js");
const { errorMonitor } = require('stream');

main().then(()=>{
    console.log("connected");
}).catch((err)=>
{
    console.log(err);
})

async function main(){
    await mongoose.connect(dbUrl);
}
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store=MongoStore.create(
    {
        mongoUrl:dbUrl,
        crypto :{
            secret : process.env.SECRET,
        },
        touchAfter: 24 * 3600, // time in seconds after which session will be updated
    }
)
store.on("error",(err)=>{
    console.log("Error in mongo session store",err);
})

const sessionOptions={
    store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie:{
        expires: Date.now() + 1000 * 60 * 60 * 24 * 3, // 3 days
        maxAge: 1000 * 60 * 60 * 24 * 3,// 3 days
        httpOnly: true, // Helps prevent XSS attacks

    }
}

//route
// app.get("/",(req,res)=>{
//     res.send("api is working");
// })


app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
        res.locals.error=req.flash("error");
        res.locals.currUser=req.user;

    next();
});

// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User({
//         email: "demouser@example.com",
//         username: "demoUser",
//     });
//     let  registeredUser=await User.register(fakeUser,"helloworld");
//     res.send(registeredUser);
// });

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",UserRouter);

// app.get("/testListing",async(req,res)=>{
//     let sampleListing = new Listing({
//         title : "My new villa",
//         description: " villa by the sea",
//         price: 1000,
//         location :"Hyderabad",
//         country: "India"

//     });
//     await sampleListing.save();
//     console.log("sample saved");
//     res.send(sampleListing);
// });
// index route




//review route


app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found"));
})
app.use((err,req,res,next)=>{
    let {statusCode=500,message="something went wrong"}=err;
    // res.status(statusCode).send(message);    
    res.status(statusCode).render("error.ejs",{message});
})
app.listen(8080,()=>
   { console.log("server is running on port 8080");
})