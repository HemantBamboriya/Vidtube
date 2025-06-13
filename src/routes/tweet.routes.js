import { createTweet,getUserTweets,updateTweet,deleteTweet } from "../controllers/tweet.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()

router.use(verifyJWT)//apply verifyJwt to all routes

router.route("/create-tweet").post(createTweet);
router.route("/user/:userId").get(getUserTweets);
router.route("/update-tweet/:tweetId").patch(updateTweet);
router.route("/delete-tweet/:tweetId").delete(deleteTweet)

export default router