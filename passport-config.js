const LocalStrategy = require('passport-local').Strategy

function initialize(passport, getUserByEmail) {
    const authenticateUser = async (email, password, done) => {
        const user = await getUserByEmail(email)

        if (user == null) {
            return done(null, false, { message: 'No user with that email' })
        }

        try {
            if (password === user.password) {
                return done(null, user)
            } else {
                return done(null, false, { message: 'Password incorrect' })
            }
        } catch (e) {
            return done(e)
        }
    }

    passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, authenticateUser))
    passport.serializeUser((user, done) => done(null, user.email))
    passport.deserializeUser((email, done) => {
        return done(null, getUserByEmail(email))
    })
}

module.exports = initialize
