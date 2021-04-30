const router = require('express').Router()
const { isAuthenticated } = require('../middleware/auth.mw')

router.get('/login', (req, res) => {
    res.render('login')
})

router.get('/register', (req, res) => {
    res.render('register')
})

router.get('/', isAuthenticated('index.ejs'), (req, res) => {
    res.render('index.ejs', { authenticated: true })
})

router.get('/available-jobs', isAuthenticated('available-jobs'), (req, res) => {
    res.render('available-jobs', { authenticated: true })
})

router.get('/how-to-page', isAuthenticated('how-to-page'), (req, res) => {
    res.render('how-to-page', { authenticated: true })
})

router.get('/about-us', isAuthenticated('about-us'), (req, res) => {
    res.render('about-us', { authenticated: true })
})

router.get('/contact-us', isAuthenticated('contact-us'), (req, res) => {
    res.render('contact-us', { authenticated: true })
})

router.get('/terms-conditions', isAuthenticated('terms-conditions'), (req, res) => {
    res.render('terms-conditions', { authenticated: true })
})

module.exports = router
