const multer  = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
module.exports = uploadFile = (type) =>{
    if(type === "profileimage")
    {
        return multer.diskStorage({
            destination: (req,file,cb)=>{
                cb(null,"./uploads/profile/")
            },
            filename: (req,file,cb)=>{
                const fileName =  uuidv4();
                const extName =  path.extname(file.originalname);
                cb(null,`${fileName}${extName}`)
            },
            fileFilter: (req, file, cb) => {
                const ext = path.extname(file.originalname)
                if (ext !== '.jpg' && ext !== '.png') {
                    return cb(res.status(400).end('only jpg, png is allowed'), false);
                }
                cb(null, true)
            }
        })
    }
    if(type === "image")
    {
        return multer.diskStorage({
            destination: (req,file,cb)=>{
                cb(null,"./uploads/images/")
            },
            filename: (req,file,cb)=>{
                const fileName =  uuidv4();
                const extName =  path.extname(file.originalname);
                cb(null,`${fileName}${extName}`)
            },
            fileFilter: (req, file, cb) => {
                const ext = path.extname(file.originalname)
                if (ext !== '.jpg' && ext !== '.png') {
                    return cb(res.status(400).end('only jpg, png is allowed'), false);
                }
                cb(null, true)
            }
        })
    }
    if(type === "video")
    {
        return multer.diskStorage({
            destination: (req,file,cb)=>{
                cb(null,"./uploads/videos/")
            },
            filename: (req,file,cb)=>{
                const fileName  = path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
                const extName =  path.parse(file.originalname).ext;
                cb(null,`${fileName}${extName}`)
            },
            fileFilter: (req, file, cb) => {
                const ext = path.extname(file.originalname)
                if (ext !== '.wav' && ext !== '.mp4' && ext !== '.mkv') {
                    return cb(res.status(400).end('only mp4, wav, mkv is allowed'), false);
                }
                cb(null, true)
            }
        })
    }
}