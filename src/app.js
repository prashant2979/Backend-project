import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

const app=express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({ limit: "16kb" }))

app.use(express.urlencoded({extended:true,limit:"16kb"}))

app.use(express.static("public"))

app.use(cookieParser())

//route import
import userRouter from './routes/user.route.js'
 
//route decleartion
app.use("/api/v1/user",userRouter)
//https:localhost:8000/api/v1/register/

export{app}