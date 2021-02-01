var post={
    index:Date,
    avatar:String,
    username:String,
    fullname:String,
    description:String,
    image:String,
    date: {
        day: String,
        month: String,
        year: String,
        time_hours: String,
        time_minutes: String,
    },
    comment:[],
    like:[]
}
class Post{
    constructor(post){
        this.index=new Date().valueOf();
        this.avatar=post.avatar;
        this.username=post.username;
        this.fullname=post.fullname;
        this.description=post.description;
        this.image=post.image;
        this.date={
            day: new Date().getDate(),
            month: new Date().getMonth()+1,
            year: new Date().getFullYear(),
            time_hours: new Date().getHours(),
            time_minutes: new Date().getMinutes(),
        };
        this.comment=[],
        this.like=[]

    }
}
module.exports=Post;