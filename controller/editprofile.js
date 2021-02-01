
const url = require("../models/db_config.js");
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
var editprofile = {
    get: (req, res) => {
        MongoClient.connect(url, (err, db) => {
            if (err) console.log(err);
            let dbo = db.db("project1");
            dbo.collection("users").findOne({ name: req.session.user }, (err, result) => {
                res.render("editprofile.ejs", {
                    user: result
                })
            })
        });
    },
    post: (req, res) => {
         MongoClient.connect(url,async (err, db) => {
            let dbo = db.db("project1");
            if (req.file) {
                let query = {
                    $set: {
                        age: req.body.age,
                        fname: req.body.fname,
                        lname: req.body.lname,
                        fullname: `${req.body.fname} ${req.body.lname}`,
                        avatar: req.file.filename,
                        address: req.body.address,
                        phone: req.body.phone,
                        birthday: `${req.body.birthday.day}/${req.body.birthday.month}/${req.body.birthday.year}`,
                        country: req.body.country,
                        company: req.body.company
                    }
                }
                dbo.collection("posts").updateMany({ username: req.session.user }, {
                    $set: {
                        fullname: `${req.body.fname} ${req.body.lname}`,
                        avatar: req.file.filename,
                    }
                });
                dbo.collection("posts").updateMany({ "comment.commentuser": req.session.user }, {
                    $set: {
                        "comment.$.avatarcomment": req.file.filename
                    }
                })
                dbo.collection("users").updateOne({ name: req.session.user }, query);
                dbo.collection("users").updateMany({ "friends.username": req.session.user }, {
                    $set: { "friends.$.avatar": req.file.filename }
                })
            } else {
                let query = {
                    $set: {
                        age: req.body.age,
                        fname: req.body.fname,
                        lname: req.body.lname,
                        fullname: `${req.body.fname} ${req.body.lname}`,
                        address: req.body.address,
                        phone: req.body.phone,
                        birthday: `${req.body.birthday.day}/${req.body.birthday.month}/${req.body.birthday.year}`,
                        country: req.body.country,
                        company: req.body.company
                    }
                }
                dbo.collection("posts").updateMany({ username: req.session.user }, {
                    $set: {
                        fullname: `${req.body.fname} ${req.body.lname}`,
                    }
                });
                dbo.collection("users").updateOne({ name: req.session.user }, query);
            }
            await res.redirect('/editprofile');
        });
       
    },
}
module.exports = editprofile;