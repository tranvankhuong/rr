const express = require('express');
const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs')
const router  = express.Router();
const jwt  = require('jsonwebtoken');
const randomString = require('randomstring');
const authServices = require('../services/auth.services')

const multer = require('multer');
const uploadFile = require('../services/fileupload.services')
const { DeleteProfileImageFile} = require('../services/file.services')
const {userGuard, lecturerGuard} = require('../middlewares/auth.mdw')

const STATUS_VERIFY = process.env.STATUS_VERIFY || "verify";
const STATUS_ACTIVE = process.env.STATUS_ACTIVE || "active";
const STATUS_UPDATE = process.env.STATUS_UPDATE || "update";

const SECRET_KEY = process.env.SECRET_KEY || "HCMUSWEBNC";

 router.delete('/delete-user',async (req,res)=>{
    const user_id= +req.body.user_id;
    res.json(await userModel.deleteUser(user_id)).end();
})

router.post('/add-lecture',async (req,res)=>{
    const { user_name, user_firstname,user_lastname,user_password,user_email,user_dob,user_role,refresh_token} = req.body;
    const lecture = {
         user_name,
         user_firstname,
         user_lastname,
         user_password,
         user_email,
         user_dob,
         user_role: "lecture",
         refresh_token
      };
    res.json(await userModel.addLecture(lecture)).end();
})
router.get('/all-learner',async (req,res)=>{
    const page = +req.query.page;
    const result = await userModel.allLearner(page);
    if(result.length ===0){
        return res.status(204).end();
    }
    res.status(200).json(result).end();
})
router.get('/all-lecture',async (req,res)=>{
    const page = +req.query.page;
    const result = await userModel.allLecture(page);
    if(result.length ===0){
        return res.status(204).end();
    }
    res.status(200).json(result).end();
});
router.get("/all-disable-lecture", async (req, res) => {
    const page = +req.query.page;
    const result = await userModel.allDisableLecture(page);
    if (result.length === 0) {
      return res.status(204).end();
    }
    res.status(200).json(result).end();
  });
  router.get("/all-disable-learner", async (req, res) => {
    const page = +req.query.page;
    const result = await userModel.allDisableLearner(page);
    if (result.length === 0) {
      return res.status(204).end();
    }
    res.status(200).json(result).end();
  });


router.get('/me',userGuard,async (req,res)=>{
    const {accessTokenPayload} = req;
    const user = await userModel.isExistByUsername(accessTokenPayload.user_username);
    res.json({
        username: user.user_username,
        fullname: user.user_name,
        firstname: user.user_firstname,
        lastname: user.user_lastname,
        email: user.user_email,
        dob: user.user_dob,
        image: user.user_image,
        description: user.user_description,
        organization: user.user_organization
    }).end();
});
router.get('/:userId',async (req,res)=>{
    const userId = req.params.userId;
    const user = await userModel.isExistByUserId(userId);
    res.json({
        userId :user.user_id,
        username: user.user_username,
        fullname: user.user_name,
        firstname: user.user_firstname,
        lastname: user.user_lastname,
        email: user.user_email,
        dob: user.user_dob,
        image: user.user_image,
        description: user.user_description,
        organization: user.user_organization
    }).end();
});

router.get('/lecturer/:userId',async (req,res)=>{
    const userId = req.params.userId;
    const user = await userModel.isExistByUserId(userId);
    res.json({
        userId :user.user_id,
        username: user.user_username,
        fullname: user.user_name,
        firstname: user.user_firstname,
        lastname: user.user_lastname,
        email: user.user_email,
        dob: user.user_dob,
        image: user.user_image,
        description: user.user_description,
        organization: user.user_organization
    }).end();
});

