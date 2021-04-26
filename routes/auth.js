const router = require('express').Router()
const passport = require('passport')
const initialize = require('../passport-config')
const User = require('../models/User')
const Job = require('../models/Job')
const multer = require('multer')

initialize(passport, getUserByEmail)



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        const { originalname } = file
        cb(null, originalname)
    }
})

const upload = multer({ storage: storage })

async function getUserByEmail(email) {
    const user = await User.findOne({ email: email })
    return user
}

router.get('/secret-page', checkAuthenticated, (req, res) => {
    res.send('bruh')
})

router.get('/', isAuthenticated('index.ejs'), (req, res) => {
    res.render('index.ejs', { authenticated: true })
})

function isAuthenticated(routeName) {
    return function (req, res, next) {
        if (req.isAuthenticated()) {
            next()
        } else {
            res.render(routeName, { authenticated: false })
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
        successRedirect: 'dashboard',
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

router.post('/create-job', checkAuthenticated, upload.array('image'), async (req, res) => {
    const title = req.body.title
    const description = req.body.description
    const labels = req.body.labels
    const credits = req.body.credits
    const images = ['fhsdifhsi', 'bfsbfk']
    const emailOwner = await req.user

    // console.log(typeof req.body)
    // console.log(typeof req.body.file)

    const job = await new Job({
        title: title,
        description: description,
        credits: credits,
        labels: labels,
        images: images,
        emailOwner: emailOwner.email
    })

    try {
        const savedJob = await job.save()
        console.log(savedJob)
        //res.redirect('/login')
        res.send('job created')
    } catch {
        //res.redirect('/register')
        res.send('bruh ???')
    }
    //Start moving images to drive async.
})

router.get('/login', (req, res) => {
    res.render('login')
})

router.get('/register', (req, res) => {
    res.render('register')
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

router.get('/available-jobs', isAuthenticated('available-jobs'), (req, res) => {
    res.render('available-jobs', { authenticated: true })
})

router.get('/job-listing', checkAuthenticated, (req, res) => {
    res.render('job-listing')
})

router.get('/dashboard', (req, res) => {
    res.render('dashboard')
})

router.get('/how-to-page', isAuthenticated('how-to-page'), (req, res) => {
    res.render('how-to-page', { authenticated: true })
})

router.get('/user-profile', (req, res) => {
    res.render('user-profile')
})

router.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/')
})

module.exports = router
