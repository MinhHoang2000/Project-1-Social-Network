
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
var newfeed = {
    get: (req, res) => {
        MongoClient.connect(url, (err, db) => {
            let dbo = db.db("project1");
            dbo.collection("posts").find().sort({ index: -1 }).toArray((err, post) => {
                dbo.collection("users").findOne({ name: req.session.user }, (err, user) => {
                    res.render("newfeed2.ejs", {
                        posts: post,
                        userSession: user,
                        online:online
                    })
                })

            })
        }) 
    },
}
module.exports = newfeed;