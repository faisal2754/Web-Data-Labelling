const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const { default: axios } = require("axios");

const app = express();
var x = path.join(__dirname, "public")
const port = process.env.PORT || 3000

app.set("view engine","ejs");
app.use(express.static(x));
app.use(bodyParser.urlencoded({ extended: false }));

// app.post("/login", (req, res) =>{
//     const {name, password} = req.body;

//     if (name === "admin" && password === "admin"){
//         res.render("success", {
//             username: name,
//         });
//     } else {
//         res.render("failure");
//     }
// })

//Following section contians all the routes to the different pages and renders them

app.get("/login", (req,res) =>{
  res.render("login");
})

app.get("/register", (req,res) =>{
  res.render("register");
})

app.get("/contact-us", (req,res) =>{
  res.render("contact-us");
});

app.get("/about-us", (req,res) => {
  res.render("about-us");
})

app.get("/terms-conditions", (req,res) =>{
  res.render("terms-conditions");
})

app.get("/category",(req,res) =>{
  res.render("category");
})

app.get("/ad-listing", (req,res) =>{
  res.render("ad-listing");
})

app.get("/dashboard", (req,res) =>{
  res.render("dashboard");
})

app.get("/user-profile", (req,res) =>{
  res.render("user-profile")
})

app.get("/", (req, res) => {
    res.render("index"); // index refers to index.ejs
});

app.listen(port, () => {
  console.log("server started on port 3000");
});