const router = require('express').Router()
const Job = require('../models/Job')
const User = require('../models/User')
const googleService = require('../googleServices')
const { checkAuthenticated } = require('../middleware/auth.mw')
const localStorage = require('../middleware/storage.mw')

const service = new googleService()

router.get('/create-job', checkAuthenticated, async (req, res) => {
    const user = await req.user
    const username = user.name
    res.render('create-job', { name: username })
})

router.get('/temp-job-page', checkAuthenticated, async (req, res) => {
    const user = await req.user
    const userEmail = user.email
    const jobs = await Job.find({ emailOwner: userEmail })
    res.render('temp-job-page', { userJobs: jobs })
})

router.get('/dashboard', checkAuthenticated, async (req, res) => {
    const user = await req.user
    const username = user.name
    const userEmail = user.email
    const dateJoined = user.createdAt
    const jobs = await Job.find({ emailOwner: userEmail })
    const acceptedJobs = await Job.find({ emailLabellers: userEmail })
    res.render('dashboard', {
        userJobs: jobs,
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

router.delete('/dashboard', checkAuthenticated, async (req, res) => {
    const id = req.body.id
    const job = await Job.findById(id)
    const imgArr = job.images
    res.send(imgArr)
    service.deleteFiles(imgArr).then(async (res) => {
        const deleted = await Job.deleteOne({ _id: id })
        if (deleted) {
            res.send('deleted')
        } else {
            res.send('bruh')
        }
    })
})

router.patch('/user-profile', localStorage.single('avatar'), async (req, res) => {
    const user = await req.user
    const userID = user._id
    const dbUser = await User.findOne({ _id: userID })

    const name = req.body.name
    const password = req.body.password

    const imgPath = 'public/uploads/'
    const localImg = String(fs.readdirSync(imgPath))

    service
        .uploadFile(localImg, imgPath)
        .then((result) => {
            const driveImg = `https://drive.google.com/uc?id=${result.data.id}`

            dbUser.name = name

            fs.rm(imgPath + result.data.name, (err) => {
                if (err) {
                    console.log(err)
                }
            })

            Job.findOneAndUpdate({ _id: savedJob._id }, { $set: { images: driveImgArr } }, (err, ans) => {
                if (err) {
                    console.log(err)
                }
            })
            console.log('Done uploading all images')
            res.redirect('/dashboard')
        })
        .catch((e) => {
            console.log(e)
        })
})

router.post('/cancelJob', checkAuthenticated, async (req, res) => {
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
    console.log(updated)
    res.redirect('/dashboard')
})

router.get('/user-profile', checkAuthenticated, async (req, res) => {
    const user = await req.user
    const username = user.name
    res.render('user-profile', { name: username })
})

module.exports = router
