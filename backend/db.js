const moongose = require('moongose')
const Schema = moongose.Schema
const ObjectId = moongose.ObjectId

const user = new Schema({
    name: String,
    email: {
        type: String,
        unique: true
    },
    password: String
})

const todos = new Schema({
    title: String,
    status: Boolean,
    userId: ObjectId
})

const userModel = moongose.model("users",user)
const todoModel = moongose.model("todos",todos)

module.exports = {
    userModel,
    todoModel
}