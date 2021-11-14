const db = require('../utils/db');

module.exports = {
    addNewCourseToCart(user_id,course_id){
        return db('cart').insert({
            user_id,
            course_id
        });
    },
    //ds watch list theo id
    getCartByUserId(user_id){
        return db('cart').where('user_id',user_id);
    },
    //kiem tra co trung` watch list cung 1 nguoi khong
    async isValidOnce(user_id,course_id){
        const retList = await db('cart').where('user_id',user_id).andWhere('course_id',course_id);
        if(retList.length === 0){
            return true;
        }
        return false;
    },
    deleteCourseFromItem(user_id,course_id){
        return db('cart').where('user_id',user_id).andWhere('course_id',course_id).del();
    },
    async getTotalCourseInCart(courseId){
        const list = await db('cart').where('course_id',courseId);
        return list.length;
    }
}