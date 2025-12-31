import express, { json } from "express";
const app = express();
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { middleware } from "./middleware";
import { CreateRoomSchema, CreateUserSchema, SigninSchema} from "@repo/common/types"
import {prisma} from "@repo/db/client"
import "dotenv/config";



app.use(express.json())

app.post("/signup" , async(req,res) =>{
    
    const parsedData = CreateUserSchema.safeParse(req.body);
    if(!parsedData.success){
        res.json({
            message : " Incorrect Inputs"
        })
        return ;
    }

    try {
        await prisma.user.create({
        data: {
        email : parsedData.data?.username,
        password : parsedData.data.password,
        name : parsedData.data.name
        }
        })
        res.status(200).json({
            message:" User Signup"
        })
    }catch(e){
        console.log(e);
        res.status(411).json({
            message: "User already Exist"
        })
    }
})
app.post("/signin" , (req,res) =>{

    const data = SigninSchema.safeParse(req.body);
    if(!data.success){
        return res.json({
            message : " Incorrect Inputs"
        })
    }
    const userId = 1;
    const token = jwt.sign({
        userId
    }, JWT_SECRET);

    res.json({
        token
    })
})
app.post("/room" , middleware, (req,res) =>{

    const data = CreateRoomSchema.safeParse(req.body);
    if(!data.success){
        return res.json({
            message : " Incorrect Inputs"
        })
    }
    
    res.json({
        userId : "123"
    })
})

app.listen(3001);