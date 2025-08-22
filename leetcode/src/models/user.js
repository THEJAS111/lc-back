const mongoose=require('mongoose')
const {Schema}=mongoose;
const submission=require('./submission');

const userschema = new Schema(
    {
        firstname:{
            type:String,
            required:true,
            minLength:3,
            maxLength:20
        },
        lastname:{
            type:String,
            minLength:3,
            maxLength:20
        },
        emailid:{
            type:String,
            required:true,
            unique:true,
            trim:true,
            lowercase:true,
            immutable:true
        },
        age:{
            type:Number,
            max:80,
            min:5,
        },
        role:{
            type:String,
            enum:['user','admin'],
            default:'user'
        },
        problemsolved:{
              type:[{
            type:Schema.Types.ObjectId,
            ref:'problem'
        }],
        unique:true
        },
        password:{
            type:String,
            required:true
        }
    },{
        timestamps:true
    }
);
userschema.post('findOneAndDelete',async function(doc){
    if(doc){
        await mongoose.model('submission').deleteMany({userId:doc._id})
    }
});
const user=mongoose.model("user",userschema);
module.exports=user;