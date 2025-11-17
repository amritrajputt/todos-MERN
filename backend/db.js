const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = mongoose.ObjectId

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
    status: String,
    userId: ObjectId
})

const userModel = mongoose.model("users",user)
const todoModel = mongoose.model("todos",todos)

module.exports = {
    userModel,
    todoModel
}