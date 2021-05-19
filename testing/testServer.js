const mongoose = require('mongoose')
const express = require('express')
const flash = require('express-flash')
const session = require('express-session')
const passport = require('passport')
const path = require('path')
const app = express()

const authRoute = require('../routes/auth')
const protectedRoute = require('../routes/protected')
const unprotectedRoute = require('../routes/unprotected')

const mongoDB = 'mongodb://localhost:27017/testDatabase'
mongoose.connect(mongoDB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
})

//port and path
const staticPath = path.join(__dirname, 'public')

//use ejs and static files
app.set('view engine', 'ejs')
app.use(express.static(staticPath))
app.use(express.urlencoded({ extended: false }))

app.use(express.json())
app.use(
    session({
        secret: 'bruh',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
        },
    })
)
app.use(flash())

//initialise passport
app.use(passport.initialize())
app.use(passport.session())

app.use('', authRoute)
app.use('', protectedRoute)
app.use('', unprotectedRoute)

module.exports = app
