const {buildSchema ,GraphQLSchema } =require( "graphql")
//define query , mutation, subscription....
module.exports = buildSchema(`




    type Post {
    _id:ID!
    title :String!
     content :String!
      imageUrl :String!
      creator : User!
      createdAt : String !
      updatedAt : String!
    }

    type User {
    _id : ID!
     email:String!
 name :String!
 password:String
 status :String!
 posts :[Post!]!
    }

    type AuthData {
    token : String ! 
    userId : String ! 
    name : String !
    }

    type PostData{
    posts:[Post !]!
    totalPosts: Int !
    }
 input  userData {
 email:String!
 name :String!
 password:String! 
 }

 input postData {
 
 content : String !
 title : String !
 imageUrl : String !

 
 }
    type RootMutation {
    createUser(userInput: userData) : User!
    createPost(postInput: postData) : Post !
    }
type RootQuery {
login(email:String! , password : String! ): AuthData !
posts(page:Int): PostData !

post(id:ID !) : Post !
}
schema{
    query : RootQuery
    mutation:RootMutation
}


`)
/*
export default new GraphQLSchema({
    type RootQuery {

    },
    schema: {
    query: QueryType,

    }
  })*/