//define the logic of incoming requests
const User=require('../models/user')
const bcrypt=require('bcryptjs')
const validator=require('validator')
const jwt=require('jsonwebtoken')
module.exports={
    createUser: async  function(args,req){
const errors=[];
   if(!validator.isEmail(args.userInput.email)){
errors.push({message:"put valid email please "})
   }
   if(validator.isEmpty(args.userInput.password)||!validator.isLength(args.userInput.password,{min:5})){
    errors.push({message:"make sure your password in longer than 5 Charts "})
   }

if(errors.length>0){
  
    const error = new Error('Invalid Input') //this will pass to err.originalError
    error.data=errors
    error.code=422
    
    throw error
}
const email = args.userInput.email;

const existingUser = await User.findOne({ email: args.userInput.email})

if(existingUser)
    {
        const error = new Error('User already exists')
        throw error

    }
    const hashedpass= await bcrypt.hash(args.userInput.password,12)
const user =new User({
    email: args.userInput.email,
    password: hashedpass,
    name: args.userInput.name
})

const createdUser =await user.save()

return createdUser
//return {  ...createdUser._doc, _id:createdUser._id.toString() }

    },
    login : async function ({email,password})
    {
        const userEmail=await User.findOne({email:email})
        if(!userEmail)
            {
                const error = new Error("User not found")
                error.code=401;
                throw error
            }
          const checkPass= await bcrypt.compare(password,userEmail.password)
          if(!checkPass)
            {
                const error = new Error("Wrong passWord")
                error.code=401;
                throw error
            }
           const token= jwt.sign({
     userId:userEmail._id.toString(),
     email:userEmail.email
           },'somesuperkey',{expiresIn:'1h'})
           return{
            token:token,
      
            userId:userEmail._id.toString()
           }
    },
    createPost : async function({postInput},req){
  console.log("--------------------------")
      console.log(postInput.title+postInput.content)
return "postInput"


    }

}