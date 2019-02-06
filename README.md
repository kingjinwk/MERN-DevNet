# MERN Stack | DevNet

#### These are my notes as I took my first MERN stack experience on Udemy.



### Extensions for VSCode

ES7 React/Redux/GraphQL...

Live Server

Node.js Modules Intellisense

Prettier

Bracket Pair Colorizer



### Startup | Backend API using 

1. `npm init` to create the package.json

2. `npm i express mongoose passport passport-jwt jsonwebtoken body-parser bcryptjs validator`

   to download all the modules we need

3. `npm i -D nodemon` *NOTE `-D` is `--save-dev`

   **nodemon** looks at node application and updates for us

4. `node server` to run server (`server` can be replaced with any other file name)

#### Adding a Script | package.json

1. in `package.json` go to `"scripts"` and replace with these two lines

    `"start": "node server.js",` changes `npm start` to run that `node server.js`

    `"server": "nodemon server.js"` new script to run nodemon with `npm run server`



### Connecting to MongoDB with Mongoose

1. create a `keys.js` file inside `config` directory and stick in the MongoDB URI from **mLab** to keys.js

   ```javascript
   //make this obj available outside this file
   module.exports = {
     mongoURI:
       "mongodb://username:password@ds117545.mlab.com:17545/react-social-network"
   };
   ```

2. add `const mongoose = require("mongoose");` and then add to `server.js`

   ```javascript
   //DB Config
   const db = require("./config/keys").mongoURI;
   
   // Connect to MongoDB thru Mongoose
   mongoose
     .connect(db)
     //.then = if it connects successfully
     .then(() => console.log("MongoDB Connected"))
     //catches if login had error (wrong pw in keys.js or something)
     .catch(err => console.log(err));
   ```



### Routing Files with Express Router

Separate routes for each of our resources

1. new `routes` folder, make new `api` folder and make
   1. `users.js` takes care of authentication (username, email, authentic)
   2. `profile.js` (location, bio, experience, network length)
   3. `posts.js` for user posts and comments

2. add them into `server.js`

   ```javascript
   const users = require("./routes/api/users");
   const profile = require("./routes/api/profile");
   const posts = require("./routes/api/posts");
   ```

3. use the routes with `app.use`

   ```javascript
   // Use Routes
   app.use('/api/users', users);
   app.use('/api/profile', profile);
   app.use('/api/posts', posts);
   ```

   will get error cause routes haven't been set

4. `users.js` `profile.js` `posts.js`

   ```javascript
   const express = require("express");
   const router = express.Router();
   
   router.get("/test", (req, res) => res.json({msg: "<Route> Works Fine"}));
   
   module.exports = router;
   ```

5. `http://localhost:5000/api/<Routes>/test` to see the message on browser

   *SIDE NOTE: `rm -rf .git` to undo git repo*



### Creating User Model: Authentication, JSON webtokens, Register, Login

1. create `models` directory and then `User.js` (caps is convention)

2. inside `User.js`

   ```javascript
   const mongoose = require("mongoose"); 	//mongoose dependencies
   const Schema = mongoose.Schema;			//using Schema to create model
   
   //Create Schema
   const UserSchema = new Schema({
     //name email password avatar date
     name: {
       type: String,
       required: true
     },
     email: {
       type: String,
       required: true
     },
     password: {
       type: String,
       required: true
     },
     avatar: {
       type: String,
       required: true
     },
     date: {
       type: Date,
       default: Date.now //current timestamp
     }
   });
   
   module.exports = User = mongoose.model("users", UserSchema);
   ```


### User Registration w/ Postman

1. `users.js` and create a route

   ```javascript
   // @route   GET api/users/register
   // @desc    Register user
   // @access  Public
   router.post("/register", (req, res) => {
     //use mongoose to first find if email exists (line 4 Load User Model)
     User.findOne({ email: req.body.email });
   });
   ```

   `req.body.email` requires us to add body-parser to `server.js`

   ```javascript
   //add these
   
   //require module
   const bodyParser = require('body-parser');
   
   //Body parser middleware
   app.use(bodyParser.urlencoded({extended: false}));
   app.use(bodyParser.json());
   ```

