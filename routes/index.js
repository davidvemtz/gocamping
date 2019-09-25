const express = require('express'),
      router = express.Router(),
      passport = require('passport'),
      User = require('../models/user');

// root route
router.get('/', (req, res) => {
   res.render('landing');
 });

// show register form
router.get("/register", (req, res) => {
   res.render("register", { page: 'register'});
 });
 // handle sign up logic
router.post("/register", (req, res) => {
   let newUser = new User({username: req.body.username});
   if (req.body.admincode === 'onlydavidisadmin') {
     newUser.isAdmin = true;
   }
   User.register(newUser, req.body.password, (err, user) => {
     if (err) {
       req.flash("error", err.message);
       return res.redirect("/register");
     }
     passport.authenticate("local")(req, res, () => {
     req.flash("success", "Welcome to GoCamping " + user.username);
     res.redirect("/campgrounds");
     });
   });
 });
 
 // show login form
router.get("/login", (req, res) => {
   res.render("login", { page: 'login'});
 });
 // handling login logic
router.post("/login", passport.authenticate("local", 
   {
     successRedirect: "/campgrounds",
     failureRedirect: "/login",
     failureFlash: true,
     successFlash: 'Successfully logged in'
   }), (req, res) => {
 });
 
 // logout route
router.get("/logout", (req, res) => {
   req.logout();
   req.flash("success", "Successfully logged out");
   res.redirect("/campgrounds");
 });

module.exports = router;