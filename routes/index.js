
const express = require("express");
const router = express.Router();
const multer = require("multer");
const session = require("express-session");
const link_preview=require("kahaki");
//route
const home = require("../controller/home.js");
const newfeed = require("../controller/newfeed.js");
const posts = require("../controller/posts.js");
const add_friend = require("../controller/add_friend.js");
const login = require("../controller/login.js");
const logout = require("../controller/logout.js");
const message = require("../controller/message.js");
const profile = require("../controller/profile.js");
const send_mes = require("../controller/send_mes.js");
const signup = require("../controller/signup.js");
const editprofile = require("../controller/editprofile.js");
const createpost = require("../controller/createpost.js");
// path
const path = "C:/Users/Hoang/Desktop/Project 1";
//set session
router.use(session(
    {
        secret: 'secret key',
        resave: false,
        saveUninitialized: false,

    }
))
// setup upload
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path + '/public/image');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})
var storage_avatar = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path + '/public/image/avatar');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})
var upload = multer({ storage: storage })
var upload_avatar = multer({ storage: storage_avatar })
// set get method
router.get("/", home.get);
router.get("/newfeed", newfeed.get);
router.get("/logout", logout.get);
router.get("/profile/:username", profile.get);
router.get("/editprofile", editprofile.get);
router.get("/post/:id", posts.get);
router.get("/send_message/:userSession/:user", send_mes.get);
router.get("/message", message.get);
//set post method
router.post('/signup', signup.post);
router.post("/login", login.post);
router.post("/add_friend/:username", add_friend.post);
router.post("/createPost", upload.single("file_image"), createpost.post);
router.post("/editprofile", upload_avatar.single("avatar"), editprofile.post);
// post to up file in chat
router.post("/send_message/:userSession/:user/up_file",upload.single("up_image"), async (req,res)=>{
    await res.redirect('back');
});
// post to handle link text
router.post('/send_message/link_text',(req,res)=>{
    (async()=>{
        const preview = await link_preview.getPreview(req.body.link);
        res.send({
            preview:preview,
            mess:req.body.mess
        })
     })();
})
module.exports = router