2. installed `npm i gravatar` to pull the avatar out the email

   ```javascript
   const gravatar = require("gravatar");
   
   User.findOne({ email: req.body.email }).then(user => {
       if (user) {
         return res.status(400).json({ email: "Email already exists" });
       } else {
         const avatar = gravatar.url(req.body.email, {
           s: "200", //size
           r: "pg", //Rating
           d: "mm" //default
         });
   
          //create a new user with all these fields
         const newUser = new User({
           name: req.body.name,
           email: req.body.email,
           avatar,
           password: req.body.password
         });
   ```

3. installed `bcryptjs` for password hashing

```javascript
      
const bcrypt = require("bcryptjs");
      
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
```



### Email & Password Login (tokens)

add the login functionality

1. `users.js` added this before module.exports

   ```javascript
   // @route   GET api/users/login
   // @desc    Login User / Returning JWT (token)
   // @access  Public
   router.post("/login", (req, res) => {
     const email = req.body.email;
     const password = req.body.password;
   
     //Find the user by email
     //by using User model
     User.findOne({ email }).then(user => {
       //Check for user
       if (!user) {
         return res.status(404).json({ email: "User not found" });
       }
   
       //If user is good, check password
       //use bcrypt to compare pw and hashed
       bcrypt.compare(password, user.password).then(isMatch => {
         if (isMatch) {
           //if User passed, generate the token
           res.json({ msg: "Successful Login" });
         } else {
           return res.status(400).json({ password: "Incorrect Password" });
         }
       });
     });
   });
   ```


### Creating the JSON Webtoken (JWT) for login

our current logic only says stuff like message success

1. create JWT by importing dependencies and declaring a payload, and then `jwt.sign` to sign the token

   `users.js` (below)

   ```javascript
   //add to header
   const jwt = require("jsonwebtoken");
   
   ..
   ..
   ..
   
   bcrypt.compare(password, user.password).then(isMatch => {
         if (isMatch) {
           //if User passed, generate the token
   
           //Create JWT payload for next step
           const payload = { id: user.id, name: user.name, avatar: user.avatar };
   
           //Sign the token takes payload (userinfo), secret (key), expiration (in seconds), callback
           jwt.sign(
             payload,
             keys.secretOrKey,
             { expiresIn: 3600 },
   
             (err, token) => {
               res.json({
                 success: true,
                 token: "Bearer " + token
               });
             }
           );
         } else {
           return res.status(400).json({ password: "Incorrect Password" });
         }
       }
   ```

2. the key is declared inside the `config` folder's `keys.js`

   ```javascript
   secretOrKey: "secret"
   ```

   and then import it into `users.js`

   ```javascript
   const keys = require("../../config/keys");
   ```

3. reload to see token generated in **Postman**



### Implement Passport for JWT Authentication

verifies token we made in previous step

1. start by including `passport` in server.js

2. add these lines to initialize passport, and then link it to the new `passport.js` file we will create

   ```javascript
   //request and response object
   //app.get("/", (req, res) => res.send("Hello Me"));
   
   //Passport middleware
   app.use(passport.initialize());
   
   //Passport Config
   require('./config/passport')(passport);
   
   // Use Routes
   //app.use("/api/users", users);
   //app.use("/api/profile", profile);
   //app.use("/api/posts", posts);
   ```

3. create `passport.js` in config and write

   ```javascript
   const JwtStrategy = require("passport-jwt").Strategy;
   const ExtractJwt = require("passport-jwt").ExtractJwt;
   //For user info
   const mongoose = require("mongoose");
   const User = mongoose.model("users");
   //This contains our secret to validate request
   const keys = require("../config/keys");
   
   
   
   const opts = {};
   opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
   opts.secretOrKey = keys.secretOrKey;
   
   module.exports = passport => {
     passport.use(
       new JwtStrategy(opts, (jwt_payload, done) => {
         console.log(jwt_payload);
       })
     );
   };
   
   ```

