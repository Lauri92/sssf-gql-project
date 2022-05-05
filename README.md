# Travel Journal GraphQL-API

#### The application has Android frontend

Check it out
here: [https://github.com/Lauri92/Travel-Journal](https://github.com/Lauri92/Travel-Journal)

Topics covered in the README:

* General info
* Prerequisites
* Getting started
* Deployment
* Example queries / mutations

## General info

This is a Node.js GraphQL application using Apollo GraphQL, Express framework, MongoDB and Websockets. The application
itself is hosted
in Microsoft Azure. Purpose of the API is to store user data into database and retrieve the saved data.

Data contained in the database contains users and information about groups the users have created. Main functionalities
are different
types of CRUD operations to handle this data. In addition to that the backend also implements Azure storage to store
profile pictures, group avatars and general images posted by users.

Websocket connection is opened between users who are part of the same group and have the group screen open in the
Android application.

## Prerequisites

* Node has to be installed in order to be able to run this application on chosen platform.
* Azure account for storing images into Azure Blob Storage.

## Getting started and deployment

* Clone the repository.
* cd to cloned repository.
* npm i in order to install the required packages
* Required files:
    * ```touch .env```
* Environment variables required to run the application on localhost
    * ```DB_URL```
        * This is the mongoDB connection string that is required in order to connect to database.
        * For localhost typically something like: ```mongodb://127.0.0.1:27017/<your-db-name>```
    * ```JWT_SECRET_OR_KEY```
        * This the secretOrKey, secretOrKey is a string or buffer containing the secret (symmetric) or PEM-encoded
          public key (asymmetric) for verifying a JSON Web Token's (JWT) signature, it is used when a request is done
          using a route that requires authentication.
        * This can be a randomly generated string.
    * ```AZURE_STORAGE_CONNECTION_STRING```
        * This is the connection string checked at runtime to authorize requests made to Azure Storage.
        * Find it in Azure → YOUR STORAGE ACCOUNT → Security + networking → Access keys
    * ```PROFILE_IMAGES_CONTAINER_NAME```
        * Storage container name for profile images, can be named as you wish
    * ```GROUP_AVATARS_CONTAINER_NAME```
        * Storage container name group avatars, can be named as you wish
    * ```GROUP_IMAGES_CONTAINER_NAME```
        * Storage container name for images posted in groups, can be named as you wish

## Example queries / mutations

### All the mutations and queries, apart from ``registration / login`` require Bearer token to be sent in the Authorization header as follows: ```Bearer <YOUR TOKEN>```, token is assigned/sent to client upon login.

### For extensive list of all the queries and mutations used check out: [List of Queries and mutations](https://github.com/Lauri92/Travel-Journal/tree/master/app/src/main/graphql/fi/lauriari/traveljournal)

## GraphQL Schema:
```
type Query {
  _: Boolean

  login(username: String!, password: String!): User

  getActiveUser: User

  searchUsers(searchInput: String!): [User]

  getGroup(id: ID!): Group

  getGroupsByUserId: [Group]
}

type Mutation {
  _: Boolean

  registerUser(username: String!, password: String!, nickname: String): User

  addInfoLink(url: String!, group: ID!): Link

  removeInfoLink(groupId: ID!, linkId: ID!): String

  addGroup(members: [UserInput], links: [LinkInput], name: String!, description: String!): Group

  addUserToGroup(groupId: ID!, userId: ID!): Group

  removeUserFromGroup(groupId: ID!, userId: ID!): String

  userSelfLeaveGroup(groupId: ID!): String

  updateGroup(groupId: ID!, name: String!, description: String!): Group

  deleteGroupImage(groupId: ID!, groupImageId: ID!): String

  deleteGroup(groupId: ID!): String

  profilePictureUpload(file: Upload!): File!

  groupAvatarUpload(file: Upload!, groupId: ID!): String!

  groupImageUpload(file: Upload!, groupId: ID!, title: String): String!
}

type User {
  id: ID

  username: String

  nickname: String

  token: String

  profileImageUrl: String
}

input UserInput {
  id: ID

  username: String

  nickname: String
}

type Link {
  id: ID

  user: User

  url: String

  group: ID
}

input LinkInput {
  id: ID

  user: ID

  url: String
}

type Group {
  id: ID

  admin: User

  members: [User]

  links: [Link]

  groupImages: [GroupImage]

  name: String

  description: String

  groupAvatarUrl: String
}

"""
The `Upload` scalar type represents a file upload.
"""
scalar Upload

type File {
  filename: String!

  mimetype: String!

  encoding: String!
}

type GroupImage {
  id: ID

  group: ID

  user: User

  urlStorageReference: String

  title: String
}

schema {
  query: Query
  mutation: Mutation
}
```
