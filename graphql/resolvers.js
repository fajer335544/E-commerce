//define the logic of incoming requests
const User=require('../models/user')
const bcrypt=require('bcryptjs')
module.exports={
    createUser: async  function(args,req){
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

//return createdUser
return {  ...createdUser._doc, _id:createdUser._id.toString() }

    }

}