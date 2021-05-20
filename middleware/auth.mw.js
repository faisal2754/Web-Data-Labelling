async function checkAuthenticated(req, res, next) {
    let sessionID, session

    try {
        sessionID = Object.keys(req.sessionStore.sessions)[0]
        console.log(sessionID)
        session = JSON.parse(req.sessionStore.sessions[sessionID])
    } catch (e) {
        console.log(e)
    }

    if (req.isAuthenticated() || session.passport) {
        return next()
    } else {
        res.redirect('/')
    }
}

module.exports = {
    checkAuthenticated
}