4. Update `users.js` and add a route

   ```javascript
   ...
   //To create protected route for user
   const passport = require("passport");
   
   ...
   ...
   ...
   
   // @route   GET api/users/current
   // @desc    Return current user (who holds token)
   // @access  Private
   router.get(
     "/current",
     passport.authenticate("jwt", { session: false }),
     (req, res) => {
       res.json({ msg: "Success" });
     }
   );
   
   module.exports = router;
   ```

   

5. Postman now shows that we are not authenticated to access `http://localhost:5000/api/users/currents`

6. To fix this, POST request to **Postman** a login, and copy the JWT token (Bearer) and then go back to update `passport.js`

   ```javascript
   ...
   ...
   
   ...
   
   module.exports = passport => {
     passport.use(
       new JwtStrategy(opts, (jwt_payload, done) => {
         User.findById(jwt_payload.id)
           .then(user => {
             if (user) {
               return done(null, user);
             }
             return done(null, false);
           })
           .catch(err => console.log(err));
       })
     );
   };
   ```

   

7. Now, do a GET request on Postman to step 5. and pass in the token as a **Header**

8. Works

9. update `users.js`to only return what we want

   ```javascript
   // @route   GET api/users/current
   // @desc    Return current user (who holds token)
   // @access  Private
   router.get(
     "/current",
     passport.authenticate("jwt", { session: false }),
     (req, res) => {
       res.json({
         id: req.user.id,
         name: req.user.name,
         email: req.user.email
       });
     }
   );
   ```



### Validation

to make sure that login info throws the correct errors if needed

1. using `validator.js` for a bunch of good stuff

2. in `register.js`

   ```javascript
   const Validator = require("validator");
   
   module.exports = function validateRegisterInput(data) {
     let errors = {};
   
     if(!Validator.isLength(data.name, { min: 2, max: 30 })){
         errors.name = 'Name must be between 2 and 30 characters';
     }
   
     return {
         errors,
         isValid: errors
     }
   };
   ```

3. we need isValid to work, so we make `is-empty.js`

   to check for any empty ANYTHING

   `is-empty.js`

   ```javascript
   function isEmpty(value) {
     return (
       value === undefined ||
       value === null ||
       (typeof value === "object" && Object.keys(value).length === 0) ||
       (typeof value === "string" && value.trim().length === 0)
     );
   }
   module.exports = isEmpty;
   
   or
   
   const isEmpty = value =>
     value === undefined ||
     value === null ||
     (typeof value === "object" && Object.keys(value).length === 0) ||
     (typeof value === "string" && value.trim().length === 0);
   
   module.exports = isEmpty;
   
   ```

4. go to `users.js` and add

   ```javascript
   // Load Input Validation
   const validateRegisterInput = require('../../validation/register');
   
   and
   
   
   // @route   GET api/users/register
   // @desc    Register user
   // @access  Public
   router.post("/register", (req, res) => {
     //using destructuring to get the error message from isValid, from register.js
     const { errors, isValid } = validateRegisterInput(req.body);
   
     // Check validation, if not valid, return a 400 error
     if (!isValid) {
       return res.status(400).json(errors);
     }
   ```

5. Now any invalid username can't be registered on Postman

6. We want to make sure register fields look correct, modify `register.js`

   ```javascript
   const Validator = require("validator");
   const isEmpty = require("./is-empty");
   
   module.exports = function validateRegisterInput(data) {
     let errors = {};
   
     // gets tested as an empty string
     data.name = !isEmpty(data.name) ? data.name : "";
     data.email = !isEmpty(data.email) ? data.email : "";
     data.password = !isEmpty(data.password) ? data.password : "";
     // the confirm password
     data.password2 = !isEmpty(data.password2) ? data.password2 : "";
   
     if (!Validator.isLength(data.name, { min: 2, max: 30 })) {
       errors.name = "Name must be between 2 and 30 characters";
     }
   
     if (Validator.isEmpty(data.name)) {
       errors.name = "Name field is required";
     }
   
     if (Validator.isEmpty(data.email)) {
       errors.email = "Email field is required";
     }
   
     if (!Validator.isEmail(data.email)) {
       errors.email = "Invalid Email";
     }
   
     if (Validator.isEmpty(data.password)) {
       errors.password = "Password field is required";
     }
   
     if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
       errors.password = "Password must be at least 6 characters";
     }
   
     if (Validator.isEmpty(data.password2)) {
       errors.password2 = "Retype your password";
     }
   
     if (!Validator.equals(data.password, data.password2)) {
       errors.password2 = "Passwords must match";
     }
   
     return {
       errors,
       isValid: isEmpty(errors)
     };
   };
   
   ```

