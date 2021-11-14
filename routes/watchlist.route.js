const express =require('express');
const  router  = express.Router();
const watchListModel = require('../models/watchlist.model');
const courseModel = require('../models/course.model')
const {userGuard, lecturerGuard} = require('../middlewares/auth.mdw')

router.post("/:courseId",userGuard,async(req,res)=>{
    const {accessTokenPayload} = req;
    const courseId = req.params.courseId;
    const validAdd  = await watchListModel.isValidOnce(accessTokenPayload.user_id,courseId);
    if(validAdd!==true){
        return res.json({message: "This course is already in your watch list before"});
    }
    await watchListModel.addNewWatchList(accessTokenPayload.user_id,courseId);
    res.status(201).json({message: "Added to your watch list"});
})

router.get("/me",userGuard,async (req,res)=>{
    const {accessTokenPayload} = req;
    console.log(accessTokenPayload);
    const wList = await watchListModel.getWatchListByUserId(accessTokenPayload.user_id);
    const courseIds = wList.map(w=>w.course_id);
    let wListDetail = [];
    for(let i = 0 ; i<courseIds.length;i++){
        const course = await courseModel.getCourseById(courseIds[i]);
        wListDetail.push(course);
    }
    //reduceeeeeeeeeeee musted
    res.status(201).json(wListDetail);
})
router.delete("/:courseId",userGuard,async (req,res)=>{
    const {accessTokenPayload} = req;
    const courseId = req.params.courseId;
    try{
        console.log(accessTokenPayload.user_id,courseId);
        const ret = await watchListModel.deleteWatchList(accessTokenPayload.user_id,courseId);
        //reduceeeeeeeeeeee musted
        res.status(201).json({message: "Remove course success from Watchlist"});
    }catch(err){
        return res.status(400).json({err:err});
    }
   
})

module.exports =router;