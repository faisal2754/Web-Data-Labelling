const router = require('express').Router()
const { isAuthenticated } = require('../middleware/auth.mw')
const Job = require('../models/Job')

router.get('/login', (req, res) => {
    res.render('login')
})

router.get('/register', (req, res) => {
    res.render('register')
})

router.get('/', isAuthenticated('index.ejs'), async (req, res) => {
    const user = await req.user
    username = user.name
    res.render('index.ejs', { authenticated: true, name: username })
})

router.get('/available-jobs', async (req, res) => {
    const job = await Job.find()
    const auth = req.isAuthenticated()
    var username =  ""
    if(auth){
        username = req.user.name
    }
    res.render('available-jobs', { allJobs: job, authenticated: auth, name: username })
})

router.get('/how-to-page', isAuthenticated('how-to-page'), async (req, res) => {
    const user = await req.user
    username = user.name
    res.render('how-to-page', { authenticated: true, name: username })
})

router.get('/about-us', isAuthenticated('about-us'), async (req, res) => {
    const user = await req.user
    username = user.name
    res.render('about-us', { authenticated: true, name: username })
})

router.get('/contact-us', isAuthenticated('contact-us'), async (req, res) => {
    const user = await req.user
    username = user.name
    res.render('contact-us', { authenticated: true, name: username })
})

router.get('/terms-conditions', isAuthenticated('terms-conditions'), async (req, res) => {
    const user = await req.user
    username = user.name
    res.render('terms-conditions', { authenticated: true, name: username})
})

module.exports = router
