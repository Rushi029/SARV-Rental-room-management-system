const mongoose=require("mongoose")

mongoose.connect("mongodb://localhost:27017/LoginSignupPages")
.then(()=>{
    console.log("mongodb connected");
})
.catch(()=>{
    console.log("Fail to connect");
})

const LogInSchema= new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    
    password:{
        type:String,
        required:true
    }
})

const owner=new mongoose.model("owner1", LogInSchema)

module.exports=owner