const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY || "HCMUSWEBNC";

const ROLE_GUEST = process.env.ROLE_GUEST || "guest"
const ROLE_STUDENT = process.env.ROLE_STUDENT || "student"
const ROLE_LECTURER = process.env.ROLE_LECTURER || "lecturer"
const ROLE_ADMIN = process.env.ROLE_ADMIN || "admin"

module.exports.userGuard = function (req,res,next) { 
    const accessToken = req.headers['x-access-token'];
    if(accessToken){
        try{
            const decodedData  = jwt.verify(accessToken,SECRET_KEY);
            //console.log(decodedData);
            req.accessTokenPayload  = decodedData;
            next();
        }
        catch (err){
            console.log(err);
            return res.status(401).json({
              message: 'Invalid access token!'
            });
        }
    }
    else{
        return res.status(400).json({
            message: 'Access token not found!'
        });
    }
}
module.exports.lecturerGuard = function (req,res,next) { 
    const accessToken = req.headers['x-access-token'];
    if(accessToken){
        try{
            const decodedData  = jwt.verify(accessToken,SECRET_KEY);
            if(decodedData.user_role !== "lecturer"){
                return res.status(400).json({message:"You  need lecturer permission to access this feature"});
            }
            //console.log(decodedData);
            req.accessTokenPayload  = decodedData;
            next();
        }
        catch (err){
            console.log(err);
            return res.status(401).json({
              message: 'Invalid access token!'
            });
        }
    }
    else{
        return res.status(400).json({
            message: 'Access token not found!'
        });
    }
}
module.exports.adminGuard = function (req,res,next) { 
    const accessToken = req.headers['x-access-token'];
    if(accessToken){
        try{
            const decodedData  = jwt.verify(accessToken,SECRET_KEY);
            if(decodedData.user_role !== "admin"){
                return res.status(400).json({message:"You  need admin permission to access this feature"});
            }
            //console.log(decodedData);
            req.accessTokenPayload  = decodedData;
            next();
        }
        catch (err){
            console.log(err);
            return res.status(401).json({
              message: 'Invalid access token!'
            });
        }
    }
    else{
        return res.status(400).json({
            message: 'Access token not found!'
        });
    }
}
module.exports.roleVerify = (req,res,next)=>{
    const accessToken = req.headers['x-access-token'];
    if(accessToken){
        try{
            const decodedData  = jwt.verify(accessToken,SECRET_KEY);
            if(decodedData.user_role === 'student'){
                req.accessPermission = ROLE_STUDENT;
            }else if(decodedData.user_role ==='lecturer'){
                req.accessPermission = ROLE_LECTURER;
            }else if(decodedData.user_role ==='admin'){
                req.accessPermission = ROLE_ADMIN;
            }
            //console.log(decodedData);
            req.accessTokenPayload  = decodedData;
            next();
        }
        catch (err){
            req.accessTokenPayload  = {
                user_id: "guest",
                user_username: "guest",
                user_email: "guest",
                user_role: "guest"
            };
            next();
        }
    }
    else{
        req.accessTokenPayload  = {
            user_id: "guest",
            user_username: "guest",
            user_email: "guest",
            user_role: "guest"
        };
        next();
    }
}