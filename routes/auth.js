const router = require('express').Router()
const passport = require('passport')
const initialize = require('../passport-config')
const User = require('../models/User')
const Job = require('../models/Job')
const fs = require('fs')
const { checkAuthenticated } = require('../middleware/auth.mw')
const localStorage = require('../middleware/storage.mw')
const googleService = require('../googleServices')
const LabellingFragment = require('../LabellingFragment')
const Labelling = require('../models/Labelling')

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

async function setJobFragments(jobId, numLabellers, imgUrlArr) {
    const fragmentArr = []
    const imgUrls = imgUrlArr
    const equalAmount = Math.floor(imgUrls.length / numLabellers)
    var currentUrl = 0
    for (let i = 0; i < numLabellers; i++) {
        let imgFragment
        if (i == numLabellers - 1) {
            imgFragment = imgUrls.slice(currentUrl)
        } else {
            imgFragment = imgUrls.slice(currentUrl, currentUrl + equalAmount)
            currentUrl += equalAmount
        }

        const fragment = new LabellingFragment(null, imgFragment)
        fragmentArr.push(fragment.getFragment())
    }
    const labelling = new Labelling({
        jobId: jobId,
        labellersArr: fragmentArr
    })

    await labelling.save()
}

router.post('/create-job', checkAuthenticated, localStorage.array('image'), async (req, res) => {
    try {
        const title = req.body.title
        const description = req.body.description
        const labels = req.body.labels
        const credits = req.body.credits
        const maxNumLabellers = req.body.labellers
        const emailOwner = await req.user

        const job = await new Job({
            title: title,
            description: description,
            credits: credits,
            labels: labels,
            emailOwner: emailOwner.email,
            maxNumLabellers: maxNumLabellers
        })

        const savedJob = await job.save()
        const imgPath = 'public/uploads/'
        const localImgArr = fs.readdirSync(imgPath)
        const driveImgArr = []

        if (localImgArr.length == 0) {
            throw 'No images provided.'
        }

        const results = await service.uploadFiles(localImgArr, imgPath)

        results.forEach((result) => {
            driveImgArr.push(`https://drive.google.com/uc?id=${result.data.id}`)
            fs.rmSync(imgPath + result.data.name)
        })

        await Job.findOneAndUpdate({ _id: savedJob._id }, { $set: { images: driveImgArr } })

        res.redirect('/dashboard')
        setJobFragments(savedJob._id, savedJob.maxNumLabellers, driveImgArr)
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
            Labelling.updateOne(
                {
                    jobId: jobId,
                    labellersArr: {
                        $elemMatch: { email: null }
                    }
                },
                {
                    $set: { 'labellersArr.$.email': userEmail }
                }
            )
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
