const router = require('express').Router()
const Job = require('../models/Job')
const User = require('../models/User')
const googleService = require('../googleServices')
const { checkAuthenticated } = require('../middleware/auth.mw')
const localStorage = require('../middleware/storage.mw')
const fs = require('fs')

const service = new googleService()

router.get('/create-job', checkAuthenticated, async (req, res) => {
    const user = await req.user
    const username = user.name
    res.render('create-job', { name: username })
})

router.get('/dashboard', checkAuthenticated, async (req, res) => {
    const user = await req.user
    const username = user.name
    const userAvatar = user.avatar
    const userEmail = user.email
    const dateJoined = user.createdAt
    const jobs = await Job.find({ emailOwner: userEmail })
    const acceptedJobs = await Job.find({ emailLabellers: userEmail })
    res.render('dashboard', {
        userJobs: jobs,
        avatar: userAvatar,
        acceptedJobs: acceptedJobs,
        name: username,
        dateJoined
    })
})

router.get('/accepted-jobs', checkAuthenticated, async (req, res) => {
    const user = await req.user
    const username = user.name
    const userEmail = user.email
    const dateJoined = user.createdAt
    const jobs = await Job.find({ emailOwner: userEmail })
    const acceptedJobs = await Job.find({ emailLabellers: userEmail })
    res.render('accepted-jobs', {
        userJobs: jobs,
        acceptedJobs: acceptedJobs,
        name: username,
        dateJoined
    })
})

router.get('/secret-page', checkAuthenticated, (req, res) => {
    res.send('bruh')
})

router.post('/dashboard', checkAuthenticated, async (req, res) => {
    const id = req.body.id

    try {
        const job = await Job.findById(id)
        const imgArr = job.images
        await service.deleteFiles(imgArr)
        const deleted = await Job.deleteOne({ _id: id })

        res.redirect('/dashboard')
    } catch {
        res.redirect(400, '/')
    }
})

router.post('/user-profile', checkAuthenticated, localStorage.single('image'), async (req, res) => {
    try {
        const user = await req.user
        const userID = user._id
        const dbUser = await User.findOne({ _id: userID })

        const name = req.body.name
        const password = req.body.password

        const imgPath = 'public/uploads/'
        const localImg = String(fs.readdirSync(imgPath))

        const result = await service.uploadFile(localImg, imgPath)

        const driveImg = `https://drive.google.com/uc?id=${result.data.id}`

        dbUser.name = name
        dbUser.password = password
        dbUser.avatar = driveImg

        await dbUser.save()

        fs.rmSync(imgPath + result.data.name)

        res.redirect('/dashboard')
    } catch {
        res.redirect(400, '/')
    }
})

router.post('/cancelJob', checkAuthenticated, async (req, res) => {
    try {
        const id = req.body.jobId
        const user = await req.user
        const userEmail = user.email
        const updated = await Job.findOneAndUpdate(
            { _id: id },
            {
                $pull: {
                    emailLabellers: userEmail
                }
            }
        )
        res.redirect('/dashboard')
    } catch {
        res.redirect(400, '/')
    }
})

router.get('/user-profile', checkAuthenticated, async (req, res) => {
    const user = await req.user
    const username = user.name
    const userAvatar = user.avatar
    const userEmail = user.email
    res.render('user-profile', { name: username, email: userEmail, avatar: userAvatar })
})

module.exports = router
