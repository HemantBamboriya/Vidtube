import dotenv from "dotenv"
import connectDB from "./db/index.js";
dotenv.config({
    path: './env'
})

connectDB()
//because asynchronous method return a promise 
.then(()=>{
    app.on("error",(error)=>{
        console.log("application is not able to talk to database",error)
        throw error;
    })

    app.listen(process.env.PORT || 8000,()=>{
        console.log(`server is listening at ${process.env.PORT}`);
    })
})

.catch((error)=>{
    console.log("MongoDb connection failed !!",error)
})



/*
import mongoose from "mongoose";
import { DB_NAME } from "./constants";

import express from "express"
const app= express();

(async () =>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`)
        app.on("error",(error)=>{
            console.log("application is not able to talk to database",error)
            throw error
        })

        app.listen(process.env.PORT,()=>{
            console.log(`server is listening at ${process.env.PORT}`);
            
        })
    }
    catch(error){
    console.error("ERROR:",error)
    throw error
    }

})()
    */