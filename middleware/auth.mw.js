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
    if (req.isAuthenticated()) {
        return next()
    } else {
        res.redirect('/')
    }
}

async function checkAuthenticatedTest(req, res, next) {
    if (req.sessionStore.sessions) {
        return next()
    } else {
        res.redirect('/')
    }
}

module.exports = {
    isAuthenticated,
    checkAuthenticated,
    checkAuthenticatedTest
}
