let io;

const  cors=require('cors');
module.exports={
    init: (httpServer)=>{
      io=  require('socket.io')(httpServer,{
        cors: {
          origin: "http://localhost:3000"
        }})

      return io;
    },
    getIO:()=>{
        if(!io)
        {
            throw new Error('Socket.io not run')
        }
        return io
    },
    test1:(someValue)=>{
        return(someValue)
    }
}