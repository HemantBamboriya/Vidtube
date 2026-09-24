import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
const { default: connectDB } = await import("./db/index.js");
const { app } = await import("./app.js");

const PORT = process.env.PORT || 8000;

connectDB()
//because asynchronous method return a promise 
.then(()=>{
    app.on("error",(error)=>{
        console.log("application is not able to talk to database",error)
        throw error;
    })

    app.listen(PORT,()=>{
        console.log(`server is listening at ${PORT}`);
    })
})

.catch((error)=>{
    console.log("MongoDb connection failed !!",error)
})
