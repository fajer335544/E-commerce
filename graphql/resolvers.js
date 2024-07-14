//define the logic of incoming requests
const User=require('../models/user')
const Post = require('../models/post')
const bcrypt=require('bcryptjs')
const validator=require('validator')
const jwt=require('jsonwebtoken')
const {imageClear}= require('../utils/file')
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
     email:userEmail.email,
     name:userEmail.name
           },'somesupersecretsecret',{expiresIn:'1h'})

const gg={
    token:token,
      
    userId:userEmail._id.toString(),
    name:userEmail.name
}
console.log(gg)

           return{
            token:token,
      
            userId:userEmail._id.toString(),
            name:userEmail.name
           }
    },
    createPost : async function({postInput},req){
        console.log("Created Post")


        if(!req.isAuth)
            {
                const error = new Error('Not Authinticator')
                 error.code =401;
                throw error
            }
const errors=[]
if(validator.isEmpty(postInput.title)|| !validator.isLength(postInput.title,{min:3}))
    {
        errors.push( {message:"title is required field"})
    }
    if(validator.isEmpty(postInput.content)||!validator.isLength(postInput.content,{min:3}))
        {
            errors.push({message:"content is required field"})
        }

        if(errors.length>0)
            {
                const error =new Error('Validation error');
                error.message = errors;
                error.code = 422;
                throw error;
            }

            const user =await User.findById(req.userId)
            console.log("--------------USER ---")
            console.log(user)
            if(!user)
                {
                    const error =new Error('user not Find');
                   
                    error.code = 401;
                    throw error;
                }
const post =  new Post({
    title:postInput.title,
    content : postInput.content,
    imageUrl:postInput.imageUrl,
    creator:user
})

const createdPost= await post.save();
user.posts.push(createdPost);
await user.save()
  console.log("--------------------------")
      console.log(postInput.title+postInput.content)
      //graphQl do not have date format so we converted to string :
return {
    ...createdPost._doc, 
    _id:createdPost._id.toString(),
     createdAt:createdPost.createdAt.toISOString() ,
    updatedAt : createdPost.updatedAt.toISOString()
}


    },
    posts:async function({page},req){
console.log("---------")
        if(!req.isAuth)
            {
                const error = new Error('Not Authinticator')
                 error.code =401;
                throw error
            }
if(!page)
{
    page=1;
}
let perPage=2;
       const totalPosts= await Post.find().countDocuments();
       const posts=await Post.find()
       .sort({createdAt:-1})
       .skip((page-1)*perPage)
       .limit(perPage)
       .populate('creator');
       return {

            posts:posts.map(p=>{
                return {
                    ...p._doc,
                    _id:p._id.toString(),
                    createdAt:p.createdAt.toISOString(),
                    updatedAt:p.updatedAt.toISOString()
                }
            
            }),
        totalPosts:totalPosts
       }
    
    } 
    ,  post : async function ({id},req){
console.log(id)
        if(!req.isAuth)
            {
                const error = new Error('Not Authinticator')
                 error.code =401;
                throw error
            }

            const post= await Post.findById(id).populate('creator');
            console.log(post)
            if(!post)
            {
                const error = new Error('Post -Not Found')
                error.code=404
                throw error
            }
            return {
             ...post._doc,
                
                  createdAt : post.createdAt.toISOString(),
                  updatedAt : post.updatedAt.toISOString()
            }
    },
    updatePost:async function ({id,postInput},req){

        if(!req.isAuth)
            {
                const error = new Error('Not Authinticator')
                 error.code =401;
                throw error
            }

            const post= await Post.findById(id).populate('creator');
          
            if(!post)
            {
                const error = new Error('Post -Not Found')
                error.code=404
                throw error
            }
            if(post.creator._id.toString()!==req.userId.toString())
            {
                const error = new Error('Not Authorization to update this post ')
                error.code=403
                throw error
            }

            
const errors=[]
if(validator.isEmpty(postInput.title)|| !validator.isLength(postInput.title,{min:3}))
    {
        errors.push( {message:"title is required field"})
    }
    if(validator.isEmpty(postInput.content)||!validator.isLength(postInput.content,{min:3}))
        {
            errors.push({message:"content is required field"})
        }

        if(errors.length>0)
            {
                const error =new Error('Validation error');
                error.message = errors;
                error.code = 422;
                throw error;
            }
            post.title=postInput.title;
            post.content=postInput.content;
            if(postInput.imageUrl!=='undefined')
            {
            post.imageUrl=postInput.imageUrl;
            }
              const updatedPost= await post.save()
              return {
                ...updatedPost._doc,
                _id:updatedPost._id.toString(),
                createdAt:updatedPost.createdAt.toISOString(),
                updatedAt:updatedPost.updatedAt.toISOString()
              }
    },
    deletePost :async function ({id},req)
    {
        if(!req.isAuth)
            {
                const error = new Error('Not Authinticator')
                 error.code =401;
                throw error
            }
            const post = await Post.findById(id);
            if(post.creator.toString()!== req.userId)
            {
                const error = new Error('Not Authorization to deleted this post ')
                error.code=403
                throw error
            }
            imageClear(post.imageUrl)
            await Post.findByIdAndDelete(id);
            const user = await User.findById(post.creator.toString())
            user.posts.pull(id)
            await user.save();
            return true;

    },
    user: async function({},req){

        if(!req.isAuth)
            {
                const error = new Error('GG Not Authinticator')
                 error.code =401;
                throw error
            }
            const user = await User.findById(req.userId)
            if(!user)
            {
                const error = new Error('User not found');
                error.code=404
                throw error
            }
            return {
                ...user._doc,
                _id:user._id.toString()
            }



    }

,updateStatus: async function({status},req)
{
    if(!req.isAuth)
        {
            const error = new Error('GG Not Authinticator')
             error.code =401;
            throw error
        }
        const user = await User.findById(req.userId)
        if(!user)
        {
            const error = new Error('User not found');
            error.code=404
            throw error
        }
        user.status=status;
        await user.save()
        return {
            ...user._doc,
            _id:user._id.toString()
        }

}

}