const jwt=require('jsonwebtoken');

module.exports=(req,res,next)=>{
//console.log("asdsdasdsdddsdad"+req.headers.authorizations.split(' ')[1])
    let token;
    if (req.headers.authorizations ) {
        token = req.headers.authorizations.split(' ')[1];
    }
    if (!token) {
        return next(new Error('You are not logged in'));
    }
    let decodedtoken;
    try{
        decodedtoken=jwt.verify(token,'somesupersecretsecret');

    }
    catch(err){
        err.statusCode=500;
        throw err
    }
    
    if(!decodedtoken)
    {
        const error =new Error('Not authenticated .')
        err.statusCode=401;
        throw err
    }
    req.userId=decodedtoken.userId;
   // console.log(decodedtoken);
    next(); 
}