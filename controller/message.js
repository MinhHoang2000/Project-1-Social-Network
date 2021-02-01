
const url = require("../models/db_config.js")
const express = require("express");
const router = express.Router();
const mongodb = require("mongodb");
const session = require("express-session");
const online = require("../controller/online.js");
router.use(session(
    {
        secret: 'secret key',
        resave: false,
        saveUninitialized: false,

    }
))
const MongoClient = mongodb.MongoClient;
var message = {
    get: (req, res) => {
        MongoClient.connect(url, (err, db) => {
            if (err) console.log(err);
            let dbo = db.db("project1");
            dbo.collection("users").findOne({ name: req.session.user }, (err, userSession) => {
                res.render("message_list.ejs", {
                    userSession: req.session.user,
                    message_list: userSession,
                    online: online
                })
            })
        })
    },
}
module.exports = message;