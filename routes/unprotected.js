const router = require('express').Router()
const Job = require('../models/Job')

router.get('/login', (req, res) => {
    res.render('login')
})
router.get('/loading-screen', (req, res) => {
    res.render('loading-screen')
})

router.get('/register', (req, res) => {
    res.render('register')
})

router.get('/', async (req, res) => {
    const auth = req.isAuthenticated()
    const job = await Job.find()
    const user = await req.user
    var username = ''
    if (auth) {
        username = user.name
    }
    res.render('index.ejs', { authenticated: auth, name: username, allJobs: job })
})

router.get('/available-jobs', async (req, res) => {
    const job = await Job.find()
    const auth = req.isAuthenticated()
    const user = await req.user
    var username = ''
    if (auth) {
        username = user.name
    }
    res.render('available-jobs', {
        allJobs: job,
        authenticated: auth,
        name: username
    })
})

router.get('/how-to-page', async (req, res) => {
    const user = await req.user
    const auth = req.isAuthenticated()
    var username = ''
    if (auth) {
        username = user.name
    }
    res.render('how-to-page', { authenticated: auth, name: username })
})

router.get('/about-us', async (req, res) => {
    const user = await req.user
    const auth = req.isAuthenticated()
    var username = ''
    if (auth) {
        username = user.name
    }
    res.render('about-us', { authenticated: auth, name: username })
})

router.get('/contact-us', async (req, res) => {
    const user = await req.user
    const auth = req.isAuthenticated()
    var username = ''
    if (auth) {
        username = user.name
    }
    res.render('contact-us', { authenticated: auth, name: username })
})

router.get('/terms-conditions', async (req, res) => {
    const user = await req.user
    const auth = req.isAuthenticated()
    var username = ''
    if (auth) {
        username = user.name
    }
    res.render('terms-conditions', { authenticated: auth, name: username })
})



module.exports = router
