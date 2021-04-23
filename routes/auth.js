const router = require('express').Router()
const passport = require('passport')
const initialize = require('../passport-config')
const User = require('../models/User')

initialize(passport, getUserByEmail)

async function getUserByEmail(email) {
    const user = await User.findOne({ email: email })
    return user
}

router.get('/secret-page', checkAuthenticated, (req, res) => {
    res.send('bruh')
})

router.get('/', isAuthenticated('index.ejs'), (req, res) => {
    res.render('index.ejs', {authenticated: true});
})

function isAuthenticated(routeName) {
    return function(req, res, next) {
        if (req.isAuthenticated()) {
            next()
        }else {
            res.render(routeName, {authenticated: false});
        }
    }
}

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    } else {
        res.redirect('/')
    }
}

router.post(
    '/login',
    passport.authenticate('local', {
        successRedirect: 'about-us',
        failureRedirect: 'login',
        failureFlash: true
    })
)

router.post('/register', async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    const user = new User({
        email: email,
        password: password
    })
    try {
        const savedUser = await user.save()
        console.log(savedUser)
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
})

router.get('/login', (req, res) => {
    res.render('login')
})

router.get('/register', (req, res) => {
    res.render('register')
})

router.get('/about-us', isAuthenticated('about-us'), (req, res) => {
    res.render('about-us', {authenticated: true})
})

router.get('/contact-us', isAuthenticated('contact-us'), (req, res) => {
    res.render('contact-us', {authenticated: true})
})

router.get('/terms-conditions', isAuthenticated('terms-conditions'), (req, res) => {
    res.render('terms-conditions', {authenticated: true})
})

router.get('/availableJobs', isAuthenticated('availableJobs'), (req, res) => {
    res.render('availableJobs', {authenticated: true})
})

router.get('/ad-listing', (req, res) => {
    res.render('ad-listing')
})

router.get('/dashboard', (req, res) => {
    res.render('dashboard')
})

router.get('/howtopage', isAuthenticated('howtopage'), (req, res) => {
    res.render('howtopage', {authenticated: true})
})

router.get('/user-profile', (req, res) => {
    res.render('user-profile')
})

router.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/')
})

module.exports = router
