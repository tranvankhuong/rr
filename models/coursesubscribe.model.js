const db = require('../utils/db');

module.exports = {
    getCourseSubcribeList(user_id){
        return db('course_subscribe').where('user_id',user_id);
        
    },
    addMultiPurchasedCourse(purchasedCourseList){
        return db('course_subscribe').insert([...purchasedCourseList]);
    },
    async checkIsPurchasedCourse(userId,courseId){
        const purchasedCourse = await db('course_subscribe').where('user_id',userId).andWhere('course_id',courseId);
        if(purchasedCourse.length === 0){
            return false;
        }
        return true;
    },
    async getTotalStudents(courseId){
        const list = await db('course_subscribe').where('course_id',courseId);
        return list.length;
    }
}