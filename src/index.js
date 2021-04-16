const express = require("express");
const app = express();
//const mongoose = require("mongoose");
//const dotenv = require("dotenv");

//dotenv.config();

// Import routes
//const authRoute = require("../routes/auth");

// Connect to DB
/*try {
  mongoose.connect(
    process.env.DB_CONNECT,
    { useUnifiedTopology: true, useNewUrlParser: true },
    () => console.log("connected to db!")
  );
} catch (error) {
  console.log(error);
}

// Middleware
app.use(express.json());

// Route middleware?
app.use("/api/user", authRoute);
*/
app.use(express.json());

/*
app.get("/", (req, res) => {
  res.send("I am working!");
});*/

app.get("/", function (req, res) {
  res.send(__dirname + "/../index.html");
  //res.sendFile(path.join(__dirname + "/../index.html"));
});

const port = process.env.PORT || "5000";
app.listen(port, () => console.log(`Server started on Port ${port}`));
