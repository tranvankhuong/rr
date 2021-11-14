const express =require('express');
const  router  = express.Router();
const cartModel = require('../models/cart.model');
const courseModel = require('../models/course.model')
const {userGuard, lecturerGuard} = require('../middlewares/auth.mdw')

router.post("/:courseId",userGuard,async(req,res)=>{
    const {accessTokenPayload} = req;
    const courseId = req.params.courseId;
    const validAdd  = await cartModel.isValidOnce(accessTokenPayload.user_id,courseId);
    if(validAdd!==true){
        return res.status(401).json({message: "This course is already in your watch list before"});
    }
    await cartModel.addNewCourseToCart(accessTokenPayload.user_id,courseId);
    res.status(201).json({message: "Added to your watch list"});
})

router.get("/me",userGuard,async (req,res)=>{
    const {accessTokenPayload} = req;
    console.log(accessTokenPayload);
    const cart = await cartModel.getCartByUserId(accessTokenPayload.user_id);
    const courseIds = cart.map(w=>w.course_id);
    let courseInCart = [];
    for(let i = 0 ; i<courseIds.length;i++){
        const course = await courseModel.getCourseById(courseIds[i]);
        courseInCart.push(course);
    }
    //reduceeeeeeeeeeee musted
    res.status(201).json(courseInCart);
})
router.delete("/:courseId",userGuard,async (req,res)=>{
    const {accessTokenPayload} = req;
    const courseId = req.params.courseId;
    try{
        console.log(accessTokenPayload.user_id,courseId);
        const ret = await cartModel.deleteCourseFromItem(accessTokenPayload.user_id,courseId);
        //reduceeeeeeeeeeee musted
        res.status(201).json({message: "Remove course success from Watchlist"});
    }catch(err){
        return res.status(400).json({err:err});
    }
   
})

module.exports =router;