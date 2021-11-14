const db = require("../utils/db");
const limit_of_page = process.env.LIMIT_OF_PAGE;
const limit_of_newcourse = process.env.LIMIT_OF_NEWCOURSE;
const limit_of_hotcourse = process.env.LIMIT_OF_HOTCOURSE;
const limit_of_popularcourse = process.env.LIMIT_OF_POPULARCOURSE;
const { getFormattedDate } = require("../services/file.services");
module.exports = {
  all() {
    return db("course").where("course_isdisable", 0);
  },
  getCourseInWeek() {
    const dt = new Date();
    dt.setDate(dt.getDate() - 7);

    return db("course")
      .where("course_isdisable", 0)
      .where("created_date", "<=", new Date())
      .where("created_date", ">=", dt);
  },
  async getCourseById(course_id) {
    const cList = await db("course")
      .where("course_id", course_id)
      .where("course_isdisable", 0);
    if (cList.length === 0) {
      return null;
    }
    console.log(cList[0]);
    return cList[0];
  },
  async getCourseByLecturerId(lecturerId) {
    const cList = await db("course")
      .where("user_id", lecturerId)
      .where("course_isdisable", 0);
    if (cList.length === 0) {
      return null;
    }
    return cList;
  },
  addNewCourse(course) {
    return db("course").insert(course);
  },
  uploadCourseImage(course_id, course_image) {
    return db("course").where("course_id", course_id).update({
      course_image: course_image,
    });
  },
  delete(courseId) {
    return db("course").where("course_id", courseId).del();
  },
  disableCourse(course_id) {
    return db("course")
      .where("course_id", course_id)
      .update({ course_isdisable: 1 });
  },
  updateCourse(courseId, course) {
    return db("course").where("course_id", courseId).update(course);
  },
  unDisableCourse(course_id) {
    return db("course")
      .where("course_id", course_id)
      .update({ course_isdisable: 0 });
  },
  allCoursesForGuest(page) {
    return db("course")
      .where("course_isdisable", 0)
      .innerJoin("user", "user.user_id", "course.user_id")
      .innerJoin("category", "category.category_id", "course.category_id");
    // .limit(limit_of_page)
    // .offset((page - 1) * limit_of_page);
  },
  allDisableCoursesForGuest(page) {
    return db("course")
      .where("course_isdisable", 1)
      .innerJoin("user", "user.user_id", "course.user_id")
      .innerJoin("category", "category.category_id", "course.category_id");
    // .limit(limit_of_page)
    // .offset((page - 1) * limit_of_page);
  },
  getAllByCategory(category_id) {
    return db("course")
      .where("category_id", category_id)
      .where("course_isdisable", 0);
  },
  getNumberCourseOfCategory(category_id) {
    return db("course")
      .count("course_id", { as: "NumberOfCourse" })
      .where("category_id", category_id)
      .where("course_isdisable", 0);
  },
  allCoursesForAdmin() {
    return db
      .select(
        "course_id",
        "course_name",
        "course_title",
        "category_id",
        "user_id",
        "saleoff",
        "last_update",
        "course_status"
      )
      .from("course")
      .where("course_isdisable", 0);
  },
  webCourses() {
    return db("course").where("category_id", 1).where("course_isdisable", 0);
  },
  mobileCourses() {
    return db("course").where("category_id", 2).where("course_isdisable", 0);
  },
  // getCourseById(id) {
  //   const kq = db("course").where("course_id", id);
  //   return kq;
  // },
  getCourseByCategory(category_id, page) {
    console.log("vao get course by id");
    return db("course")
      .where("category_id", category_id)
      .limit(limit_of_page)
      .offset((page - 1) * limit_of_page)
      .where("course_isdisable", 0);
  },
  coursesSearchByPage(keyword, page) {
    return db("course")
      .where("course_name", "like", `%${keyword}%`)
      .orderBy("last_update", "asc")
      .limit(limit_of_page)
      .offset((page - 1) * limit_of_page)
      .where("course_isdisable", 0);
  },
  coursesSearchByPageAndCate(keyword, page, categoryId) {
    return db("course")
      .where("course_name", "like", `%${keyword}%`)
      .andWhere("category_id", categoryId)
      .orderBy("last_update", "asc")
      .limit(limit_of_page)
      .offset((page - 1) * limit_of_page)
      .where("course_isdisable", 0);
  },
  coursesSearchAll(keyword) {
    return db("course")
      .where("course_name", "like", `%${keyword}%`)
      .orderBy("last_update", "asc")
      .where("course_isdisable", 0);
  },
  deleteCourse(course_id) {
    return db("course").where("course_id", course_id).del();
  },
  getFeedBack(course_id) {
    return db
      .select("review_id", "review_feedback", "user_id", "timestamp")
      .from("review")
      .where("course_id", course_id);
  },
  getCourseOfLecture(lecture_id) {
    return db
      .select("course_name")
      .from("course")
      .where("user_id", lecture_id)
      .where("course_isdisable", 0);
  },
  coursesSearchWithOutPaging(keyword) {
    return db("course")
      .where("course_name", "like", `%${keyword}%`)
      .where("course_isdisable", 0);
  },
  getAvgPointByCourseID(course_id) {
    return db("review")
      .avg("review_rating as course_rv_point")
      .where("course_id", course_id);
  },
  async searchAndSort(keyword, page) {
    result = await this.coursesSearchByPage(keyword, page);
    for (let i = 0; i < result.length; i++) {
      let temp = await this.getAvgPointByCourseID(result[i].course_id);
      result[i].course_rv_point = temp[0].course_rv_point;
    }
    result.sort(function (a, b) {
      return b.course_rv_point - a.course_rv_point;
    });
    return result;
  },
  getNewCourses() {
    return db("course")
      .where("course_isdisable", 0)
      .orderBy("created_date", "desc")
      .limit(limit_of_newcourse);
  },
  async getHotCourses() {
    let course = await this.all();
    for (let i = 0; i < course.length; i++) {
      let temp = await this.getAvgPointByCourseID(course[i].course_id);
      course[i].course_rv_point = temp[0].course_rv_point
        ? temp[0].course_rv_point
        : 5;
    }
    course.sort(function (a, b) {
      return b.course_rv_point - a.course_rv_point;
    });
    const ret = course.slice(0, limit_of_hotcourse);
    return ret;
  },
  async getFeaturedCourse() {
    let course = await this.getCourseInWeek();
    for (let i = 0; i < course.length; i++) {
      let temp = await this.getAvgPointByCourseID(course[i].course_id);
      course[i].course_rv_point = temp[0].course_rv_point
        ? temp[0].course_rv_point
        : 5;
    }
    course.sort(function (a, b) {
      return b.course_rv_point - a.course_rv_point;
    });
    const ret = course.slice(0, 3);
    return ret;
  },
  countSubcribeByCourseID(course_id) {
    return db("course_subscribe")
      .count("user_id", { as: "Number_Of_Subcribe" })
      .where("course_id", course_id);
  },

  async getPopularCourses() {
    let course = await this.all();
    for (let i = 0; i < course.length; i++) {
      let temp = await this.countSubcribeByCourseID(course[i].course_id);
      course[i].Number_Of_Subcribe = temp[0].Number_Of_Subcribe;
    }
    course.sort(function (a, b) {
      return b.Number_Of_Subcribe - a.Number_Of_Subcribe;
    });
    const ret = course.slice(0, limit_of_popularcourse);
    return ret;
  },

  //chat bot api model
  async getCoursesByCategoryId(categoryId) {
    const courses = await db("course")
      .where("category_id", categoryId)
      .where("course_isdisable", 0);
    if (courses.length === 0) {
      return [];
    }
    return courses;
  },
  // return db.select("*").count('* as SL').from("category")
  // .leftJoin('course','category.category_id',"=",'course.category_id')
  // .innerJoin('course_subscribe','course.course_id',"=",'course_subscribe.course_id')
  // .groupBy('course.category_id')
  // .orderBy('SL','desc');
  getMostViewestCourse() {
    let date = new Date();
    date.setDate(date.getDate() - 7);
    return db
      .select("*")
      .from("course")
      .sum("user_view_event.viewcount as slview")
      .innerJoin(
        "user_view_event",
        "course.course_id",
        "user_view_event.course_id"
      )
      .where("user_view_event.date", ">", date)
      .where("course_isdisable", 0)
      .groupBy("course.course_id")
      .orderBy("slview", "desc")
      .limit(10);
  },
  async addViewEvent(courseId) {
    let today = new Date();
    const cViewEvent = await db("user_view_event").where("course_id", courseId);
    if (cViewEvent.length === 0) {
      console.log("Dont existing in our db table");
      return db("user_view_event").insert({
        course_id: courseId,
        viewcount: 1,
        date: today,
      });
    } else {
      if (getFormattedDate(cViewEvent[0].date) !== getFormattedDate(today)) {
        console.log("Existing but date !!!!!!");

        return db("user_view_event").insert({
          course_id: courseId,
          viewcount: 1,
          date: today,
        });
      } else {
        console.log("Existing have same date !!!!!!");
        return db("user_view_event")
          .where("course_id", courseId)
          .update({
            viewcount: cViewEvent[0].viewcount + 1,
          });
      }
    }
  },
};
