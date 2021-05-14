const router = require('express').Router()
const Job = require('../models/Job')
const { checkAuthenticated } = require('../middleware/auth.mw')
const googleService = require('../googleServices')

const service = new googleService()

router.get('/create-job', async (req, res) => {
    res.render('create-job')
})

router.get('/temp-job-page', async (req, res) => {
    const user = await req.user
    userEmail = user.email
    const job = await Job.find({ emailOwner: userEmail })
    res.render('temp-job-page', { userJobs: job })
})

router.get('/secret-page', (req, res) => {
    res.send('bruh')
})

router.delete('/dashboard', async (req, res) => {
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

router.get('/dashboard', checkAuthenticated, (req, res) => {
    res.render('dashboard')
})

router.get('/user-profile', (req, res) => {
    res.render('user-profile')
})

module.exports = router
