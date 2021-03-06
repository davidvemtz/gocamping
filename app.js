require('dotenv').config();

const express = require('express');
      app        = express(),
      bodyParser = require('body-parser'),
      mongoose   = require('mongoose'),
      flash = require("connect-flash"),
      passport   = require('passport'),
      LocalStrategy = require('passport-local'), 
      methodOverride = require('method-override'),
      Campground = require('./models/campground'),
      Comment    = require('./models/comment'),
      User       = require('./models/user')
      seedDB     = require('./seeds'),
      app.locals.moment = require('moment'),
      PORT       = process.env.PORT || 8080;

const campgroundRoutes  = require('./routes/campgrounds'),
      commentRoutes     = require('./routes/comments'),
      indexRoutes       = require('./routes/index');

mongoose.connect(process.env.DATABASEURL, {useNewUrlParser: true, useCreateIndex: true}, (error) => 
        error ? console.log(error) : console.log("Conectado a MongoDB"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// seedDB();

// PASSPORT CONFIGURATION
app.use(require("express-session")({
  secret: "Esto puede ser lo que sea.",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

// ------------------------------------------------
app.listen(PORT, () => {
  console.log(`GoCamping server on port ${PORT}`);
});