const router = require('express').Router()
const Job = require('../models/Job')
const googleService = require('../googleServices')
const { checkAuthenticated } = require('../middleware/auth.mw')

const service = new googleService()

router.get('/create-job', checkAuthenticated, async (req, res) => {
    const user = await req.user
    username = user.name
    res.render('create-job', { name: username })
})

router.get('/temp-job-page', checkAuthenticated, async (req, res) => {
    const user = await req.user
    userEmail = user.email
    const job = await Job.find({ emailOwner: userEmail })
    res.render('temp-job-page', { userJobs: job })
})

router.get('/dashboard', checkAuthenticated, async (req, res) => {
    const user = await req.user
    username = user.name
    userEmail = user.email
    dateJoined = user.createdAt
    const job = await Job.find({ emailOwner: userEmail })
    const acceptedJob = await Job.find({ emailLabellers: userEmail })
    res.render('dashboard', {userJobs: job, acceptedJobs: acceptedJob, name: username, dateJoined })
})

router.get('/accepted-jobs', checkAuthenticated, async (req, res) => {
    const user = await req.user
    username = user.name
    userEmail = user.email
    dateJoined = user.createdAt
    const job = await Job.find({ emailOwner: userEmail })
    const acceptedJob = await Job.find({ emailLabellers: userEmail })
    console.log(acceptedJob)
    res.render('accepted-jobs', {userJobs: job, acceptedJobs: acceptedJob, name: username, dateJoined })
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

router.get('/user-profile', checkAuthenticated, async (req, res) => {
    const user = await req.user
    username = user.name
    res.render('user-profile', { name: username })
})

module.exports = router
