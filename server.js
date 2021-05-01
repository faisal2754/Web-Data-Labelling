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

//routes
app.use('', authRoute)
app.use('', protectedRoute)
app.use('', unprotectedRoute)

//server listen
app.listen(port, () => {
    console.log(`server started on port ${port}`)
})
