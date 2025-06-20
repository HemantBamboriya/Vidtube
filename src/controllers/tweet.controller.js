import mongoose,{isValidObjectId} from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import {Tweet} from "../models/tweet.model.js";


const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    // steps to create tweet
  // take content for tweet from req.body
  // validate it
  // store user id in variable from req.user._id
  // create tweet
  // validate it
  // response

  const {content} = req.body;
   const userId=  req.user?._id;

   if(!content){
    throw new ApiError(400,"content is required")
   }

   if(!isValidObjectId(userId)){
    throw new ApiError(400,"invalid user Id... try again")
   }

   const tweet = await Tweet.create({
    content,
    owner:userId
   })

   if(!tweet){
    throw new ApiError(400,"Error while creating tweet")
   }

   return res
   .status(200)
   .json(
    new ApiResponse(200,tweet,"tweet created sucessfully")
   )


})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
     // steps to get user tweets
  // take user id from req.params
  // validate it
  // check if user exists with that id
  // find user tweet by using find() method
  // validate it
  // response

 const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "user not found");
  }

  const options = {
     page: parseInt(page),
  limit: parseInt(limit),
  };

  const userObjectId = new mongoose.Types.ObjectId(userId);

  const tweets = Tweet.aggregate([
    {
      $match: { owner: userObjectId },
    },
     // Optional: sort tweets by date
  {
    $sort: { createdAt: -1 },
  }
  ]);

  const userTweets = await Tweet.aggregatePaginate(tweets, options);

  if (userTweets.totalDocs === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "user has not tweeted yet"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, userTweets, "user tweets fetched successfully"));


})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    // steps to update tweet
  // take tweet id from req.params
  // take content to update
  // validate them
  // use findByIdAndUpdate() method
  // validate it
  // response

  const {tweetId}= req.params
  const {content}= req.body

  if(!content){
    throw new ApiError(400,"content is required to modified")
  }

  if(!isValidObjectId(tweetId)){
    throw new ApiError(400,"invalid tweet id")
  }

  const newTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
        $set:{
            content
        }
    },{
        new :true
    }
  )

  if(!newTweet){
    throw new ApiError(404,"tweet not found")
  }

  return res
  .status(200)
  .json(
    new ApiResponse(
        200,
        newTweet,
        "tweet is updated sucessfully"
    )
  )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
     // steps to delete tweet
  // take tweet id from req.params
  // validate it
  // use findByIdAndDelete() method
  // validate it
  // response

  const {tweetId}= req.params

  if(!isValidObjectId(tweetId)){
    throw  new ApiError(400,"tweet id is invalid")
  }

  const tweet = Tweet.findByIdAndDelete(tweetId)

  if(!tweet){
    throw new ApiError(400,"tweet not found")
  }

  return res
  .status(200)
  .json(
    new ApiResponse(
        200,
        {},
        "tweet was deleted sucessfully"
    )
  )
})


export { 
         createTweet,
         getUserTweets,
         updateTweet,
         deleteTweet
        }

