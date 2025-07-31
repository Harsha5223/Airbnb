const express=require("express");
const app= express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js")
const MONGO_URL="mongodb://127.0.0.1:27017/Hotel"
const path=require("path");
const WrapAsync=require("./utils/WrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const {listingSchema} = require("./schema.js");
main().then(()=>{
    console.log("connected");
}).catch((err)=>
{
    console.log(err);
})

async function main(){
    await mongoose.connect(MONGO_URL);
}
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
app.get("/",(req,res)=>{
    res.send("api is working");
})

const validListing=(req,res,next)=>{
     let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        return next(new ExpressError(400,errMsg));
    
       } else{
            next();
        }

}


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
app.get("/listings", WrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

//new route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
})
//show
app.get("/listings/:id",async(req,res)=>

{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/show.ejs",{listing});

})

//create 
app.post("/listings",validListing, WrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));
//edit
app.get("/listings/:id/edit", WrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));

//update
app.put("/listings/:id",validListing, WrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
}));

app.delete("/listings/:id",WrapAsync(async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}))

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