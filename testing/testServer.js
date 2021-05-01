const mongoose = require("mongoose");
const express = require("express");
const flash = require("express-flash");
const session = require("express-session");
const passport = require("passport");
const app = express();

const auth = require("../routes/auth");

const mongoDB = "mongodb://localhost:27017/testDatabase";
mongoose.connect(mongoDB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
});

app.use(express.json());
app.use(flash());

//initialise passport
app.use(passport.initialize());
app.use(passport.session());

app.use("", auth);

module.exports = app;
