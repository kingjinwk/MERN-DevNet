const express = require("express");
const router = express.Router();
//Bringing these in to route the Profile models
const mongoose = require("mongoose");
const passport = require("passport");
//Load profile Models
const Profile = require("../../models/Profile");
//Load User Models
const User = require("../../models/User");

// Mongoose useFindAndModify is deprecated
mongoose.set("useFindAndModify", false);

//Load Validation
const validateProfileInput = require("../../validation/profile");
//Validate Experience Input
const validateExperienceInput = require("../../validation/experience");
//Validate Education Input
const validateEducationInput = require("../../validation/education");

// @route   GET api/profile/test
// @desc    Tests profile route
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "Profile Works Fine" }));

// @route   GET api/profile/all
// @desc    Get all profiles in array
// @access  Public
router.get("/all", (req, res) => {
  Profile.find()
    .populate("user", ["name", "avatar"])
    .then(profiles => {
      if (!profiles) {
        errors.noprofile = "There are no profiles";
        return res.status(404).json(errors);
      }
      res.json(profiles);
    })
    .catch(err => res.status(404).json({ profile: "There are no profiles" }));
});

// @route   GET api/profile/handle/:handle
// @desc    Get profile by handle
// @access  Public
router.get("/handle/:handle", (req, res) => {
  const errors = {};

  //grabs handle from the URL
  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      //check to see if there is no profile
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        res.status(404).json(errors);
      }
      //if there is profile found
      res.json(profile);
    })
    .catch(err => res.status(404).json(errors));
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user id
// @access  Public
router.get("/user/:user_id", (req, res) => {
  const errors = {};

  //grabs handle from the URL
  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      //check to see if there is no profile
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        res.status(404).json(errors);
      }
      //if there is profile found
      res.json(profile);
    })
    .catch(err => res.status(404).json(errors));
});

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

// @route   GET api/profile/experience
// @desc    Add experience to profile
// @access  Private
router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    //create the valid check variable
    const { errors, isValid } = validateExperienceInput(req.body);

    //Check Validation
    if (!isValid) {
      //Return any error with 400 status
      return res.status(400).json(errors);
    }
    //let's find a user by id
    Profile.findOne({ user: req.user.id }).then(profile => {
      //new Experience object
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      //Add to experience array
      profile.experience.unshift(newExp);
      //now save existing profile, which returns a promise
      profile.save().then(profile => res.json(profile));
    });
  }
);

// @route   GET api/profile/education
// @desc    Add education to profile
// @access  Private
router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    //create the valid check variable
    const { errors, isValid } = validateEducationInput(req.body);

    //Check Validation
    if (!isValid) {
      //Return any error with 400 status
      return res.status(400).json(errors);
    }
    //let's find a user by id
    Profile.findOne({ user: req.user.id }).then(profile => {
      //new Education object
      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      //Add to Education array
      profile.education.unshift(newEdu);
      //now save existing profile, which returns a promise
      profile.save().then(profile => res.json(profile));
    });
  }
);

// @route   DELETE api/profile/experience//:exp_id
// @desc    Delete experience from profile
// @access  Private
router.delete(
  "/experience/:exp_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    //let's find a user by id
    Profile.findOne({ user: req.user.id }).then(profile => {
      //Find the experience that we want to delete
      //Get remove index
      //Use indexofmap
      const removeIndex = profile.experience
        //turn array of experiences into id's
        .map(item => item.id)
        //gets us the experience to delete
        .indexOf(req.params.exp_id);

      //Splice out of the array
      profile.experience.splice(removeIndex, 1);

      //Save
      profile
        .save()
        .then(profile => res.json(profile))

        //Catch
        .catch(err => res.status(404).json(err));
    });
  }
);

// @route   DELETE api/profile/education//:edu_id
// @desc    Delete education from profile
// @access  Private
router.delete(
  "/education/:edu_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    //let's find a user by id
    Profile.findOne({ user: req.user.id }).then(profile => {
      //Find the education that we want to delete
      //Get remove index
      //Use indexofmap
      const removeIndex = profile.education
        //turn array of educations into id's
        .map(item => item.id)
        //gets us the education to delete
        .indexOf(req.params.edu_id);

      //Splice out of the array
      profile.education.splice(removeIndex, 1);

      //Save
      profile
        .save()
        .then(profile => res.json(profile))

        //Catch
        .catch(err => res.status(404).json(err));
    });
  }
);

// @route   DELETE api/profile
// @desc    Delete user and profile
// @access  Private
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    //Delete the profile
    Profile.findOneAndRemove({ user: req.user.id }).then(() => {
      //Delete the user (needs user Model)
      User.findOneAndRemove({ _id: req.user.id }).then(() =>
        res.json({ success: true })
      );
    });
  }
);

module.exports = router;
