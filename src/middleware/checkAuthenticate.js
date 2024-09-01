function isAuthenticated(req, res, next) {
    if (!req.isAuthenticated()) return res.json("no")
    next()
}

module.exports = { isAuthenticated }