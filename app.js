const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");
const { listingSchema } = require("./schema.js");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended : true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

main().
then(()=>{
    console.log("connected to DB")
}).catch(e => {
    console.log(e);
});

async function main(){
    await mongoose.connect(MONGO_URL);
}


app.get('/', (req, res)=>{
    res.send("Hii, i am root!!")
});


const validateListing = (req, res, next) =>{
    let { error } = listingSchema.validate(req.body);
    console.log(error);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else {
        next();
    }
}
app.get('/testListing', wrapAsync(async(req, res)=>{
    let sampleListing = new Listing({
        title : "My New Villa",
        description : "By the beach",
        price : 12000,
        location : "Goa",
        country : "India",
    });

    await sampleListing.save();
    console.log("successfully added!!");
    res.send("successfully!!");
}));


//INDEX ROUTE
app.get('/listings', wrapAsync(async(req, res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));


//CREATE ROUTE
app.get("/listings/new", (req, res)=>{
    res.render("listings/new.ejs");
});

app.post("/listings", validateListing, wrapAsync(async(req, res, next)=>{
    try{
        // let { title, description, image, price, country, location } = req.body;
        // console.log("IMAGE FROM FORM:", image);
        /* if(!req.body.listing){
            throw new ExpressError(400, "send valid data");
        }*/
        
        const newList = new Listing(req.body.listing);
        // ({
                
            // title : title,
            // description : description,
            // image : image,
            // price : price,
            // country : country,
            // location : location,
        // });

        await newList.save();

        // console.log("IMAGE SAVED:", newList.image);
        
        res.redirect("/listings");
    }catch(err){
        next(err);
    }
}));


//SHOW ROUTE
app.get("/listings/:id", wrapAsync(async(req, res)=>{
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
}));

//EDIT ROUTE
app.get("/listings/:id/edit", wrapAsync(async(req,res)=>{
    let { id } = req.params;
    // console.log(id);
    const listings = await Listing.findById(id);
    res.render("listings/edit.ejs", { listings });
}));

//UPDATE ROUTE
app.put("/listings/:id", validateListing, wrapAsync(async(req, res)=>{
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body });
    res.redirect(`/listings/${id}`);
}));

app.delete("/listings/:id", wrapAsync(async(req, res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

app.all("/*splat", (req, res,next)=>{
    next(new ExpressError(404, "Page not found."));
})

app.use((err, req,res,next)=>{
    let {status=500, message="something went wrong.."} = err;
    res.status(status).send(message);
})
app.listen(8080, ()=>{
    console.log(`server is listening to 8080.`);
});