7. fill `login.js` with

   ```javascript
   const Validator = require("validator");
   const isEmpty = require("./is-empty");
   
   module.exports = function validateLoginInput(data) {
     let errors = {};
   
     // gets tested as an empty string
     data.email = !isEmpty(data.email) ? data.email : "";
     data.password = !isEmpty(data.password) ? data.password : "";
   
     if (!Validator.isEmail(data.email)) {
       errors.email = "Invalid Email";
     }
   
     if (Validator.isEmpty(data.password)) {
       errors.password = "Password field is required";
     }
   
      //the order of checking matters
     if (Validator.isEmpty(data.email)) {
       errors.email = "Email field is required";
     }
     return {
       errors,
       isValid: isEmpty(errors)
     };
   };
   ```

   exclude the options we don't need, and then add this file to `users.js`

   ```javascript
   const express = require("express");
   const router = express.Router();
   const gravatar = require("gravatar");
   const bcrypt = require("bcryptjs");
   const jwt = require("jsonwebtoken");
   const keys = require("../../config/keys");
   //To create protected route for user
   const passport = require("passport");
   
   // Load Input Validation
   const validateRegisterInput = require("../../validation/register");
   const validateLoginInput = require("../../validation/login");
   
   // Load User Model
   const User = require("../../models/User");
   
   // @route   GET api/users/test
   // @desc    Tests users route
   // @access  Public
   router.get("/test", (req, res) => res.json({ msg: "Users Works Fine" }));
   
   ...
   ...
   ...
   ```



### Profile API Routes

Creating the models for our profiles with mongoose and schema

1. new `Profile.js` file inside `models`

   ```javascript
   const mongoose = require("mongoose");
   const Schema = mongoose.Schema;
   
   // Create Schema
   const ProfileSchema = new Schema({
     user: {
       type: Schema.Types.ObjectId,
       ref: "users"
     },
     handle: {
       type: String,
       required: true,
       max: 40
     },
     comapny: {
       type: String,
       required: false
     },
     website: {
       type: String,
       required: false
     },
     location: {
       type: String
     },
     status: {
       type: String,
       required: true
     },
     skills: {
       //array of strings declaration
       type: [String],
       required: true
     },
     bio: {
       type: String,
       required: false
     },
     githubusername: {
       type: String
     },
     experience: [
       {
         title: {
           type: String,
           required: true
         },
         company: {
           type: String,
           required: true
         },
         location: {
           type: String
         },
         from: {
           type: Date,
           required: true
         },
         to: {
           type: Date
         },
         current: {
           type: Boolean,
           default: false
         },
         description: {
           type: String
         }
       }
     ],
     education: [
       {
         school: {
           type: String,
           required: true
         },
         degree: {
           type: String,
           required: true
         },
         fieldofstudy: {
           type: String,
           required: true
         },
         from: {
           type: Date,
           required: true
         },
         to: {
           type: Date
         },
         current: {
           type: Boolean,
           default: false
         },
         description: {
           type: String
         }
       }
     ],
     social: {
       youtube: {
         type: String
       },
       twitter: {
         type: String
       },
       facebook: {
         type: String
       },
       linkedin: {
         type: String
       },
       instagram: {
         type: String
       }
     },
     date: {
       type: Date,
       default: Date.now
     }
   });
   
   //export this as a Mongoose model, add the Profile Schema
   module.exports = Profile = mongoose.model("profile", ProfileSchema);
   ```



### Route the Profile Models

1. go to `profile.js` route current user profile
2. bring in mongoose, passport, profile models, and user models

