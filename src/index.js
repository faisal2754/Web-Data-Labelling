const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
const mongoose = require("mongoose");
//const dotenv = require("dotenv");

//dotenv.config();

// Import routes
const authRoute = require("../routes/auth");

(async () => {
  // Connect to DB
  try {
    await mongoose.connect(
      process.env.DB_CONNECT,
      { useUnifiedTopology: true, useNewUrlParser: true },
      () => console.log("connected to db!")
    );
  } catch (error) {
    console.log(error);
  }

  //safetly remove later
  mongoose.connection.on("error", (err) => {
    console.log(err);
  });
  //end of safety
})();

// Middleware
app.use(express.json());

// Route middleware?
app.use("", authRoute);
app.use(express.static(__dirname));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/index.html"));
});

const port = process.env.PORT || "5000";
app.listen(port, () => console.log(`Server started on Port ${port}`));
