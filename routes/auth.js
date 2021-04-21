const router = require("express").Router()
const passport = require('passport')
const initialize = require('../passport-config')


initialize(passport, 
    email => users.find(user => user.email === email)
)

const users = [{ email: 'a@a.com', password: 'Testing1' }]


router.post('/login', passport.authenticate('local', {
    successRedirect: 'about-us',
    failureRedirect: 'login',
    failureFlash: true
}))

router.post("/register", (req, res) => {
    try{
        users.push({
            email: req.body.email,
            password: req.body.password
        })
        console.log(users)
        res.redirect('about-us')
    }catch{
        res.redirect('/')
    }   
})


router.get("/register", (req,res) =>{
    res.render("register");
})
  
router.get("/about-us", (req,res) => {
    res.render("about-us");
})

router.get("/login", (req,res) => {
    res.render("login");
})

module.exports = router;
  



