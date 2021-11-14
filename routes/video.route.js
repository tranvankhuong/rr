const express = require('express');
const router = express.Router();
const sectionModel = require('../models/section.model');
const videoModel = require('../models/video.model');
const multer = require('multer');
const {DeleteVideoFile} = require('../services/file.services')
const uploadFile = require('../services/fileupload.services')
const {userGuard, lecturerGuard} = require('../middlewares/auth.mdw')
/*

------------
course video api
------------

*/


//create video first, return video id
router.post('/',lecturerGuard,async (req,res)=>{
    const {sectionId,videoTitle} = req.body;
    
    if(sectionId === null || videoTitle === null){
        return res.status(200).json({message:"Video title must be not empty"});
    }
    const newVideo = {
        video_title: videoTitle,
        preview_status: false,
        section_id: sectionId
    }
    try{
        const ret = await videoModel.addNewVideo(newVideo);
        const video = await videoModel.getVideoByVideoId(ret[0]);
        res.status(201).json({
            message:"Upload video title successfully",
            newVideo: video
        });
    }catch(err){
        return res.status(400).json({message:err});
    }
})

//create video first, return video id
router.patch('/:videoId',lecturerGuard,async (req,res)=>{
    const videoId = req.params.videoId;
    const {videoTitle,videoPreviewStatus} = req.body;
    
    if( videoTitle === null){
        return res.status(200).json({message:"Video title must be not empty"});
    }
    const updateVideoTitle = {
        video_title: videoTitle,
        preview_status: videoPreviewStatus
    }
    try{
        const ret = await videoModel.updateVideoTitle(videoId,updateVideoTitle);
        res.status(201).json({
            message:"Update video title successfully"
        });
    }catch(err){
        return res.status(400).json({message:err});
    }
})
//edittttttttting
const uploadVideo = multer({storage:uploadFile("video")}).single("video");
router.patch('/:videoId/upload',lecturerGuard,uploadVideo,async (req,res)=>{
    const videoId = +req.params.videoId;
    const videoFromDB = await videoModel.getVideoByVideoId(videoId);
    if(videoFromDB.video_path !== null){
        DeleteVideoFile([videoFromDB.video_path]);
    }
    await videoModel.updateVideo(videoId,req.file.filename);
    return res.status(200).json({message:"upload video successfully!",videoPath:req.file.filename});
})


router.delete('/:videoId',lecturerGuard,async (req,res)=>{
    const videoId = req.params.videoId;
    const videoFromDB = await videoModel.getVideoByVideoId(videoId);
    if(videoFromDB.video_path !== null){
        DeleteVideoFile([videoFromDB.video_path]);
    }
    await videoModel.delete(videoId);
    return res.status(200).json({message:"Delete video successfully!"});
})

//api chatbot
router.get('/section/:sectionId',async (req,res)=>{
    const sectionId = req.params.sectionId;
    const videos = await videoModel.getAllVideoBySectionIdLiteral(sectionId);
    
    return res.status(200).json(videos);
})

router.get('/:videoId',async (req,res)=>{
    const videoId = req.params.videoId;
    const videoFromDB = await videoModel.getVideoByVideoId(videoId);
    return res.status(200).json(videoFromDB);
})
module.exports = router;