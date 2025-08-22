const validator=require("validator");
const validate=(data)=>{
    const mandatoryfield=['firstname','emailid','password'];
    const isallowed=mandatoryfield.every((k)=>Object.keys(data).includes(k));

    if(!isallowed){
        throw new Error("some field is missing ");
    }
    if(!validator.isEmail(data.emailid)){
        throw new Error("enter a valid email ")
    }
     if(!validator.isStrongPassword(data.password)){
        throw new Error("the password should have a capital letter,a special character and a number ")
    }

}
module.exports=validate;