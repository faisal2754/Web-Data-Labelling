const LocalStrategy = require('passport-local').Strategy
const session = require('express-session')
const flash = require('express-flash')
const User = require('./models/User')

function initialize(passport, getUserByEmail) {
    const authenticateUser = async (email, password, done) => {
        const user = await getUserByEmail(email)

        if (user == null) {
            return done(null, false, { message: 'No user with that email' })
        }

        if (password === user.password) {
            return done(null, user)
        } else {
            return done(null, false, { message: 'Password incorrect' })
        }
    }

    passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, authenticateUser))

    passport.serializeUser((user, done) => {
        done(null, user.email)
    })

    passport.deserializeUser((email, done) => {
        return done(null, getUserByEmail(email))
    })
}

module.exports = initialize
