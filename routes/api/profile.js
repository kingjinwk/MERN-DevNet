const express = require("express");
const router = express.Router();
//Bringing these in to route the Profile models
const mongoose = require("mongoose");
const passport = require("passport");
//Load profile Models
const Profile = require("../../models/Profile");
//Load User Models
const User = require("../../models/User");

//Load Validation
const validateProfileInput = require("../../validation/profile");

//For outdated stuff
mongoose.set("useFindAndModify", false);

// @route   GET api/profile/test
// @desc    Tests profile route
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "Profile Works Fine" }));

// @route   GET api/profile
// @desc    Get current user profile
// @access  Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    //We want errors to be stored into objects, before we pass the into .json
    const errors = {};

    Profile.findOne({ user: req.user.id })
      //Used to bring avatar to profile
      .populate("user", ["name", "avatar"])
      .then(profile => {
        if (!profile) {
          //Create the error
          errors.noprofile = "There is no profile for this user";
          //Pass it into Json
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route   POST api/profile
// @desc    Create / Edit user profile
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    //Check Validation
    if (!isValid) {
      //Return any error with 400 status
      return res.status(400).json(errors);
    }

    // Get fields
    const profileFields = {};
    profileFields.user = req.user.id;

    //check to see if the field we are looking for has been sent it, and then set it as profileFields
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;

    //Skills - split into array (it comes in as csv)
    if (typeof req.body.skills !== "undefined") {
      profileFields.skills = req.body.skills.split(",");
    }

    //Social - also an array of objects
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    //Look for the user before updating stuff
    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        //Update the profile, since one exists
        Profile.findOneAndUpdate(
          //who to update
          { user: req.user.id },
          //the other fields we have req.body'ed for before
          { $set: profileFields },
          { new: true }
        )
          //respond WITH that profile
          .then(profile => res.json(profile));
      } else {
        //Create a user since one does not exist

        //Check to see if handle exists
        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          if (profile) {
            errors.handle = "That handle already exists";
            //error
            res.status(400).json(errors);
          }
          //other wise
          //Save Profile
          new Profile(profileFields).save().then(profile => res.json(profile));
        });
      }
    });
  }
);

module.exports = router;
