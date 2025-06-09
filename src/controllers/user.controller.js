import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import { uploadONCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async(req,res) =>{
   //get user details from frontend
   //validation 
   //check if user is already registered
   //check for images,avatar
   //upload avatar,coverimage on cloudinary
   //create user object
   //remove password and refreshtoken for response
   //check for user creation
   //return response 



   
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
    const existedUser = await User.findOne({
        $or :[{username},{email}]
    })
   
    if(existedUser){
        throw new ApiError(409,"User with email or username already exists")
    }

   // console.log(req.files);
    

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage)&& req.files.coverImage.length>0){
        coverImageLocalPath=req.files.coverImage[0].path
    }
    
    if(!avatarLocalPath){
        throw new ApiError(400,"avatar file is required")
    }

    const avatar = await uploadONCloudinary(avatarLocalPath)
    const coverImage=await uploadONCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar:avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"somthing went wrong while registering a user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"user registered Sucessfully")
    )

})

export {registerUser}