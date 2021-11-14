const db = require('../utils/db');

module.exports = {
    addNewWatchList(user_id,course_id){
        return db('watch_list').insert({
            user_id,
            course_id
        });
    },
    //ds watch list theo id
    getWatchListByUserId(user_id){
        return db('watch_list').where('user_id',user_id);
    },
    //kiem tra co trung` watch list cung 1 nguoi khong
    async isValidOnce(user_id,course_id){
        const retList = await db('watch_list').where('user_id',user_id).andWhere('course_id',course_id);
        if(retList.length === 0){
            return true;
        }
        return false;
    },
    deleteWatchList(user_id,course_id){
        return db('watch_list').where('user_id',user_id).andWhere('course_id',course_id).del();
    },
    async getTotalWishList(courseId){
        const list = await db('watch_list').where('course_id',courseId);
        return list.length;
    }
}