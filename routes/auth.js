const router = require('express').Router()
const passport = require('passport')
const initialize = require('../passport-config')
const User = require('../models/User')
const Job = require('../models/Job')
const fs = require('fs')
const { checkAuthenticated } = require('../middleware/auth.mw')
const localStorage = require('../middleware/storage.mw')
const googleService = require('../googleServices')

const service = new googleService()

initialize(passport, async (email) => {
    // returning user with logged in email
    const user = await User.findOne({ email: email })
    return user
})

router.post('/register', async (req, res) => {
    try {
        const name = req.body.name
        const email = req.body.email
        const password = req.body.password

        if (!name || !email || !password) {
            throw 'user properties not defined.'
        }

        const user = new User({
            name: name,
            email: email,
            password: password
        })

        const savedUser = await user.save()
        res.render('login', { status: true })
    } catch (e) {
        res.status(400).render('register', { error: true })
    }
})

router.post(
    '/login',
    passport.authenticate('local', { successRedirect: 'dashboard', failureRedirect: 'login', failureFlash: true })
)

router.post('/create-job', checkAuthenticated, localStorage.array('image'), async (req, res) => {
    const title = req.body.title
    const description = req.body.description
    const labels = req.body.labels
    const credits = req.body.credits
    const emailOwner = await req.user

    const job = await new Job({
        title: title,
        description: description,
        credits: credits,
        labels: labels,
        emailOwner: emailOwner.email
    })

    try {
        const savedJob = await job.save()
        const imgPath = 'public/uploads/'
        const localImgArr = fs.readdirSync(imgPath)
        const driveImgArr = []

        if (localImgArr.length == 0) {
            throw 'No images provided.'
        }

        service
            .uploadFiles(localImgArr, imgPath)
            .then(async (results) => {
                results.forEach((result) => {
                    driveImgArr.push(`https://drive.google.com/uc?id=${result.data.id}`)
                    fs.rm(imgPath + result.data.name, (err) => {
                        if (err) {
                            console.log(err)
                        }
                    })
                })
                await Job.findOneAndUpdate({ _id: savedJob._id }, { $set: { images: driveImgArr } })
                res.redirect('/dashboard')
            })
            .catch((e) => {
                console.log(e)
                res.redirect(400, '/')
            })
    } catch {
        res.redirect(400, '/')
    }
})

router.post('/acceptJob', async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const user = await req.user
            const userEmail = user.email
            const jobId = req.body.jobId

            const result = await Job.findByIdAndUpdate(
                //Identifies which jobs we are adding to
                jobId,
                {
                    //Add to set insures that a user doesn't get added to a job multiple times
                    $addToSet: {
                        emailLabellers: userEmail
                    }
                }
            )
            res.redirect('/dashboard')
        } catch {
            res.redirect(400, '/login')
        }
    } else {
        res.redirect(400, '/login')
    }
})

router.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/')
})

module.exports = router
