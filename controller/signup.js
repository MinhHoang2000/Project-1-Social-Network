
const url = require('../models/db_config.js')
const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const mongodb = require("mongodb");
const session = require("express-session");
const User = require("../models/user.js");
const online = require("../controller/online.js")
router.use(session(
    {
        secret: 'secret key',
        resave: false,
        saveUninitialized: false,

    }
))

const MongoClient = mongodb.MongoClient;
var signup = {
    post: (req, res) => {
        MongoClient.connect(url, (err, db) => {
            if (err) { console.log(err) };
            // encryption password
            let hashedPassword = bcrypt.hash(req.body.password, 10).then(function (hashedPassword) {
                let temp = {
                    name: req.body.username,
                    fname: req.body.fname,
                    lname: req.body.lname,
                    fullname: `${req.body.fname} ${req.body.lname}`,
                    sex: req.body.sex,
                    birthday: `${req.body.date}/${req.body.month}/${req.body.year}`,
                    password: hashedPassword,
                }
                let user = new User(temp);
                console.log("Password user signup: " + req.body.password);
                // connect database
                let dbo = db.db("project1");
                dbo.collection("users").find({ name: req.body.username }).toArray((err, result) => {
                    if (err) { console.log(err) };

                    if (result[0]) {
                        console.log(result)
                        console.log("======Username registered======");
                        res.render('re-signup.ejs');
                    } else {
                        // insert user
                        dbo.collection("users").insertOne(user, (err, res) => {
                            if (err) throw err;
                            console.log("======Insert ok======");
                        }); 
                        //set session
                        req.session.isLoggedIn = true;
                        req.session.fullname = user.fullname;
                        req.session.user = req.body.username;
                        if (online.includes(req.session.user) == false) {
                            online.push(req.session.user);
                        }
                        res.redirect("/newfeed");
                    }
                }); 
            }) 
        })
    },
}
module.exports = signup;