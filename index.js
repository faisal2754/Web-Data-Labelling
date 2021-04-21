const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const { default: axios } = require("axios");
const authRoute = require("./routes/auth")
const flash = require('express-flash')
const session = require('express-session');
const passport = require("passport");
// if(process.env.NODE_ENV !== 'production'){
//   require('dotenv').config()
// }

const app = express();
var x = path.join(__dirname, "public")
const port = process.env.PORT || 3000

app.set("view engine", "ejs");
app.use(express.static(x));
app.use(express.urlencoded({ extended: false}))
//app.use(bodyParser.urlencoded({ extended: false }));
app.use("", authRoute)
app.use(flash())
app.use(session({
    secret: 'bruh',
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session()  )

app.get("/", (req, res) => {
    res.render("index"); // index refers to index.ejs
});

app.listen(port, () => {
  console.log("server started on port 3000");
});









// app.post("/login", (req, res) =>{
//     const {name, password} = req.body;

//     if (name === "admin" && password === "admin"){
//         res.render("success", {
//             username: name,
//         });
//     } else {
//         res.render("register");
//     }
// })

// //Following section contians all the routes to the different pages and renders them

app.get("/login", (req, res) => {
  res.render("login");
})

app.get("/register", (req, res) => {
  res.render("register");
})

app.get("/contact-us", (req, res) => {
  res.render("contact-us");
});

app.get("/about-us", (req, res) => {
  res.render("about-us");
})

app.get("/terms-conditions", (req, res) => {
  res.render("terms-conditions");
})

app.get("/availableJobs", (req, res) => {
  res.render("availableJobs");
})

app.get("/ad-listing", (req, res) => {
  res.render("ad-listing");
})

app.get("/dashboard", (req, res) => {
  res.render("dashboard");
})
app.get("/howtopage", (req, res) => {
  res.render("howtopage");
})

app.get("/user-profile", (req, res) => {
  res.render("user-profile")
})

app.get("/", (req, res) => {
  res.render("index"); // index refers to index.ejs
});

