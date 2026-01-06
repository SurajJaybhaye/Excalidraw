import express, { json } from "express";
const app = express();
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { middleware } from "./middleware";
import { CreateRoomSchema, CreateUserSchema, SigninSchema} from "@repo/common/types"
import {prisma} from "@repo/db/client"
import "dotenv/config";
import { genSaltSync, hashSync } from "bcrypt-ts";
import { compareSync } from "bcrypt-ts/browser";



app.use(express.json())

app.post("/signup" , async(req,res) =>{
    
    const parsedData = CreateUserSchema.safeParse(req.body);
    if(!parsedData.success){
        res.json({
            message : " Incorrect Inputs"
        })
        return ;
    }

    const salt = genSaltSync(5);
    const result = hashSync(parsedData.data.password, salt);

    try {
        await prisma.user.create({
        data: {
        email : parsedData.data?.username,
        password : result,
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
app.post("/signin" , async(req,res) =>{

    const parsedData = SigninSchema.safeParse(req.body);
    if(!parsedData.success){
        res.json({
            message : " Incorrect Inputs"
        })
        return;
    }
    const hash = parsedData.data.password;

    const user = await prisma.user.findFirst({
        where: {
            email: parsedData.data.username
        }
    })
    if (!user) {
        res.status(403).json({
            message: "Not authorized"
        })
        return;
    }

    const hashed = user.password;

    if(!compareSync(parsedData.data.password, hashed)){
        return;
    }


    const token = jwt.sign({
        userId: user?.id
    }, JWT_SECRET);

    res.json({
        token
    })
})
app.post("/room", middleware, async (req, res) => {
    const parsedData = CreateRoomSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.json({
            message : " Incorrect Inputs"
        })
        return;
    }
    
    const userId = req.userId;
    
     try {
        const room = await prisma.room.create({
            //@ts-ignore
            data: {
                slug: parsedData.data.name,
                adminId: userId
            }
        })

        res.json({
            roomId: room.id
        })
    } catch(e) {
        res.status(411).json({
            message: "Room already exists with this name"
        })
    }
})

app.get("/chats/:roomId", async (req, res) => {
    const roomId = Number(req.params.roomId);
    const messages = await prisma.chat.findMany({
        where: {
            roomId: roomId
        },
        orderBy: {
            id: "desc"
        },
        take: 50
    });

    res.json({
        messages
    })
})

app.listen(3001);