const express = require('express')
const app = express()
require('dotenv').config();
app.use(express.json())
const jwt = require('jsonwebtoken')
const { z } = require('zod')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const { userModel, todoModel } = require('./db')
const cors = require('cors');
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DB connected"))
  .catch(err => console.log(err));

const JWT_SECRET = process.env.JWT_SECRET;

app.get('/',(req,res) => {
    res.send({
        activeStatus:true,
        error:false
    })
})
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

    const todo = await todoModel.create({
        title: title,
        status: status,
        userId: userId
    })

    res.json({ message: "Todo added" , todo});
})


app.get("/todo", auth, async (req, res) => {
    try {
        const userId = req.userID;

        if (!userId) {
            return res.status(403).json({ message: "User is not registered in DB" });
        }
        const todos = await todoModel.find({ userId: userId });
        return res.status(200).json({
            message: "Todos fetched successfully",
            todos
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});


app.delete('/deletetodo/:id', auth, async (req, res) => {
    try {
        const userId = req.userID
        const todoId = req.params.id;
        const todo = await todoModel.findOneAndDelete({ _id: todoId, userId })
        if (!todo) {
            return res.status(404).json({ message: "Todo not found or not authorized" });
        }
        res.json({ message: "Todo deleted" });
    } catch (err) {

        res.status(500).json({ message: "Server error" });

    }
})

app.patch('/updatetodo/:id', auth, async (req, res) => {
    try {
        const userId = req.userID
        const todoId = req.params.id;
        const { title, status } = req.body
        if (!title && !status) {
            return res.status(400).json({ message: "Please provide something to update." });
        }
        const updateFields = {};
        if (title) updateFields.title = title;
        if (status) updateFields.status = status;

        const todo = await todoModel.findOneAndUpdate(
            { _id: todoId, userId },
            updateFields,
            { new: true }
        );

        if (!todo) {
            return res.status(404).json({ message: "Todo not found or not authorized" });
        }

        res.json({ message: "Todo updated", todo });
    } catch (err) {

        res.status(500).json({ message: "Server error" });

    }
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
