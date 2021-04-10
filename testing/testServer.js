const mongoose = require("mongoose");
const express = require("express");
const app = express();

const authRoute = require("../routes/auth");

const mongoDB = "mongodb://localhost:27017/testDatabase";
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.json());

app.use("", authRoute);

module.exports = app;
