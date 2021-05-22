const e = require('express')

async function checkAuthenticated(req, res, next) {
    try {
        let sessionID, session
        sessionID = Object.keys(req.sessionStore.sessions)[0]
        session = JSON.parse(req.sessionStore.sessions[sessionID])

        // This is necessary + gross but if we test session.passport directly
        // will throw error as session undefined, thus can't access passport of undefined.
        if (req.isAuthenticated() || session.passport) {
            return next()
        } else {
            res.redirect(302, '/')
        }
    } catch {
        res.redirect(302, '/')
    }
}

module.exports = {
    checkAuthenticated
}
