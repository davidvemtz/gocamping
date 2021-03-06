const express = require('express'),
      router = express.Router(),
      Campground = require('../models/campground'),
      middleware = require('../middleware/index.js');
const NodeGeocoder = require('node-geocoder');

const options = {
   provider: 'google',
   httpAdapter: 'https',
   apiKey: process.env.GEOCODER_API_KEY,
   formatter: null
};

const geocoder = NodeGeocoder(options);

// index
router.get('/', (req, res) => {
   // Get all campgronds from mongoDB
   Campground.find({}, (err, allCampgrounds) => {
      if (err) {
         console.log(err);
      } else {
         res.render("campgrounds/index", { campgrounds: allCampgrounds, currentUser: req.user, page: 'campgrounds' });
      }
   });
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
   // get data from form and add to campgrounds array
   let name = req.body.name;
   let image = req.body.image;
   let desc = req.body.description;
   let author = {
       id: req.user._id,
       username: req.user.username
   }
   geocoder.geocode(req.body.location, function (err, data) {
     if (err || !data.length) {
       req.flash('error', 'Invalid address');
       return res.redirect('back');
     }
     let lat = data[0].latitude;
     let lng = data[0].longitude;
     let location = data[0].formattedAddress;
     let newCampground = {name: name, image: image, description: desc, author:author, location: location, lat: lat, lng: lng};
     // Create a new campground and save to DB
     Campground.create(newCampground, function(err, newlyCreated){
         if(err){
             console.log(err);
         } else {
             //redirect back to campgrounds page
             console.log(newlyCreated);
             res.redirect("/campgrounds");
         }
     });
   });
 });

// new route
router.get("/new", middleware.isLoggedIn, (req, res) => {
   res.render("campgrounds/new");
});

// show route
router.get("/:id", (req, res) => {
   // find the campground with id 
   Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
      if (err || !foundCampground) {
         req.flash("error", "Campground not found");
         res.redirect("back");
      } else {
         // show information about that campground
         console.log(foundCampground);
         res.render("campgrounds/show", { campground: foundCampground });
      }
   });
});

// EDIT ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res) => {
   Campground.findById(req.params.id, (err, foundCampground) => {
      res.render('campgrounds/edit', { campground: foundCampground });
   });
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
   geocoder.geocode(req.body.location, function (err, data) {
     if (err || !data.length) {
       req.flash('error', 'Invalid address');
       return res.redirect('back');
     }
     req.body.campground.lat = data[0].latitude;
     req.body.campground.lng = data[0].longitude;
     req.body.campground.location = data[0].formattedAddress;
 
     Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
         if(err){
             req.flash("error", err.message);
             res.redirect("back");
         } else {
             req.flash("success","Successfully Updated!");
             res.redirect("/campgrounds/" + campground._id);
         }
     });
   });
 });

// DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, (req, res) => {
   Campground.findByIdAndDelete(req.params.id, (err) => {
      if (err) {
         res.redirect("/campgrounds");
      } else {
         req.flash("error", 'Campground deleted');
         res.redirect("/campgrounds");
      }
   });
});


module.exports = router;

