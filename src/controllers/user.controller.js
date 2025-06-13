import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import { uploadONCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
//password of user is 123456 and username= hemant full name = hemantdhakad

const generateAccessAndRefreshTokens = async(UserId)=>{
    try {
        const user = await User.findById(UserId)
        const accessToken = user.generateAccessToken()
        const refreshToken= user.generateRefreshToken()

        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"somthing went wrong while generating refersh and access tokens")
    }
}
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

const loginUser = asyncHandler(async(req,res)=>{
//req.body - data lo frontend se
//username or email  enter karvao
//find the user
//password check
//access and refresh token send 
//send through cookie

const {username,password,email} = req.body
    console.log(email)

if(!username && !email){
    throw new ApiError(400,"username and email is required")
}
    //if you want only one for login
   // if(!(username|| email)){
//throw new ApiError(400,"username and email is required")
 //   }

const user=await  User.findOne({
    $or: [{username},{email}]
})

if(!user){
    throw new ApiError(404,"User does not exist")
}

const isPasswordValid = await user.isPasswordCorrect(password)

if(!isPasswordValid){
    throw new ApiError(401,"invalid user credentials")
}

 const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)

const loggedInUser= await User.findById(user._id).select("-password -refreshToken")

const options={
    httpOnly:true,
    secure:true
}

return res
.status(200)
.cookie("accessToken",accessToken,options)
.cookie("refreshToken",refreshToken,options)
.json(
    new ApiResponse(
        200,
        {
            user:loggedInUser,accessToken,refreshToken
        },
        "user logged In successfully"
    )
)

})

const logoutUser = asyncHandler(async(req,res)=>{
  await User.findByIdAndUpdate(
    req.user._id,
    {
        $unset:{
            refreshToken :1
        }
    },
        {
            new:true
        }
     )

     const options={
        httpOnly :true,
        secure:true
     }
     return res
     .status(200)
     .clearCookie("accessToken",options)
     .clearCookie("refreshToken",options)
     .json(new ApiResponse(200,{},"user logged out sucessfully"))
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request")
    }

    try {
        const decodedToken=jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user= await User.findById(decodedToken?._id)

        if(!user){
            throw new ApiError(401,"Invalid refersh token")
        }

        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"refersh token is epired or used")
        }

        const options={
            httpOnly:true,
            secure:true
        }

        const {accessToken,newRefreshToken} = await generateAccessAndRefreshTokens(user._id)

        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,refreshToken:newRefreshToken
                },
                "Access token refreshed"
            )
        )

    } catch (error) {
        throw new ApiError(401, error?.message || "invalid refersh token")
        
    }
})

const changeCurrentPassword = asyncHandler(async(req,res)=>{

    const {oldPassword , newPassword} = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400,"invalid old password")
    }

    user.password= newPassword
    await user.save({validateBeforeSave:false})
    
    return res
    .status(200)
    .json(
      new ApiResponse(200,{},"Password is changed successfully")    )
})


const getCurrentUser = asyncHandler(async (req,res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200, req.user , "current user fetched successfully"))

})

const updateAccountDetails = asyncHandler(async(req,res)=>{

    const {fullName,email} = req.body

    if(!fullName || !email){
        throw new ApiError(400,"all fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName:fullName,
                email:email

            }
        },{
            new:true
        }
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"account details updated sucessfully"))
})

const updateUserAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is missing")
    }
// delete old avatar :TODO
    const avatar= await uploadONCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400,"error while uploading on clodinary")

    }

    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar : avatar.url
            }
        },{
            new:true
        }
    ).select("-password")

     return res.
    status(200)
    .json(new ApiResponse(200,user,"avatar updated successfully"))

    
})

const updateUserCoverImage = asyncHandler(async(req,res)=>{
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400,"Avatar file is missing")
    }

    const coverImage= await uploadONCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400,"error while uploading on clodinary")

    }

   const user= await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage : coverImage.url
            }
        },{
            new:true
        }
    ).select("-password")


    return res.
    status(200)
    .json(new ApiResponse(200,user,"coverImage updated successfully"))
})

const getUserChannelProfile = asyncHandler(async(req,res)=>{
 
   const {username} =req.params

   if(!username?.trim()){
 throw new ApiError(400,"username is missing")
   }

   const channel= await User.aggregate(
    [
        {
            $match :{
                username :username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                SubscribersCount:{
                    $size:"$subscribers"
                },
                channelSubscribedToCount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }

                }
            }
        },
        {
            $project:{
                fullName : 1,
                email:1,
                avatar :1,
                coverImage:1,
                SubscribersCount:1,
                channelSubscribedToCount:1,
                isSubscribed:1,
                username:1,   
            }
        }
    ]
   )

   if(!channel?.length){
    throw new ApiError(404,"channel does not exists")
   }

   return res
   .status(200)
   .json(new ApiResponse(200,channel[0],"user channel fatched sucessfully"))
})

const getWatchHistory = asyncHandler(async (req,res)=>{

    const user = await User.aggregate([
        {
            $match:{
              _id : new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        username:1,
                                        fullName:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "watch history fetched sucessfully")
    )
})


export {
         registerUser,
         loginUser,
         logoutUser,
         refreshAccessToken,
         changeCurrentPassword,
         getCurrentUser,
         updateAccountDetails,
         updateUserAvatar,
         updateUserCoverImage,
         getUserChannelProfile,
         getWatchHistory
        }
