const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

// Import routes
const authRoute = require("./routes/auth");

// Connect to DB
try {
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

app.listen(3000, () => console.log("Server running"));
