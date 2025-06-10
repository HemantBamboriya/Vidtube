import mongoose,{mongo, Schema} from "mongoose";

const subscriptionSchema = new Schema(
    {
     subscriber :{
        type: Schema.Types.ObjectId,//one who is subscribing
        ref:"User"
     },
     channel:{
        type: Schema.Types.ObjectId,//one to whom subscripber is subscribing
        ref:"User"

     }
    },{timestamps:true})


export const subscription = mongoose.model("Subscription",subscriptionSchema);