```javascript
//Bringing these in to route the Profile models
const mongoose = require("mongoose");
const passport = require("passport");
//Load profile Models
const Profile = requre('../../models/Profile');
//Load User Models
const User = require('../../models/User');
```

3. make get request to get current user profile

   ```javascript
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
   ```

4. Postman -> login -> post -> login with user -> get token -> `http://localhost:5000/api/profile` and see that profiles work



### Create & Update Profile Routes

make a post route to create a profile

1. in `profile.js`

   ```javascript
   // @route   POST api/profile
   // @desc    Create / Edit user profile
   // @access  Private
   router.post(
     "/",
     passport.authenticate("jwt", { session: false }),
     (req, res) => {
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
           Profile.findOne({ handle: profileFiends.handle }).then(profile => {
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
   ```



### Profile Field Validations

1. create a new `profile.js` inside `validation`directory and 

   ```javascript
   const Validator = require("validator");
   const isEmpty = require("./is-empty");
   
   module.exports = function validateLoginInput(data) {
     let errors = {};
   
     // gets tested as an empty string
     data.handle = !isEmpty(data.handle) ? data.handle : "";
     data.status = !isEmpty(data.status) ? data.status : "";
     data.skills = !isEmpty(data.skills) ? data.skills : "";
   
     if (!Validator.isLength(data.handle, { min: 2, max: 40 })) {
       errors.handle = "Handle needs to be at least 2 characters";
     }
     if (Validator.isEmpty(data.handle)) {
       errors.handle = "Profile handle is required";
     }
     if (Validator.isEmpty(data.status)) {
       errors.status = "Status field is required";
     }
     if (Validator.isEmpty(data.skills)) {
       errors.skills = "Skills field is required";
     }
   
     if (!isEmpty(data.website)) {
       if (!Validator.isURL(data.website)) {
         errors.website = "Not a valid URL";
       }
     }
     if (!isEmpty(data.youtube)) {
       if (!Validator.isURL(data.youtube)) {
         errors.youtube = "Not a valid URL";
       }
     }
     if (!isEmpty(data.twitter)) {
       if (!Validator.isURL(data.twitter)) {
         errors.twitter = "Not a valid URL";
       }
     }
     if (!isEmpty(data.facebook)) {
       if (!Validator.isURL(data.facebook)) {
         errors.facebook = "Not a valid URL";
       }
     }
     if (!isEmpty(data.linkedin)) {
       if (!Validator.isURL(data.linkedin)) {
         errors.linkedin = "Not a valid URL";
       }
     }
     if (!isEmpty(data.instagram)) {
       if (!Validator.isURL(data.instagram)) {
         errors.instagram = "Not a valid URL";
       }
     }
   
     return {
       errors,
       isValid: isEmpty(errors)
     };
   };
   ```

2. go to `/api/profile.js` and add the validateProfileInput line

   ```javascript
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
   ```

3. add dependency on header

   ```javascript
   //Load Validation
   const validateProfileInput = require("../../validation/profile");
   ```

4. On postman  POST `http://localhost:5000/api/profile`

   - login with the authentication key
   - I can now add fields onto my profile
   - handle, status, skills, company, website, facebook, linked etc..

5. go back to `api/profile.js` and add this line to bring the name and avatar to the front

   ```javascript
   
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
   ```

6. now we can POST req on Postman `api/profile` with key and we see our gravatar on our profile



### More Profile Routes

getting profile by handle, by id, and to fetch all profiles

1. `api/profile.js` make a new get request before `api/profile` GET request, this one to grab profile by handle

   ```javascript
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
   ```

2. make another one, except this one to fetch profile by ID

   ```javascript
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
   ```



### Add Experience & Education Routes

1. in `api/profile.js` add a new POST request

   ```javascript
   // @route   GET api/profile/experience
   // @desc    Add experience to profile
   // @access  Private
   router.post(
     "/experience",
     passport.authenticate("jwt", { session: false }),
     (req, res) => {
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
   ```

