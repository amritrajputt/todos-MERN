const express = require('express')
const app = express()
app.use(express.json())
const jwt = require('jsonwebtoken')
const { z } = require('zod')
const moongose = require('mongoose')
const { userModel, todoModel } = require('./db')

moongose.connect("mongodb+srv://amritrajput:tCB4Oq5LbwbkpCPb@cluster0.m6sem7b.mongodb.net/full-stack-todo")
const JWT_SECRET = "amrit_shing__razput"


app.post("/signup", async (req, res) => {


    const name = req.body.name
    const email = req.body.email
    const password = req.body.password


    const requiredInput = z.object({
        email: z.string().min(15).max(70).email()

            .refine((value) => value.includes('@'), {
                message: 'email must contain @'
            })

            .refine((value) => [...value].some((c) => c >= 'A' && c <= 'Z'), {
                message: "Email must contain at least one uppercase letter",
            })

            .refine((value) => [...value].some((c) => c >= 'a' && c <= 'z'), {
                message: "Email must contain at least one lowercase letter",
            })

            .refine((value) => [...value].some((c) => c >= '0' && c <= '9'), {
                message: "Email must contain at least one number"
            }),

        password: z.string().min(8).max('20')

            .refine((value) => [...value].some((c) => c >= 'A' && c <= 'Z'), {
                message: "Email must contain at least one uppercase letter",
            })

            .refine((value) => [...value].some((c) => c >= 'a' && c <= 'z'), {
                message: "Email must contain at least one lowercase letter",
            })

            .refine((value) => [...value].some((c) => c >= '0' && c <= '9'), {
                message: "Email must contain at least one number"
            }),

        name: z.string().min(3).max('30')
    })

    const parsedDataWithSuccess = requiredInput.safeParse(req.body)
    if (!parsedDataWithSuccess.success) {
        res.json({
            message: "Incorrect format",
            error: parsedDataWithSuccess.error
        })
        return
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 5)

        await userModel.create({
            name: name,
            email: { type: String, unique: true },
            password: hashedPassword
        })

    } catch (error) {
        return res.status(400).json({
            message: "User already exists!",
        });
    }
    res.json({
        message: "you are signed up"
    })

})


app.post("/signin", (req, res) => {

})


app.post("/addtodo", (req, res) => {

})


app.get("/todo", (req, res) => {

})

app.listen('3000')