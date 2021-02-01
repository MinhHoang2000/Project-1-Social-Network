const url = require("../models/db_config.js")
const express = require("express");
const router = express.Router();
const mongodb = require("mongodb");
const session = require("express-session");
router.use(session(
    {
        secret: 'secret key',
        resave: false,
        saveUninitialized: false,

    }
))
const MongoClient = mongodb.MongoClient;
var posts = {
    get: (req, res) => {
        if (req.session.isLoggedIn == true) {

            MongoClient.connect(url, (err, db) => {
                if (err) console.log(err);
                var id = req.params.id;
                let dbo = db.db("project1");
                dbo.collection("posts").findOne({ _id: mongodb.ObjectId(id) }, (err, result) => {
                    dbo.collection("users").findOne({ name: req.session.user }, (err, user) => {
                        res.render("post2.ejs", {
                            post: result,
                            userSession: user
                        });
                    })


                }) 

            }); 
        } else {
            res.redict("/");
        }

    },
}
module.exports = posts;