2. Now we go to `validation` to create a new `experience.js`

   ```javascript
   const Validator = require("validator");
   const isEmpty = require("./is-empty");
   
   module.exports = function validateExperienceInput(data) {
     let errors = {};
   
     // gets tested as undef or null and gets turned into an expty string
     data.title = !isEmpty(data.title) ? data.title : "";
     data.company = !isEmpty(data.company) ? data.company : "";
     data.from = !isEmpty(data.from) ? data.from : "";
   
     if (Validator.isEmpty(data.title)) {
       errors.title = "Job title field is required";
     }
   
     if (Validator.isEmpty(data.Company)) {
       errors.Company = "Company field is required";
     }
   
     if (Validator.isEmpty(data.from)) {
       errors.from = "From date field is required";
     }
   
     return {
       errors,
       isValid: isEmpty(errors)
     };
   };
   
   ```

3. add this to `profile.js` routes

   `const validateExperienceInput = require("../../validation/experience");`

4. and update the POST route to check for validation

   ```javascript
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
   ```

5. now let's add the Education Routes, copy over the route we made and rename to education

   ```javascript
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
   ```

   and add the header

   `const validateEducationInput = require("../../validation/education");`

6. add an `education.js` file to `validation` directory and make a similar clone to `experience.js`

   ```javascript
   const Validator = require("validator");
   const isEmpty = require("./is-empty");
   
   module.exports = function validateExperienceInput(data) {
     let errors = {};
   
     // gets tested as undef or null and gets turned into an expty string
     data.school = !isEmpty(data.school) ? data.school : "";
     data.degree = !isEmpty(data.degree) ? data.degree : "";
     data.fieldofstudy = !isEmpty(data.fieldofstudy) ? data.fieldofstudy : "";
     data.from = !isEmpty(data.from) ? data.from : "";
   
     if (Validator.isEmpty(data.school)) {
       errors.school = "School field is required";
     }
   
     if (Validator.isEmpty(data.degree)) {
       errors.degree = "Degree field is required";
     }
   
     if (Validator.isEmpty(data.fieldofstudy)) {
       errors.fieldofstudy = "Field of study field is required";
     }
     if (Validator.isEmpty(data.from)) {
       errors.from = "From date field is required";
     }
   
     return {
       errors,
       isValid: isEmpty(errors)
     };
   };
   
   ```

   

### Delete Education and Experience from Profile

1. new `profile.js` route, first **DELETE** request

   ```javascript
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
   ```

2. same thing for education

   ```javascript
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
   ```

3. we can now do post requests on **Postman** to delete education and experience

   ```html
   http://localhost:5000/api/profile/experience/objectid
   http://localhost:5000/api/profile/education/objectid
   ```



#### Route to delete User and Profile

1. add a new **DELETE** request in `profile.js`

   ```javascript
   // @route   DELETE api/profile
   // @desc    Delete user and profile
   // @access  Private
   router.delete(
     "/",
     passport.authenticate("jwt", { session: false }),
     (req, res) => {
       //Delete the profile
       Profile.findOneAndRemove({ user: request.user.id }).then(() => {
         //Delete the user (needs user Model)
         User.findOneAndRemove({ _id: req.user.id }).then(() =>
           res.json({ success: true })
         );
       });
     }
   );
   
   ```

   



### Creating the Post Feature

get, delete, like, unlike, add, comment, and remove comments

1. create a post model in models `post.js` 

   ```javascript
   const mongoose = require("mongoose");
   const Schema = mongoose.Schema;
   
   //Create Schema
   const PostSchema = new Schema({
     //fields for post
     user: {
       type: Schema.Types.ObjectId,
       ref: "users"
     },
     text: {
       type: String,
       required: true
     },
     //Want each post to have their name and avatar, these come FROM user object
     name: {
       type: String
     },
     avatar: {
       type: String
     },
     likes: [
       //link each like to the user that made the like
       //when they hit like,user.id will be passed in
       {
         user: {
           type: Schema.Types.ObjectId,
           ref: "users"
         }
       }
     ],
     comments: [
       {
         user: {
           type: Schema.Types.ObjectId,
           ref: "users"
         },
         text: {
           type: String,
           required: true
         },
         name: {
           type: String
         },
         avatar: {
           type: String
         },
         date: {
           type: Date,
           default: Date.now
         }
       }
     ],
     //date for the post
     date: {
       type: Date,
       default: Date.now
     }
   });
   
   module.exports = Post = mongoose.model("post", PostSchema);
   
   ```

