const Campground = require("../models/campground"),
      Comment = require("../models/comment");
// middlewares
const middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function (req, res, next) {
   if (req.isAuthenticated()) {
      Campground.findById(req.params.id, (err, foundCampground) => {
         if (err || !foundCampground) {
            req.flash("error", "Campground not found");
            res.redirect("back");
         } else {
            // is the user the owner of the campground?
            if (foundCampground.author.id.equals(req.user._id) || req.user.isAdmin) {
               next();
            } else {
               req.flash("error", "Permission denied")
               res.redirect("back");
            }
         }
      });
   } else {
      req.flash("error", "You need to be logged in.");
      res.redirect("back");
   };
};

middlewareObj.checkCommentOwnership = function (req, res, next) {
   if (req.isAuthenticated()) {
      Comment.findById(req.params.comment_id, (err, foundComment) => {
         if (err || !foundComment) {
            req.flash("error", "Comment not found");
            res.redirect("back");
         } else {
            // is the user the owner of the campground?
            if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
               next();
            } else {
               req.flash("error", "Permission denied.");
               res.redirect("back");
            }
         }
      });
   } else {
      req.flash("error", "You need to be logged in.");
      res.redirect("back");
   };
};

middlewareObj.isLoggedIn = function (req, res, next) {
   if (req.isAuthenticated()) {
      return next();
   }
   req.flash("error", "You need to be logged in.");
   res.redirect("/login");
};


module.exports = middlewareObj;