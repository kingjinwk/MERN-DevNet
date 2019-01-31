const express = require("express");
const mongoose = require("mongoose");

const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");

const app = express();

//DB Config
const db = require("./config/keys").mongoURI;

// Connect to MongoDB thru Mongoose
mongoose
  .connect(db)
  //.then = if it connects successfully
  .then(() => console.log("MongoDB Connected"))
  //catches if login had error (wrong pw in keys.js or something)
  .catch(err => console.log(err));

//requesy and response object
app.get("/", (req, res) => res.send("Hello Me"));

// Use Routes
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

const port = process.env.PORT || 5000;

//NEW ES6: arrow functions, use backtick `` to add variable with string
app.listen(port, () => console.log(`Server running on port ${port}`));