2. update `posts.js`

   ```javascript
   const express = require("express");
   const router = express.Router();
   //bring in mongoose for database
   const mongoose = require("mongoose");
   //passport to protect the routes
   const passport = require("passport");
   //bring in post model
   const Post = require("../../models/Post");
   
   // @route   GET api/posts/test
   // @desc    Tests post route
   // @access  Public
   router.get("/test", (req, res) => res.json({ msg: "Posts Works Fine" }));
   
   // @route   POST api/posts
   // @desc    Create post
   // @access  Private
   router.post(
     "/",
     passport.authenticate("jwt", { session: false }),
     (req, res) => {
       const newPost = new Post({
         text: req.body.text,
         name: req.body.name,
         avatar: req.body.name,
         user: req.user.id
       });
   
       newPost.save().then(post => res.json(post));
     }
   );
   
   module.exports = router;
   
   ```

3. Create validation `validation/post.js`

   ```javascript
   const Validator = require("validator");
   const isEmpty = require("./is-empty");
   
   module.exports = function validatePostInput(data) {
     let errors = {};
   
     // gets tested as an empty string
     data.text = !isEmpty(data.text) ? data.text : "";
   
     if (!Validator.isLength(data.text, { min: 2, max: 300 })) {
       errors.text = "Post must be between 2 and 300 characters";
     }
   
     if (Validator.isEmpty(data.text)) {
       errors.text = "Text field is required";
     }
   
     return {
       errors,
       isValid: isEmpty(errors)
     };
   };
   
   ```

   and include it in `api/posts.js`

   `const validatePostInput = require("../../validation/post");`



### Post Create Route Setup

1. create route in `posts.js` to get all posts

2. ```javascript
   // @route   GET api/posts
   // @desc    Get posts
   // @access  Public
   router.get("/", (req, res) => {
     Post.find()
       .sort({ date: -1 })
       .then(posts => res.json(posts))
       .catch(err => res.status(404).json({ nopostsfound: "No posts found" }));
   });
   ```

2. create route to get one post

   ```javascript
   // @route   GET api/posts/:id
   // @desc    Get posts by id
   // @access  Public
   router.get("/:id", (req, res) => {
     //find by id
     Post.findById(req.params.id)
       .then(posts => res.json(posts))
       .catch(err =>
         res.status(404).json({ nopostfound: "No post found with this id" })
       );
   });
   ```

#### Delete Posts

1. add a DELETE route to `posts.js`

   ```javascript
   // @route   DELETE api/posts/:id
   // @desc    Delete posts by id
   // @access  Private
   router.delete(
     "/:id",
     passport.authenticate("jwt", { session: false }),
     (req, res) => {
       //make sure owner of post is doing the deleting, add profile model
       Profile.findOne({ user: req.user.id })
         //with this profile,
         .then(profile => {
           Post.findById(req.params.id)
             .then(post => {
               // Check for post owner: post.user is not a string, so convert it
               if (post.user.toString != req.user.id) {
                 return res
                   .status(401)
                   .json({ notauthorized: "User not authorized" });
               }
   
               //Delete post
               post.remove().then(() => res.json({ success: true }));
             })
             .catch(err =>
               res.status(404).json({ postnotfound: "No post found with this id" })
             );
         });
     }
   );
   ```

   make sure to add Profile model to header

   ```javascript
   //Add Profile model
   const Profile = require("../../models/Profile");
   ```



### Post Like & Unlike Routes Setup

