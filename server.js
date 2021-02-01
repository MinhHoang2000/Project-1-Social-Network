
const url = require('./models/db_config.js');
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const mongodb = require("mongodb");
const routes = require('./routes');
const link_preview = require('kahaki');
//connect to DB 
const MongoClient = mongodb.MongoClient;
app.use(function (req, res, next) {
    res.removeHeader("X-Powered-By");
    next();
});
// set views
app.use("/public", express.static(__dirname + "/public"));
app.set('view-engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use("/", routes);
// real-time in post
io.on("connection", (socket) => {
    socket.on("new_user", data => {
        socket.join(`${data}`)
        // listen event comment
        socket.on("clientSend", (data) => {
            MongoClient.connect(url, (err, db) => {
                let dbo = db.db("project1");
                // find on database
                dbo.collection("users").findOne({ name: data.commentuser }, (err, user) => {
                    if (err) console.log(err);
                    dbo.collection("posts").findOne({_id: mongodb.ObjectId(data.post_id)},(err,p)=>{
                        dbo.collection("posts").updateOne({ _id: mongodb.ObjectId(data.post_id) }, {
                                           $push: {
                                               comment:{
                                                     commentuser: data.commentuser,
                                                     avatarcomment: user.avatar,
                                                     comment: data.mes
                                               }
                                           }                                        
                        });
                        io.sockets.in(`${data.post_id}`).emit("serverSend", {
                            commentuser: data.commentuser,
                            avatarcomment: user.avatar,
                            comment: data.mes,
                            commentcount: p.comment.length+1
                        });
                    });          
                });
            });
        });
    });
}) 
io.on("connection",(socket)=>{
    // listen event like 
    socket.on("like_post",(data)=>{
        socket.join(`${data.id}-like`);
        console.log(data.id);
        MongoClient.connect(url,(err,db)=>{
            let dbo=db.db("project1");
            dbo.collection("posts").findOne({_id: mongodb.ObjectId(data.id)},(err,p)=>{
                if(p.like.includes(data.userSession)==false){
                    dbo.collection("posts").updateOne({_id: mongodb.ObjectId(data.id)}, {
                        $push: {
                            like: `${data.userSession}`
                        }
                    });
                    dbo.collection("posts").findOne({_id: mongodb.ObjectId(data.id)},(err,result)=>{
                        io.sockets.emit(`server_send_likecount_${data.id}`,{
                            likecount:result.like.length+1,
                       });
                       socket.leave(`${data.id}-like`);
                    });
                }
            });         
        });     
    });
})

//real-time in chat
io.on("connection", (socket) => {
    socket.on("new_user_message", (data) => {
        socket.join(`${data.userSession}and${data.user}`);
        socket.join(`${data.user}and${data.userSession}`);
        var query1 = {
            userSend: data.userSession,
            userReceive: data.user,
        }
        var query2 = {
            userSend: data.user,
            userReceive: data.userSession,
        }
        //typing
        socket.on("typing",data=>{
            socket.to(`${query1.userReceive}and${query1.userSend}`).emit("typing_server", data);
        })
        socket.on("done_typing", ()=>{
            socket.to(`${query1.userReceive}and${query1.userSend}`).emit("done");
        });
        socket.on("stop_typing",()=>{
            socket.to(`${query1.userReceive}and${query1.userSend}`).emit("stop_typing_server");
        })
        // event listen client send text
        socket.on("client_send_mes", data => {
            //check link text
            var index = data.mes.indexOf("https://");
            if(index!=-1){     
                var link = data.mes.slice(index, data.mes.length);
                // handle link text
               (async()=>{
                  const preview = await link_preview.getPreview(link);
                  socket.to(`${data.UserSession}and${data.User}`).to(`${data.User}and${data.UserSession}`).emit("server_send_mes", {
                    message: data.mes,
                    from: data.UserSession,
                    Time_Mes: `${new Date().getHours()}:${new Date().getMinutes()}-${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
                    link:preview
                });
               })();
            } else{
                socket.to(`${data.UserSession}and${data.User}`).to(`${data.User}and${data.UserSession}`).emit("server_send_mes", {
                    message: data.mes,
                    from: data.UserSession,
                    Time_Mes: `${new Date().getHours()}:${new Date().getMinutes()}-${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
                    link:0
                });
            }
            MongoClient.connect(url, (err, db) => {
                let dbo = db.db("project1");
                dbo.collection("chat").updateOne(query1, {
                    "$push": {
                        message: {
                            check: 1,
                            Mes: `${data.mes}`,
                            index_time:new Date().valueOf(),
                            date: `${new Date().getHours()}:${new Date().getMinutes()}-${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
                            file_name: ""
                        }
                    }
                });
                dbo.collection("chat").updateOne(query2, {
                    "$push": {
                        message: {
                            check: 0,
                            Mes: `${data.mes}`,
                            index_time:new Date().valueOf(),
                            date: `${new Date().getHours()}:${new Date().getMinutes()}-${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
                            file_name: ""                            
                        }
                    }
                });
            });
        }); 
        // event listen client send file
        socket.on("client_send_file_mes", (data) => {
            console.log("ok")
            console.log(data)
            var length = data.file_name.length;
            var dot = data.file_name.indexOf(".");
            // var type = data.file_name.substr(length - 3, 3);
            var type=data.file_name.slice(dot+1,length);
            MongoClient.connect(url, (err, db) => {
                let dbo = db.db("project1");
                dbo.collection("chat").updateOne(query1, {
                    "$push": {
                        message: {
                            check: 1,
                            Mes: `${data.mes}`,
                            index_time:new Date().valueOf(),
                            date: `${new Date().getHours()}:${new Date().getMinutes()}-${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
                            file_name: data.file_name,
                            type: type
                        }
                    }
                });
                dbo.collection("chat").updateOne(query2, {
                    "$push": {
                        message: {
                            check: 0,
                            Mes: `${data.mes}`,
                            index_time:new Date().valueOf(),
                            date: `${new Date().getHours()}:${new Date().getMinutes()}-${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
                            file_name: data.file_name,
                            type: type                        
                        }
                    }
                })
            });       
            socket.to(`${data.UserSession}and${data.User}`).to(`${data.User}and${data.UserSession}`).emit("server_send_file_mes", {
                message: data.mes,
                from: data.UserSession,
                file_name: data.file_name,
                type: type
            });
        });
        socket.on('check-seen',(data)=>{
            socket.to(`${data.UserSession}and${data.User}`).emit("check-seen-sv");
        })
    });
});
var port = process.env.PORT || 3000;
// run server
server.listen(port, function () {
    console.log("Server is listening on port 3000");
});