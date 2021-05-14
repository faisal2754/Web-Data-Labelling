if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const express = require('express')
const path = require('path')
const authRoute = require('./routes/auth')
const protectedRoute = require('./routes/protected')
const unprotectedRoute = require('./routes/unprotected')
const flash = require('express-flash')
const session = require('express-session')
const passport = require('passport')
const app = express()
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const fs = require('fs')
const googleService = require('./googleServices')

const gDriveFolderId = '14yJctoyNoX6ivWJre9dXLLgbUVnNRvpZ' //make environment variable

const service = new googleService()

const imgUrls = [
    'https://drive.google.com/uc?id=1W52GmYYzA9qDvurEtmtpCtKwz2_FNozR',
    'https://drive.google.com/uc?id=1N7PnhILqjeSCyBtDuMVAtJly-qo7ud06',
]

// service.deleteFiles(imgUrls).then((res) => {
//     console.log(res)
// })

// service.downloadFile('1jxcXbkj3qL15TCbcsyA6DN9cj_uDeQb_')
// service.getFile('1rOBWa46CG49P0kbd_3SI_ercxicL_ypp')

/* possibly useful google drive api code 
function listFiles(auth) {
    const drive = google.drive({ version: 'v3', auth })
    getList(drive, '')
}
function getList(drive, pageToken) {
    drive.files.list(
        {
            corpora: 'user',
            pageSize: 10,
            //q: "name='elvis233424234'",
            pageToken: pageToken ? pageToken : '',
            fields: 'nextPageToken, files(*)',
        },
        (err, res) => {
            if (err) return console.log('The API returned an error: ' + err)
            const files = res.data.files
            if (files.length) {
                console.log('Files:')
                processList(files)
                if (res.data.nextPageToken) {
                    getList(drive, res.data.nextPageToken)
                }

                // files.map((file) => {
                //     console.log(`${file.name} (${file.id})`);
                // });
            } else {
                console.log('No files found.')
            }
        }
    )
}
function processList(files) {
    console.log('Processing....')
    files.forEach((file) => {
        // console.log(file.name + '|' + file.size + '|' + file.createdTime + '|' + file.modifiedTime);
        console.log(file)
    })
}
*/

//port and path
const staticPath = path.join(__dirname, 'public')
const port = process.env.PORT || 3000

//use ejs and static files
app.set('view engine', 'ejs')
app.use(express.static(staticPath))
app.use(express.urlencoded({ extended: false }))

//connect to mongodb
async function connectDB() {
    try {
        await mongoose.connect(
            process.env.DB_CONNECT,
            {
                useUnifiedTopology: true,
                useNewUrlParser: true,
                useFindAndModify: false,
                useCreateIndex: true,
            },
            () => console.log('connected to db!')
        )
    } catch (error) {
        console.log(error)
    }

    //safety starts
    mongoose.connection.on('error', (err) => {
        console.log(err)
    })
    //end of safety
}
connectDB()

//middleware
app.use(methodOverride('_method'))
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
)
app.use(flash())

//initialise passport
app.use(passport.initialize())
app.use(passport.session())

protectedRoute.use(checkAuthenticated)

//routes
app.use('', authRoute)
app.use('', protectedRoute)
app.use('', unprotectedRoute)

//server listen
app.listen(port, () => {
    console.log(`server started on port ${port}`)
})
