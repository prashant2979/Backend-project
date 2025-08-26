import mongoose from "mongoose";
import {DB_NAME} from "./constant.js";
import dotenv from "dotenv"


dotenv.config({
    path:'./env'
})
import connectDB from "./db/index.js";

connectDB()
.then(()=>{
    app.listen(process.env.PORT|| 8000, ()=>{
        console.log(`sever is running at port : ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("mongo db connnection is fail",err);
})





















/*import express from "express";
const app=express()

// function connectDB(){}

;(async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${process.env}`) 
        app.on("error",()=>{
            console.log("error",error);
            throw error
        })
        app.listen(process.env,PORT,()=>{
            console.log(`APP IS LISTENING ON PORT ${process.env.PORT}`);
        })
    } catch (error) {
        console.error("ERROR",error)
        throw error
    }
})()*/