const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

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

app.get('/testListing', async(req, res)=>{
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
});


//INDEX ROUTE
app.get('/listings', async(req, res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
});


//CREATE ROUTE
app.get("/listings/new", (req, res)=>{
    res.render("listings/new.ejs");
});

app.post("/listings", async(req, res)=>{
    let { title, description, image, price, country, location } = req.body;

    const newList = new Listing({
        title : title,
        description : description,
        image : image,
        price : price,
        country : country,
        location : location,
    });

    await newList.save();
    res.redirect("/listings");
});


//SHOW ROUTE
app.get("/listings/:id", async(req, res)=>{
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
});

//EDIT ROUTE
app.get("/listings/:id/edit", async(req,res)=>{
    let { id } = req.params;
    // console.log(id);
    const listings = await Listing.findById(id);
    res.render("listings/edit.ejs", { listings });
});

//UPDATE ROUTE
app.put("/listings/:id", async(req, res)=>{
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body });
    res.redirect(`/listings/${id}`);
});

app.delete("/listings/:id", async(req, res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
});

app.listen(8080, ()=>{
    console.log(`server is listening to 8080.`);
});