const express = require('express')
const app = express()
app.use(express.json())
const jwt = require('jsonwebtoken')
const { z } = require('zod')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const { userModel, todoModel } = require('./db')

mongoose.connect("mongodb+srv://amritrajput:tCB4Oq5LbwbkpCPb@cluster0.m6sem7b.mongodb.net/full-stack-todo")
const JWT_SECRET = "amrit_shing__razput"

app.post("/signup", async (req, res) => {


    const name = req.body.name
    const email = req.body.email
    const password = req.body.password


    const requiredInput = z.object({
        email: z.string()
            .min(6).max(70)
            .email(),

        password: z.string()
            .min(8).max(20)
            .refine((value) => [...value].some((c) => c >= 'A' && c <= 'Z'), {
                message: "Password must contain at least one uppercase letter",
            })
            .refine((value) => [...value].some((c) => c >= 'a' && c <= 'z'), {
                message: "Password must contain at least one lowercase letter",
            })
            .refine((value) => [...value].some((c) => c >= '0' && c <= '9'), {
                message: "Password must contain at least one number",
            }),

        name: z.string().min(3).max(30)

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
            email: email,
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


app.post("/signin", async (req, res) => {
    const email = req.body.email
    const password = req.body.password

    const user = await userModel.findOne({
        email: email
    })
    if (!user) {
        res.status(403).json({
            message: "User doesn't exist in our DB"
        })
        return
    }

    const isPasswordmatched = await bcrypt.compare(password, user.password)

    if (isPasswordmatched) {
        const token = jwt.sign({
            id: user._id.toString()
        }, JWT_SECRET)
        res.json({
            token
        })
        console.log(token);
    } else {
        res.json({
            message: "Incorrect credential"
        })
    }
    
    
})


const auth = (req, res, next) => {
    const token = req.headers.token;

    if (!token) {
        return res.status(401).json({ message: "Token missing" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userID = decoded.id;
        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid token" });
    }
};




app.post("/addtodo", auth, async (req, res) => {
    const { title, status } = req.body
    const userId = req.userID

    if (!title || !status) {
        return res.status(400).json({ message: "Missing fields" });
    }

    await todoModel.create({
        title: title,
        status: status,
        user: userId
    })

    res.json({ message: "Todo added" });
})


app.get("/todo", (req, res) => {

})

app.listen('3000',
    console.log("server is running")
)