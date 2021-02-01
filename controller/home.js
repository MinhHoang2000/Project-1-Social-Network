
const express = require("express");
const router = express.Router();
const session = require("express-session");
router.use(session(
    {
        secret: 'secret key',
        resave: false,
        saveUninitialized: false,

    }
))
var home={
    get: function (req, res) {
        res.render("Home.ejs")
    },
}
module.exports=home;