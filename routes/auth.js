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

router.get('/', (req, res) => {
    res.render('index')
})

router.get('/login', (req, res) => {
    res.render('login')
})
router.get('/register', (req, res) => {
    res.render('register')
})

router.get('/about-us', (req, res) => {
    res.render('about-us')
})

router.get('/contact-us', (req, res) => {
    res.render('contact-us')
})

router.get('/terms-conditions', (req, res) => {
    res.render('terms-conditions')
})

router.get('/availableJobs', (req, res) => {
    res.render('availableJobs')
})

router.get('/ad-listing', (req, res) => {
    res.render('ad-listing')
})

router.get('/dashboard', (req, res) => {
    res.render('dashboard')
})
router.get('/howtopage', (req, res) => {
    res.render('howtopage')
})

router.get('/user-profile', (req, res) => {
    res.render('user-profile')
})

module.exports = router
