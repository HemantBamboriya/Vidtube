import mongoose, { isValidObjectId, mongo } from "mongoose";
import { Comment, Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Video from "../models/video.model.js"


const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
   // Steps to get all video comments
  // take videoId from req.params
  // take queries from req.query
  // use mongoose exists() to check if video exists
  // Now, define mongodb aggregation pipeline
  // Use them in function called with
  // modelName.aggregatePaginate(pipelineDefineAbove, {page, limit})
  // options = {page,limit}
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"invalid video id ")
    }

    const isVideoExists = Video.findById(videoId)

    if(!isVideoExists){
        throw new ApiError(400,"video  not found for comment")
    }

    const options={
      page: parseInt(page),
  limit: parseInt(limit),
    }

    const getComments = Comment.aggregate(
        [
            {
                $match:{
                    video : new mongoose.Types.ObjectId(videoId)
                }
            },
            {
                $sort:{
                    createdAt:-1,
                }
            }
        ]
    );

    const getAllcomments = await Comment.aggregatePaginate(getComments,options)

    if(getAllcomments.totalDocs === 0){
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "video has no commments"
            )
        )
    }


    return res.
    status(200)
    .json(
        new ApiResponse(
            200,
            getAllcomments,
            "all comments are fetched successfully"
        )
    )


    

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
      // Steps to add comment
  // take comment content from req.body
  // take videoId on which to comment from req.params
  // find video using videoId
  // validate video (means if exists)
  // No need to find comment like you find likes bcz you can have multiple comment
  // create comment
  // validate it
  // response

  const {content} = req.body
  const {videoId} = req.params
  const userId = req.user?._id

  if(!content || !videoId){
    throw new ApiError(400,"all fields are required")
  }

  if(!isValidObjectId(videoId)|| !isValidObjectId(userId)){
    throw new ApiError(400,"invalid video or user Id")
  }

  const video = await Video.findById(videoId)

  if(!video){
    throw new ApiError(400,"video not found")
  }

  const comment = await Comment.create({
    content,
    video:videoId,
    owner:userId

  })

if(!comment){
    throw new ApiError(400,"error while uploading a comment")
}

return res
.status(200)
.json(
    new ApiResponse(
        200,
        comment,
        "comments added sucessfully"
    )
)

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
     // Steps to update comment
  // take comment id from req.params
  // take updated content from req.body
  // validate comment id using isValidObjectId
  // use findByIdAndUpdate() method to update comment
  // response

  const {commentId} = req.params
  const {content} = req.body

if(!commentId || !content){
    throw new ApiError(400,"all fields are required")
}

  if(!isValidObjectId(commentId)){
    throw new ApiError(400,"invalid comment id")
  }

  const comment = await Comment.findByIdAndUpdate(
    commentId,
    {
       content
    },
    {new:true}
  )

  if(!comment){
    throw new ApiError(400,"comment not found")
  }

  return res
  .status(200)
  .json(
    new ApiResponse(
        200,
        comment,
        "comment updated sucessfully"
    )
  )

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

    const {commentId} = req.params


    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"invalid comment id")
    }

    const comment = await Comment.findByIdAndDelete( commentId )

    if(!comment){
     throw new ApiError(400,"comment not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
        {},
    "comment is deleted successfully")
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }