function isAuthenticated(routeName) {
    return function (req, res, next) {
        if (req.isAuthenticated()) {
            next()
        } else {
            res.render(routeName, { authenticated: false })
        }
    }
}

async function checkAuthenticated(req, res, next) {
    const sessionID = Object.keys(req.sessionStore.sessions)[0]
    const session = JSON.parse(req.sessionStore.sessions[sessionID])

    if (req.isAuthenticated() || session.passport) {
        return next()
    } else {
        res.redirect('/')
    }
}

module.exports = {
    isAuthenticated,
    checkAuthenticated,
}
