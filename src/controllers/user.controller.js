import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js";

const registerUser = asyncHandler( async(req,res) =>{
   //get user details
    const {fullName,email,username,password} = req.body
    console.log("fullName",fullName);
    console.log("email:",email);
    console.log("username",username);
    console.log("password",password);

    // validation - check if required field is empty
   // first method
   /* if (!username || !email || !fullName || !password || !avatar) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
      second
      if(fullName===""){
      throw new ApiError(400,"full name is required")}
      */
//third approach
   if (
    [fullName,email,password,username].some((field)=> field?.trim()==="")
   ) {
    throw new ApiError(400,"all fields are required")
   }

   //for email 
    if(!email.includes("@")){
        return res.status(400).json({
            sucess:false,
            message:"please enter a calid email address",
        });
    }

    //if already exists
    const existedUser = User.findOne({
        $or :[{username},{email}]
    })
   
    if(existedUser){
        throw new ApiError(409,"User with email or username already exists")
    }

    console.log("request.files");
    

})

export {registerUser}