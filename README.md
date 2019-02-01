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