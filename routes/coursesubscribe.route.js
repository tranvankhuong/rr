const express = require('express');
const router = express.Router();
const courseSubscribeModel = require('../models/coursesubscribe.model')
const courseModel = require('../models/course.model')

const {userGuard, lecturerGuard} = require('../middlewares/auth.mdw')

router.get("/me",userGuard,async (req,res)=>{
    const {accessTokenPayload} = req;
    const csList = await courseSubscribeModel.getCourseSubcribeList(accessTokenPayload.user_id);
    let csListDetail = [];
    for(let i = 0 ; i<csList.length;i++){
        const course = await courseModel.getCourseById(csList[i].course_id);
        course.purchased_date = csList[i].purchased_date;
        course.purchased_total = csList[i].purchased_total;
        csListDetail.push(course);
    }
    //reduceeeeeeeeeeee musted
    res.status(201).json(csListDetail);
})
//buying courses
const checkoutSchema = require('../schemas/checkout.schema.json');
router.post('/checkout',userGuard,require('../middlewares/validate.mdw')(checkoutSchema),async (req,res)=>{
    const {accessTokenPayload} = req;
    const {courseIdList}  =req.body;
    if(courseIdList.length === null){
        return res.status(400).json({message:"empty cart"});
    }
    let purchasedCourseList = [];
    console.log(courseIdList);
    for(let i = 0; i < courseIdList.length ; i ++ ){
        const course = await courseModel.getCourseById(courseIdList[i]);
        const purchasedCourse = {};
        purchasedCourse.user_id = accessTokenPayload.user_id;
        purchasedCourse.course_id = courseIdList[i];
        // console.log(`Course id ${course.course_id}, course price/saleoff ${course.price}/${course.saleoff}`)
        purchasedCourse.purchased_date = new Date();
        purchasedCourse.purchased_total = (course.saleoff===null) ? course.price : course.price *(1-course.saleoff);
        // console.log(`purchased id `, JSON.stringify(purchasedCourse,null,2));
        purchasedCourseList.push(purchasedCourse);
    }
    await courseSubscribeModel.addMultiPurchasedCourse(purchasedCourseList);
    //other payment methods hereeeeeeeee, implementation later




    
    res.status(200).json({message: "Purchasing course  successfully"});
})

module.exports = router;