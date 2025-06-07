import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app= express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"}))//pahle body parser use karna pdta tha ye middlewares hai
app.use(express.urlencoded({extended:true,limit:"16kb"}))//to handle url on site
app.use(express.static("public"))//to store image 
app.use(cookieParser())//user ke browser ki cookie access and set karne ke liye from our server to perform CRUD operation

export {app}








