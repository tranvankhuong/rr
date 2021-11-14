const express = require('express')
const router = express.Router()
const reviewModel  = require('../models/review.model')
const userModel = require('../models/user.model')
const {useGuard, userGuard}  = require('../middlewares/auth.mdw')
router.get('/:courseId',async(req,res)=>{
    const courseId = req.params.courseId;
    const reviews = await reviewModel.getCourseReviews(courseId);
    if(reviews.length === 0) {
        return res.status(204).json({message: "Course has no any reviews"});
    }
    for(let i = 0 ;i < reviews.length ; i++){
        let user = await userModel.isExistByUserId(reviews[i].user_id);
        reviews[i].userFullName = user.user_name;
        reviews[i].userImage  = user.user_image;
    }
    res.status(200).json(reviews);
})
const reviewSchema = require('../schemas/review.schema.json')
router.post('/',userGuard,require("../middlewares/validate.mdw")(reviewSchema),async (req,res)=>{
    const {accessTokenPayload} = req;
    const {feedback,rating,courseId} = req.body;
    console.log({feedback,rating,courseId});
    const timestamp = new Date();
    try{
        const ret = await reviewModel.addNewReview(feedback,rating,accessTokenPayload.user_id,courseId,timestamp);
        const review = await reviewModel.getReviewByReviewId(ret[0]);
        let user = await userModel.isExistByUserId(review[0].user_id);
        const newReview = {
            ...review[0],
            userFullName: user.user_name,
            userImage  : user.user_image
        }
        return res.status(200).json({
            message: "Sent feedback successfully",
            newReview: newReview
        });   
    }catch(err){
        return res.json({message:err});
    }
})
module.exports = router;