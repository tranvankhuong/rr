const db = require("../utils/db");
const limit_of_page = process.env.LIMIT_OF_PAGE;

module.exports = {
  deleteUser(user_id) {
    return db("user").where("user_id", user_id).del();
  },
  addLecture(lecture) {
    return db("user").insert(lecture);
  },
  allLearner(page) {
    return  db.select('user_id', "user_username",'user_name','user_email','user_dob')
    .from('user')
    .where('user_role','learner')
    .where("user_isdisable", 0)
    .limit(limit_of_page)
    .offset((page - 1) * limit_of_page);
  },
  allLecture(page) {
    return db
      .select("user_id", "user_username", "user_name", "user_email", "user_dob")
      .from("user")
      .where("user_role", "lecturer")
      .where("user_isdisable", 0)
      .limit(limit_of_page)
      .offset((page - 1) * limit_of_page);
  },
  allDisableLecture(page) {
    return db
      .select("user_id", "user_username", "user_name", "user_email", "user_dob")
      .from("user")
      .where("user_role", "lecturer")
      .where("user_isdisable", 1)
      .limit(limit_of_page)
      .offset((page - 1) * limit_of_page);
  },
  allDisableLearner(page) {
    return db
      .select("user_id", "user_username", "user_name", "user_email", "user_dob")
      .from("user")
      .where("user_role", "learner")
      .where("user_isdisable", 1)
      .limit(limit_of_page)
      .offset((page - 1) * limit_of_page);
  },
    all(){
        return db('user');
    },
    addNewUser(user){
        return db('user').insert(user);
    },
    disableUser(userId) {
        return db("user").where("user_id", userId).update(
            { 
                user_isdisable: 1,
                user_status:"disabled"
             }
             );
      },
      unDisableUser(userId) {
        return db("user").where("user_id", userId).update({ user_isdisable: 0,user_status:"active" });
      },
    //kiem tra co ton tai user bang user name, tra ve user
    async isExistByUserId(userId){
        const ret = await db('user').where('user_id',userId);

        if(ret.length === 0){
            

            return null;
        }
        return ret[0];
    },
    //kiem tra co ton tai user bang user name, tra ve user
    async isExistByUsername(username){
        const ret = await db('user').where('user_username',username);

        if(ret.length === 0){
            

            return null;
        }
        return ret[0];
    },
    //kiem tra co ton tai user bang email, tra ve user
    async isExistByEmail(email){
        const ret = await db('user').where('user_email',email);

        if(ret.length === 0){

            return null;
        }
        return ret[0];
    },
    //them refresh token vao database
    addRFTokenToDB(user_id,refreshToken){
        return db('user').where('user_id',user_id).update({
            refresh_token: refreshToken
        })
    },
     //kiem tra refresh token
    async isValidRFToken(user_id, refreshToken){
        const user = await db('user').where('user_id',user_id);
        if(user.length === 0){
            return false;
        }
        return user[0].refresh_token === refreshToken;
    },
    ////them otp token vao database
    addOTPTokenToDB(user_email,otpToken){
        return db('user').where('user_email',user_email).update({
            user_accessotp: otpToken
        })
    },
    //update user status(verify, active, update)
    updateUserStatus(user_email,user_status){
        return db('user').where('user_email',user_email).update({
            user_status: user_status
        })
    },
    //update user info(fullname,firstname, lastname,dob)
    updateUserInfo(user_username,user){
        return db('user').where('user_username',user_username).update(user)
    },
    //update user email
    updateEmail(user_username,user){
        return db('user').where('user_username',user_username).update(user)
    },
    //update password
    updatePassword(user_username, newPassword){
        return db('user').where('user_username',user_username).update({
            user_password: newPassword
        })
    },
    uploadProfileImage(user_username,profile_image){
        return db('user').where('user_username',user_username).update({
            user_image: profile_image
        })
    }
}

