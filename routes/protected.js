const router = require('express').Router()
const Job = require('../models/Job')
const User = require('../models/User')
const googleService = require('../googleServices')
const { checkAuthenticated } = require('../middleware/auth.mw')
const localStorage = require('../middleware/storage.mw')
const fs = require('fs')
const Labelling = require('../models/Labelling')

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
    const userAvatar = user.avatar
    const userEmail = user.email
    const dateJoined = user.createdAt
    const jobs = await Job.find({ emailOwner: userEmail })
    const acceptedJobs = await Job.find({ emailLabellers: userEmail })
    res.render('accepted-jobs', {
        userJobs: jobs,
        avatar: userAvatar,
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

        let name = req.body.name
        if (!name) {
            name = user.name
        }

        let password = req.body.password
        if (!password) {
            password = user.password
        }

        if (req.file || req.body.file) {
            const imgPath = 'public/uploads/'
            const localImg = String(fs.readdirSync(imgPath))

            const result = await service.uploadFile(localImg, imgPath)
            const driveImg = `https://drive.google.com/uc?id=${result.data.id}`
            dbUser.avatar = driveImg

            fs.rm(imgPath + result.data.name, (err) => {
                if (err) {
                    console.log(err)
                }
            })
        }

        dbUser.name = name
        dbUser.password = password

        await dbUser.save()

        res.redirect('/dashboard')
    } catch (e) {
        res.redirect('/')
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

router.post('/job-label-update', checkAuthenticated, async (req, res) => {
    //init
    const user = await req.user
    const reqParams = JSON.parse(JSON.stringify(req.body))
    const imgIndex = reqParams.imgIndex - 1
    const label = reqParams.radio
    var jobId = reqParams.currentUrl
    jobId = jobId.substring(jobId.lastIndexOf('/') + 1)
    const labellingData = await Labelling.findOne({
        jobId: jobId
    })
    var imgUrl = ''
    let x
    for (let i = 0; i < labellingData.labellersArr.length; i++) {
        if (labellingData.labellersArr[i].email === user.email) {
            imgUrl = labellingData.labellersArr[i].labelMapping[imgIndex].imgUrl
            labellingData.labellersArr[i].labelMapping[imgIndex].label = label
            x = i
            break
        }
    }

    //db update
    labellingData.markModified('labellersArr')
    labellingData.save()

    res.redirect('/do-job/' + jobId)
})

router.get('/do-job/:id', async (req, res) => {
    const user = await req.user

    const labellingData = await Labelling.findOne({
        jobId: req.params.id
    })

    const jobData = await Job.findOne({
        _id: req.params.id
    })

    const jobLabels = jobData.labels

    let fragmentData

    for (let i = 0; i < labellingData.labellersArr.length; i++) {
        if (labellingData.labellersArr[i].email === user.email) {
            fragmentData = labellingData.labellersArr[i].labelMapping
            break
        }
    }

    const auth = req.isAuthenticated()
    var username = ''
    if (auth) {
        username = user.name
    }
    res.render('do-job', { authenticated: auth, name: username, labellingData: fragmentData, labels: jobLabels })
})

module.exports = router
