const db = require("../utils/db");
const limit_of_page = process.env.LIMIT_OF_PAGE;
module.exports = {
  all(){
    return db("category")
  },
  allCategory(page) {
    return db("category")
      .distinct("category_name")
      .limit(limit_of_page)
      .offset((page - 1) * limit_of_page);
  },
  getCategoryById(category_id) {
    return db("category").where("category_id", category_id);
  },
  addCategory(category) {
    return db("category").insert(category);
  },
  editCategory(categoryId,categoryName) {
  return db("category").where("category_id", categoryId).update({
      category_name: categoryName,
    });
  },
  delete(category_id) {
    return db("category").where("category_id", category_id).del();
  },

  getTopCategoryByPurchased(){
    return db.select("*").count('* as SL').from("category")
    .leftJoin('course','category.category_id',"=",'course.category_id')
    .innerJoin('course_subscribe','course.course_id',"=",'course_subscribe.course_id')
    .groupBy('course.category_id')
    .orderBy('SL','desc');
  }
};
