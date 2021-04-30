if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const authRoute = require('./routes/auth')
const flash = require('express-flash')
const session = require('express-session')
const passport = require('passport')
const app = express()
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const Job = require('./models/Job')

randomArr = ['bruhhhh', '?????????']

Job.findOneAndUpdate(
    { _id: '608427e43124aa1ea8108de2' },
    { $set: { images: randomArr } },
    { new: true },
    (err, ans) => {
        if (err) {
            console.log('Something wrong when updating data!')
        }

        console.log(ans)
    }
)
// const ans = await Job.findOne({
//     _id: '608427e43124aa1ea8108de2'
// })
// if (ans) {
//     console.log(ans)
// } else {
//     console.log('bruh???')
// }

//port and path
const staticPath = path.join(__dirname, 'public')
const port = process.env.PORT || 3000

//use ejs and static files
app.set('view engine', 'ejs')
app.use(express.static(staticPath))
app.use(express.urlencoded({ extended: false }))
//app.use(bodyParser.urlencoded({ extended: false }));

//connect to mongodb
async function connectDB() {
    try {
        await mongoose.connect(
            process.env.DB_CONNECT,
            { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true },
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
        saveUninitialized: false
    })
)
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())

//routes
app.use('', authRoute)

app.listen(port, () => {
    console.log('server started on port 3000')
})
