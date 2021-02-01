var chat={
    userSend: String,
    userReceive:String,
    message:Array
}
class Chat{
    constructor(chat){
        this.userSend=chat.userSend,
        this.userReceive=chat.userReceive,
        this.message=[]
    }
}
module.exports=Chat;