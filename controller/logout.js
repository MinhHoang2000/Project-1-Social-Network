
const express = require("express");
const router = express.Router();
const session = require("express-session");
const online = require("../controller/online.js")
router.use(session(
    {
        secret: 'secret key',
        resave: false,
        saveUninitialized: false,

    }
))
var logout = {
    get: (req, res) => {
        let temp = online.indexOf(req.session.user);
        delete online[temp];
        res.redirect("/");
    },
}
module.exports = logout;