router.patch("/disable", async (req, res) => {
    const userId = req.body.userId;
    try {
      await userModel.disableUser(userId);
      res.status(200).json({
        message: "Disable success",
      });
    } catch (err) {
      return res.status(400).json({
        message: err,
      });
    }
  });
  router.patch("/undisable", async (req, res) => {
    const userId = req.body.userId;
    try {
      await userModel.unDisableUser(userId);
      res.status(200).json({
        message: "UnDisable success",
      });
    } catch (err) {
      return res.status(400).json({
        message: err,
      });
    }
  });



router.patch('/update-info',userGuard,async(req,res)=>{
    const {fullname,firstname,lastname,dob,description,organization}= req.body;
    const user = {
        user_name:fullname,
        user_firstname: firstname,
        user_lastname:lastname,
        user_dob: dob,
        user_description: description,
        user_organization: organization
    }
    console.log(user);
    const {accessTokenPayload} = req;
    try{
        await userModel.updateUserInfo(accessTokenPayload.user_username,user)
        console.log(user);
        res.status(200).json({
            message: "update user info success",
        });
    }catch(err){
        return res.status(400).json({
            message: err,
        });
    }

})
router.patch('/update-lecturer-info',lecturerGuard,async(req,res)=>{
    const {fullname,firstname,lastname,dob,description,organization}= req.body;
    const user = {
        user_name:fullname,
        user_firstname: firstname,
        user_lastname:lastname,
        user_dob: dob,
        user_description: description,
        user_organization: organization
    }
    console.log(user);
    const {accessTokenPayload} = req;
    try{
        await userModel.updateUserInfo(accessTokenPayload.user_username,user)
        console.log(user);
        res.status(200).json({
            message: "update lecturer info success",
        });
    }catch(err){
        return res.status(400).json({
            message: err,
        });
    }

})
router.patch('/update-email',userGuard,async(req,res)=>{
    const {newEmail}= req.body;
    const {accessTokenPayload} = req;
    const isExistUser = await userModel.isExistByEmail(newEmail);
    if(isExistUser !== null){
        return res.status(200).json({message:"this email has been used! try another"});
    }
    

    const otpCode = authServices.generateOTPCode();
    const otpToken = authServices.generateOTPToken(otpCode);
    //console.log(otpCode,otpToken,authServices.checkOTPValid(otpCode,otpToken));
    const result = await authServices.sendMail(newEmail,otpCode);
    //console.log(result);
    const user = {
        user_accessotp : otpToken,
        user_status : STATUS_UPDATE,
        user_email : newEmail
    }
    
    await userModel.updateEmail(accessTokenPayload.user_username,user);
    res.status(201).json({message:"Update email success. Check your email to verify new Email"});
})
router.patch('/update-password',userGuard,async(req,res)=>{
    const {oldPassword, newPassword}= req.body;
    const {accessTokenPayload} = req;
    const user = await userModel.isExistByUsername(accessTokenPayload.user_username);
    if(user === null){
        return res.status(200).json({message:"Some thing wrong, try again"});
    }
    if(!bcrypt.compareSync(oldPassword,user.user_password)){
        return res.status(200).json({message:"Old password wrong!"});
    }
    //console.log(newPassword);
    const hashNewPassword = bcrypt.hashSync(newPassword,10);
    //console.log(hashNewPassword);

    await userModel.updatePassword(accessTokenPayload.user_username, hashNewPassword);
    res.status(201).json({message:"Update password success."});
})

const imageUpload = multer({storage: uploadFile('profileimage')}).single('image');
router.patch('/me/image',userGuard,imageUpload,async (req,res)=>{
    const {accessTokenPayload} = req;
    //deleting old course image
    const userFromDB = await userModel.isExistByUsername(accessTokenPayload.user_username);
    if(userFromDB.user_image !== null){
        DeleteProfileImageFile([userFromDB.user_image]);
    }
    //console.log(course_id);
    const profile_image =req.file.filename;
    await userModel.uploadProfileImage(accessTokenPayload.user_username, profile_image);
    res.status(201).json({
        image: profile_image,
        message:"Upload profile image successfully"
    });
})

module.exports = router;