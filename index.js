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


var x = path.join(__dirname, 'public')
const port = process.env.PORT || 3000

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
fs.readFile('red.jpg', function (err, data) {
    const req = https.request(
        'https://content.dropboxapi.com/2/files/upload',
        {
            method: 'POST',
            headers: {
                Authorization: 'Bearer nnAuQQea4hcAAAAAAAAAAbz8rFngIHdnRmUH7jjdB3wNypR-f-PuTeLmtdRqvXdS',
                'Dropbox-API-Arg': JSON.stringify({
                    path: '/Upload/red.jpg',
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

    req.write(data)
    req.end()
})


app.listen(port, () => {
    console.log('server started on port 3000')
})
