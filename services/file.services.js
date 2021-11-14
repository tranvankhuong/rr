const fs = require('fs')
const path = require('path')
module.exports.DeleteProfileImageFile=(imageFileNameList)=>{
    imageFileNameList.forEach(fn => {
        const oldImagePath = path.join(path.resolve(__dirname,'..'), '/uploads/profile/', fn) ;
        fs.unlinkSync(oldImagePath);
        console.log("deleted old image");
    });
}
module.exports.DeleteImageFile=(imageFileNameList)=>{
    imageFileNameList.forEach(fn => {
        const oldImagePath = path.join(path.resolve(__dirname,'..'), '/uploads/images/', fn) ;
        fs.unlinkSync(oldImagePath);
        console.log("deleted old image");
    });
}

module.exports.DeleteVideoFile =(videoFileNameList)=>{
    videoFileNameList.forEach(fn => {
        const oldVideoPath = path.join(path.resolve(__dirname,'..'), '/uploads/videos/', fn) ;
        fs.unlinkSync(oldVideoPath);
        console.log("deleted old video");
    });
}

module.exports.getFormattedDate = (date) =>{
    if(date===null || date === undefined){
        var d = new Date();

        d = d.getFullYear() + "-" + ('0' + (d.getMonth() + 1)).slice(-2) + "-" + ('0' + d.getDate()).slice(-2);

        return d;
    }
    else{
        var d = new Date(date);

        d = d.getFullYear() + "-" + ('0' + (d.getMonth() + 1)).slice(-2) + "-" + ('0' + d.getDate()).slice(-2) ;

        return d;
   }
}