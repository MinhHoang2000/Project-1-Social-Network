
const url = require("../models/db_config.js")
const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const mongodb = require("mongodb");
const session = require("express-session");
const online = require("../controller/online.js")
router.use(session(
    {
        secret: 'secret key',
        resave: false,
        saveUninitialized: false,

    }
))
const MongoClient = mongodb.MongoClient;
var login = {
    post: (req, res) => {
        MongoClient.connect(url, (err, db) => {
            if (err) { console.log(err) };
            // check user in database
            let dbo = db.db("project1");
            dbo.collection("users").find({ name: req.body.username }).toArray((err, user) => {
                if (err) { console.log(err) };
                // not have user
                if (!user[0]) {
                    console.log("======user not found======")
                    res.render('re-signup.ejs');
                }
                // check pass
                else {
                    // compare password
                    var bool = bcrypt.compareSync(req.body.password, user[0].password);
                    console.log("Password user post to server: " + req.body.password);
                    if (bool == false) {
                        res.render('re-login.ejs');
                    } else {
                        req.session.fullname = user[0].fullname;
                        req.session.user = req.body.username;
                        req.session.isLoggedIn = true;
                        if (online.includes(req.session.user) == false) {
                            online.push(req.session.user);
                        }
                        console.log(online);
                        console.log("======Login successfully======");
                        res.redirect(`/newfeed`);
                    }
                }
            })
        });
    },
}
module.exports = login;