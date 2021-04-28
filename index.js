if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const { default: axios } = require('axios')
const authRoute = require('./routes/auth')
const flash = require('express-flash')
const session = require('express-session')
const passport = require('passport')
const app = express()
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const https = require('https')
const fs = require('fs')
const async = require('async')

//port and path
var x = path.join(__dirname, 'public')
const port = process.env.PORT || 3000

//use ejs and static files
app.set('view engine', 'ejs')
app.use(express.static(x))
app.use(express.urlencoded({ extended: false }))
//app.use(bodyParser.urlencoded({ extended: false }));

//connect to mongodb
async function connectDB() {
    try {
        await mongoose.connect(process.env.DB_CONNECT, { useUnifiedTopology: true, useNewUrlParser: true }, () =>
            console.log('connected to db!')
        )
    } catch (error) {
        console.log(error)
    }

    //safetly remove later
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
        saveUninitialized: false
    })
)
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())

//routes
app.use('', authRoute)

//dropbox api test
const upload = function () {
    fs.readdir('uploads', (err, data) => {
        data.forEach(async (file) => {
            const path = '/Upload/' + file
            const req = reqBuilder(path)
            req.write(file)
            req.end()
        })
    })
}

const upload2 = function () {
    fs.readFile('uploads/red.jpg', function (err, data) {
        const path = '/Upload/red5.jpg'
        const req = reqBuilder(path)
        req.write(data)
        req.end()
    })
}

//upload()

function reqBuilder(path) {
    const req = https.request(
        'https://content.dropboxapi.com/2/files/upload',
        {
            method: 'POST',
            headers: {
                Authorization: 'Bearer nnAuQQea4hcAAAAAAAAAAbz8rFngIHdnRmUH7jjdB3wNypR-f-PuTeLmtdRqvXdS',
                'Dropbox-API-Arg': JSON.stringify({
                    path: path,
                    mode: 'overwrite',
                    autorename: true,
                    mute: false,
                    strict_conflict: false
                }),
                'Content-Type': 'application/octet-stream'
            }
        },
        (res) => {
            console.log('statusCode: ', res.statusCode)
            console.log('headers: ', res.headers)

            res.on('data', function (d) {
                process.stdout.write(d)
            })
        }
    )

    return req
}

//let imgArr = []

// fs.readdir('uploads', (err, files) => {
//     files.forEach((file) => {
//         //console.log(file)
//         imgArr.push(file)
//     })
//     console.log(imgArr)
// })

app.listen(port, () => {
    console.log('server started on port 3000')
})
