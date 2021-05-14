const router = require('express').Router()
const passport = require('passport')
const initialize = require('../passport-config')
const User = require('../models/User')
const Job = require('../models/Job')
const { upload } = require('../uploader')
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
    const name = req.body.name
    const email = req.body.email
    const password = req.body.password

    const user = new User({
        name: name,
        email: email,
        password: password,
    })

    try {
        const error = user.validateSync()

        if (error) {
            throw new Error('Invalid user')
        }

        const savedUser = await user.save()
        res.redirect('/login')
    } catch (e) {
        res.redirect('/register')
    }
})

router.post(
    '/login',
    passport.authenticate('local', {
        successRedirect: 'dashboard',
        failureRedirect: 'login',
        failureFlash: true,
    })
)

router.post(
    '/create-job',
    checkAuthenticated,
    localStorage.array('image'),
    async (req, res) => {
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
            emailOwner: emailOwner.email,
        })

        try {
            const savedJob = await job.save()
            const imgPath = 'public/uploads/'
            const localImgArr = fs.readdirSync(imgPath)
            const driveImgArr = []
            service
                .uploadFiles(localImgArr, imgPath)
                .then((results) => {
                    results.forEach((result) => {
                        driveImgArr.push(
                            `https://drive.google.com/uc?id=${result.data.id}`
                        )
                        fs.rm(imgPath + result.data.name, (err) => {
                            if (err) {
                                console.log(err)
                            }
                        })
                    })
                    Job.findOneAndUpdate(
                        { _id: savedJob._id },
                        { $set: { images: driveImgArr } },
                        (err, ans) => {
                            if (err) {
                                console.log(err)
                            }
                        }
                    )
                    console.log('Done uploading all images')
                    res.redirect('/dashboard')
                })
                .catch((e) => {
                    console.log(e)
                })
        } catch (e) {
            console.log(e)
            res.redirect('/')
        }
    }
)

router.delete('/logout', (req, res) => {
    req.logOut()
    res.send('/')
})

module.exports = router
