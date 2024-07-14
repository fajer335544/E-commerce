if(process.env.NODE_ENV !== 'production') {
require('dotenv').config()
}

const express= require('express');
const bodyParser=require('body-parser');
const mongoose = require('mongoose');
const multer=require('multer');
const path=require('path');

const  cors=require('cors');

const {imageClear}= require('./utils/file')
var { createHandler } = require("graphql-http/lib/use/express")

const { graphqlHTTP } = require('express-graphql');

const graphQlschema = require('./graphql/schema')
const graphQlresolvers = require('./graphql/resolvers')
const auth=require('./middelware/is-auth')
const app=express();



const fileStorage=multer.diskStorage({
  destination:(req, file, cb)=>{
    cb(null, 'images/')
  },
  
  filename:(req,file,cb)=>{

    cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname))

  },
  
});
const fileFilter=(req, file, cb)=>{
  if(file.mimetype === 'image/png'||
  file.mimetype==='image/jpeg'||
  file.mimetype==='image/jpg') 
  {
    cb(null,true) 
  } 
  else{
  cb(null,false);
  }
}

app.use(bodyParser.json())

app.use(cors());


app.use(
  multer({storage:fileStorage,fileFilter:fileFilter}).single('image')
);

app.use('/images',express.static(path.join(__dirname, 'images'))
);

app.use((req, res, next) => {
res.setHeader('Access-Control-Allow-Origin', '*');

res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS,DELETE,PATCH');
res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorizations');
next();



})
app.use(auth)








app.put('/post-image',(req,res,next)=>{
//   if(!req.isAuth)
//   {
// const error = new Error('You must be logged in')
// error.code=401
// throw error
//   }
  if(!req.file)
  {
    return res.status(200).json({message:'No File provided '})
  }
  console.log(req.file);
  if(req.body.oldPath)
  {
     imageClear(req.body.oldPath) 
  }
  return res.status(201).json({message:'File was successfully added',
    filePath: req.file.path})

})



app.use('/graphql',graphqlHTTP({
schema:graphQlschema,
rootValue:graphQlresolvers,
graphiql:true,
customFormatErrorFn(err){
  if(!err.originalError){
    return err
  }
  console.log(err.originalError.message)
  const data = err.originalError.data;
  const message = err.message||'An Error Occurd'
  const code =err.originalError.code ||500;
   return {message:message,status:code, data:data}
}
}))



app.use('*',(req,res,next)=>{
  res.status(404).json({message:"this route is not founded"})
})

app.use((error,req, res, next)=>{
const status=error.statusCode || 500;
const message = error.message;
const data=error.data

console.log('///////////////////////////status'+status +'///////////message'+message)

res.status(status).json({message: message,data:data});
})





const url='';

try{
      mongoose.connect(process.env.MONGO_URL)
     //mongoose.connect(url);
      app.listen(process.env.PORT)
     console.log(process.env.PORT)
   // const testmodule=require('./socket').test("ffff");
    //console.log(testmodule)
 //   const io=require('socket.io')(server)
 
  }
      catch(err){console.log(err)}
     




     
      
