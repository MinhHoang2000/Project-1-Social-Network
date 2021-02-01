
const url = require("../models/db_config.js")
const express = require("express");
const router = express.Router();
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
var send_mes = {
    get: (req, res) => {
        var query1 = {
            userSend: req.params.userSession,
            userReceive: req.params.user
        }
        MongoClient.connect(url, (err, db) => {
            let dbo = db.db("project1");
            // find user send
            dbo.collection("users").findOne({ name: req.params.userSession }, (err, userSession) => {
                if (err) console.log(err);
                // find user receive
                dbo.collection("users").findOne({ name: req.params.user }, (err, user) => {
                    // find chat
                    dbo.collection("chat").find({userSend:req.params.userSession}).toArray((err,list)=>{
                        // loop to make list friend and last message
                       for(var i=0;i<list.length;i++){
                        var index=list[i].message.length;
                        if(index > 0){
                            if(list[i].message[index-1].Mes!=""){
                                var temp=list[i].message[index-1].Mes;
                                var message;
                                if(temp.indexOf("https://")==-1){
                                        message=temp;
                                    }else{
                                        message="Vừa gửi một link"
                                    }
                                    list[i]={
                                        index_time:list[i].message[index-1].index_time,
                                        check:list[i].message[index-1].check,
                                        username:list[i].userReceive,
                                        message:message
                                    }
                            }else{
                                list[i]={
                                    index_time:list[i].message[index-1].index_time,
                                    check:list[i].message[index-1].check,
                                    username:list[i].userReceive,
                                    message:"Vừa gửi một file"
                                }
                            }
                            
                        }else{
                            list[i]={
                                index_time:new Date().valueOf(),
                                check:0,
                                username:list[i].userReceive,
                                message:""
                            }
                        }
                       }
                       list.sort((a,b)=>{
                        return b.index_time - a.index_time;
                       })

                        dbo.collection("chat").findOne(query1, (err, result) => {
                            if (result) {
                                res.render("chat.ejs", {
                                    userSession: userSession,
                                    user: user,
                                    data: result,
                                    online: online,
                                    list:list
                                });
                            } else {
                                res.render("chat.ejs", {
                                    userSession: userSession,
                                    user: user,
                                    data: 0,
                                    online: online,
                                    list:list
                                });
                            }
                        });
                    });
                });
            });
        })
    },
}
module.exports = send_mes;