1. in `posts.js` make a new post request

   ```javascript
   // @route   POST api/posts/like/:id
   // @desc    Like Post
   // @access  Private
   router.post(
     '/like/:id',
     passport.authenticate('jwt', { session: false }),
     (req, res) => {
       Post.findById(req.params.id)
         .then(post => {
           if (
             post.likes.filter(like => like.user.toString() === req.user.id)
               .length > 0
           ) {
             return res
               .status(400)
               .json({ alreadyliked: 'User already liked this post' });
           }
   
           post.likes.unshift({ user: req.user.id });
           post.save().then(post => res.json(post));
         })
         .catch(err => res.status(404).json({ postnotfound: 'No post to like' }));
     }
   );
   ```

   this section was some trouble; Postman would not pull up a post by id, although the user verification part was working. I had to rewrite it, take out the profile verification, and edit a line in `server.js` for mongoose to use the updated URL parser `  .connect(db, { useNewUrlParser: true })`.

2. For unlikes, same thing, except we splice the like out of the array of likes

   ```javascript
   // @route   POST api/posts/unlike/:id
   // @desc    Unike Post
   // @access  Private
   router.post(
     '/unlike/:id',
     passport.authenticate('jwt', { session: false }),
     (req, res) => {
       Post.findById(req.params.id)
         .then(post => {
           if (
             (post.likes.filter(
               like => like.user.toString() === req.user.id
             ).length = 0)
           ) {
             return res
               .status(400)
               .json({ alreadyliked: 'User did not like this post' });
           }
           //Get the remove index
           const removeIndex = post.likes
             .map(item => item.user.toString())
             .indexOf(req.user.id);
   
           //Splice out of the array
           post.likes.splice(removeIndex, 1);
   
           //Save
           post.save().then(post => res.json(post));
         })
         .catch(err => res.status(404).json({ postnotfound: 'No post to like' }));
     }
   );
   ```



### Adding / Removing Comments model and routes

1. add a new route 

   ```javascript
   // @route   POST api/posts/comment/:id
   // @desc    Add a comment to Post
   // @access  Private
   router.post(
     '/comment/:id',
     passport.authenticate('jwt', { session: false }),
     (req, res) => {
       Post.findById(req.params.id)
         .then(post => {
           const newComment = {
             text: req.body.text,
             name: req.body.name,
             avatar: req.body.avatar,
             user: req.user.id
           };
   
           //Push this onto the comments array
           post.comments.unshift(newComment);
   
           //Save
           post.save().then(post => res.json(post));
         })
         .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
     }
   );
   ```

   

2. validate by using `validation/post` because you you can't have a comment without a post anyways

   ```javascript
   // @route   POST api/posts/comment/:id
   // @desc    Add a comment to Post
   // @access  Private
   router.post(
     '/comment/:id',
     passport.authenticate('jwt', { session: false }),
     (req, res) => {
       const { errors, isValid } = validatePostInput(req.body);
   
       //Check validation
       if (!isValid) {
         // If any errors, send 400 w/ errors object
         return res.status(400).json(errors);
       }
       Post.findById(req.params.id)
         .then(post => {
           const newComment = {
             text: req.body.text,
             name: req.body.name,
             avatar: req.body.avatar,
             user: req.user.id
           };
   
           //Push this onto the comments array
           post.comments.unshift(newComment);
   
           //Save
           post.save().then(post => res.json(post));
         })
         .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
     }
   );
   ```

3. For deleting comments, copy the previous and make a **DELETE** request

   ```javascript
   // @route   DELETE api/posts/comment/:id/:comment_id
   // @desc    Remove comment from post
   // @access  Private
   router.delete(
     '/comment/:id/:comment_id',
     passport.authenticate('jwt', { session: false }),
     (req, res) => {
       Post.findById(req.params.id)
         .then(post => {
           if (
             post.comments.filter(
               comment => comment._id.toString() === req.params.comment_id
             ).length === 0
           ) {
             res.status(404).json({ commentnoexist: ' Comment does not exist' });
           }
   
           const removeIndex = post.comments
             .map(item => item._id.toString())
             .indexOf(req.params.comment_id);
   
           post.comments.splice(removeIndex, 1);
           post.save().then(post => res.json(post));
         })
         .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
     }
   );
   ```





## FRONT END SECTION (FINALLY)

1.