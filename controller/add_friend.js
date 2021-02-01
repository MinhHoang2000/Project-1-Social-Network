
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
var add_friend = {
    post: (req, res) => {
        MongoClient.connect(url, (err, db) => {
            let dbo = db.db("project1");
            dbo.collection("users").findOne({ name: req.session.user }, (err, userSession) => {
                dbo.collection("users").findOne({ name: req.params.username }, (err, userProfile) => {
                    dbo.collection("users").updateOne({ name: req.session.user }, {
                        // update database
                        $push: {
                            friends: {
                                username: req.params.username,
                                avatar: userProfile.avatar,
                                company: userProfile.company,
                                address: userProfile.address
                            }
                        }
                    });
                    dbo.collection("users").updateOne({ name: req.params.username }, {
                        $push: {
                            friends: {
                                username: req.session.user,
                                avatar: userSession.avatar,
                                company: userSession.company,
                                address: userSession.address
                            }
                        }
                    });
                    let chat1 = {
                                    userSend: req.session.user,
                                    userReceive: req.params.username,
                                    message: []
                                }
                    dbo.collection("chat").insertOne(chat1); 
                    let chat2 = {
                                    userSend: req.params.username,
                                    userReceive: req.session.user,
                                    message: []
                                }
                    dbo.collection("chat").insertOne(chat2);
                 })
            })
            // send respond to client
            res.send(`
                      <form action="/send_message/${req.session.user}/${req.params.username}" method="GET">
                             <button class="message">Message</button>
                      </form> 
                      <script>alert('Add friend successfully ! Now you can send message to ${req.params.username}')</script>`)
        }) 

    },
}
module.exports = add_friend;