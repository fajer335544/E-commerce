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
 input  Data {
 email:String!
 name :String!
 password:String! 
 }
    type RootMutation {
    createUser(userInput: Data) : User!
  
    }
type Test {
hello : String
}
schema{
    query : Test
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