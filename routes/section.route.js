const express = require('express');
const router = express.Router();
const sectionModel = require('../models/section.model');
const videoModel = require('../models/video.model');
const {DeleteVideoFile} = require('../services/file.services')
const {userGuard, lecturerGuard} = require('../middlewares/auth.mdw')
/*

------------
course section api
------------

*/

router.post('/',lecturerGuard,async (req,res)=>{
    const {courseId,sectionTitle} = req.body;
    const newSection = {
        section_title: sectionTitle,
        course_id: courseId
    }
    try{
        const ret = await sectionModel.addNewSections(newSection);
        const retSection = await sectionModel.getSectionBySectionId(ret[0]);
        res.status(201).json({
            message:"Upload sections successfully",
            newSection: {
                ...retSection,
                videos: []
            },
        });
    }catch(err){
        return res.status(400).json({message:err});
    }
})


//update course section info
router.patch('/:sectionId',lecturerGuard,async (req,res)=>{
    const {sectionTitle} = req.body;
    const sectionId = req.params.sectionId;
    
    try{
        const ret = await sectionModel.updateSection(sectionId,sectionTitle);
        res.status(201).json({
            message:"Upload sections successfully"
        });
    }catch(err){
        return res.status(400).json({message:err});
    }
})

router.delete('/:sectionId',lecturerGuard,async(req,res)=>{
    const sectionId = +req.params.sectionId;
    
    const section = await sectionModel.getSectionBySectionId(sectionId);
    if(section === null){
        return res.status(400).json({message: "section id not found"});
    }
    //get video from db
    const videos = await videoModel.getAllVideoBySectionId(sectionId);
    if(videos!==null){
        //get video path if not null to delete
        const videoPaths = videos.filter(v=>(v.video_path !== null));

        if(videoPaths.length!==0){
            const videoPathAll = videoPaths.map(v=>v.video_path)
            DeleteVideoFile(videoPathAll);
        }
        try{
            
            await sectionModel.deleteSection(sectionId);
            return res.status(200).json({message: "Delete section successfully"});
        }catch(err){
            return res.status(400).json({message:err});
        }
    }
    await sectionModel.deleteSection(sectionId);
    res.status(200).json({message: "Delete section successfully"});
    
})

module.exports = router;