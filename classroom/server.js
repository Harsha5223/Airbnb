const express=require("express");
const app=express();
const users=require("./routes/user.js");
const posts=require("./routes/post.js");
const session=require("express-session");
const flash=require("connect-flash");
const path=require("path");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
const sessionoptions={secret:"mysupersecretstring",
     resave : false,
     saveUninitialized : true};
app.use(
    session(sessionoptions),
);
app.use(flash());
app.use((req,res,next)=>{
        res.locals.successMsg=req.flash("success");
    res.locals.errorMsg=req.flash("error");
    next();
})

app.get("/register",(req,res)=>
{
    let {name="anynomous"}=req.query;
req.session.name = name;
   if(name === "anynomous"){
    req.flash("error","user not found"); 
    }else{
        req.flash("success","user found successfully");
    }
    res.redirect("/hello");
});
app.get("/hello",(req,res)=>{


    res.render("page.ejs",{name : req.session.name})
}
);
app.listen(3000,(req,res)=>
{
    console.log("app running on 3000")
})
