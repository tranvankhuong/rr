const express = require("express");
const router = express.Router();
const uploadFile = require("../services/fileupload.services");
const courseModel = require("../models/course.model");
const sectionModel = require("../models/section.model");
const reviewModel = require("../models/review.model");
const userModel = require("../models/user.model");
const courseSubscribeModel = require("../models/coursesubscribe.model");
const multer = require("multer");
const videoModel = require("../models/video.model");
const STATUS_DONE = process.env.STATUS_DONE || "done";
const STATUS_NOTDONE = process.env.STATUS_NOTDONE || "notdone";
const {
  DeleteImageFile,
  DeleteVideoFile,
} = require("../services/file.services");
const {
  userGuard,
  lecturerGuard,
  adminGuard,
  roleVerify,
} = require("../middlewares/auth.mdw");

const limit_of_page = process.env.LIMIT_OF_PAGE;
const ROLE_GUEST = process.env.ROLE_GUEST || "guest";
const ROLE_STUDENT = process.env.ROLE_STUDENT || "student";
const ROLE_LECTURER = process.env.ROLE_LECTURER || "lecturer";
const ROLE_ADMIN = process.env.ROLE_ADMIN || "admin";

// router.get('/',async (req,res)=>{
//    const page = +req.query.page;
//    const courseList = await courseModel.allCoursesForGuest(page);
//    if(courseList.length === 0){
//        return res.status(204).end();
//    }
//     res.status(200).json((courseList)).end();
// })
router.get("/category/web-courses", async (req, res) => {
  //   const page = +req.query.page;
  const courseList = await courseModel.webCourses();
  if (courseList.length === 0) {
    return res.status(204).end();
  }
  res.status(200).json(courseList).end();
});

router.get("/category/mobile-courses", async (req, res) => {
  //   const page = +req.query.page;
  const courseList = await courseModel.mobileCourses();
  if (courseList.length === 0) {
    return res.status(204).end();
  }
  res.status(200).json(courseList).end();
});

router.get("/detail/:id", async (req, res) => {
  const id = +req.params.id;
  const course = await courseModel.getCourseById(id);
  if (course.length === 0) {
    return res.status(204).end();
  }
  res.status(200).json(course[0]).end();
});
router.get("/total/category/:catId", async (req, res) => {
  const catId = +req.params.catId;
  const count = await courseModel.getNumberCourseOfCategory(catId);
  res.status(200).json(count[0]).end();
});
router.get("/category/:categoryId", async (req, res) => {
  const categoryId = +req.params.categoryId;
  const course = await courseModel.getAllByCategory(categoryId);
  if (course.length === 0) {
    return res.json([]).end();
  }
  for (let i = 0; i < course.length; i++) {
    let user = await userModel.isExistByUserId(course[i].user_id);
    course[i].lecturerFullName = user.user_name;
    course[i].lecturerImage = user.user_image;
    let reviews = await reviewModel.getCourseReviews(course[i].course_id);
    course[i].totalReviews = reviews.length;
    if (reviews.length !== 0) {
      const averageRating =
        reviews.map((r) => r.review_rating).reduce((a, b) => a + b) /
        reviews.length;
      course[i].course_rv_point = parseFloat(averageRating.toFixed(1));
    } else {
      course[i].course_rv_point = 5;
    }
  }
  res.status(200).json(course).end();
});
router.get("/mostviewest-courses", async (req, res) => {
  const course = await courseModel.getMostViewestCourse();
  console.log(course);
  if (course.length === 0) {
    return res.status(204).end();
  }
  for (let i = 0; i < course.length; i++) {
    let user = await userModel.isExistByUserId(course[i].user_id);
    course[i].lecturerFullName = user.user_name;
    course[i].lecturerImage = user.user_image;
    let reviews = await reviewModel.getCourseReviews(course[i].course_id);
    course[i].totalReviews = reviews.length;
    if (reviews.length !== 0) {
      const averageRating =
        reviews.map((r) => r.review_rating).reduce((a, b) => a + b) /
        reviews.length;
      course[i].course_rv_point = parseFloat(averageRating.toFixed(1));
    } else {
      course[i].course_rv_point = 5;
    }
  }
  res.status(200).json(course).end();
});

router.get("/new-courses", async (req, res) => {
  const course = await courseModel.getNewCourses();
  if (course.length === 0) {
    return res.status(204).end();
  }
  for (let i = 0; i < course.length; i++) {
    let user = await userModel.isExistByUserId(course[i].user_id);
    course[i].lecturerFullName = user.user_name;
    course[i].lecturerImage = user.user_image;
    let reviews = await reviewModel.getCourseReviews(course[i].course_id);
    course[i].totalReviews = reviews.length;
    if (reviews.length !== 0) {
      const averageRating =
        reviews.map((r) => r.review_rating).reduce((a, b) => a + b) /
        reviews.length;
      course[i].course_rv_point = parseFloat(averageRating.toFixed(1));
    } else {
      course[i].course_rv_point = 5;
    }
  }
  res.status(200).json(course).end();
});

router.get("/hot-courses", async (req, res) => {
  const course = await courseModel.getHotCourses();
  if (course.length === 0) {
    return res.status(204).end();
  }
  for (let i = 0; i < course.length; i++) {
    let user = await userModel.isExistByUserId(course[i].user_id);
    course[i].lecturerFullName = user.user_name;
    course[i].lecturerImage = user.user_image;
    let reviews = await reviewModel.getCourseReviews(course[i].course_id);
    course[i].totalReviews = reviews.length;
  }
  res.status(200).json(course).end();
});
router.get("/featured-courses", async (req, res) => {
  const result = await courseModel.getFeaturedCourse();
  if (result.length === 0) {
    console.log("Khong co course nao");
    return res.status(204).end();
  }
  res.status(200).json(result).end();
});
router.get("/popular-courses", async (req, res) => {
  const course = await courseModel.getPopularCourses();
  if (course.length === 0) {
    return res.status(204).end();
  }
  for (let i = 0; i < course.length; i++) {
    let user = await userModel.isExistByUserId(course[i].user_id);
    course[i].lecturerFullName = user.user_name;
    course[i].lecturerImage = user.user_image;
    let reviews = await reviewModel.getCourseReviews(course[i].course_id);
    course[i].totalReviews = reviews.length;
    if (reviews.length !== 0) {
      const averageRating =
        reviews.map((r) => r.review_rating).reduce((a, b) => a + b) /
        reviews.length;
      course[i].course_rv_point = parseFloat(averageRating.toFixed(1));
    } else {
      course[i].course_rv_point = 5;
    }
  }
  res.status(200).json(course).end();
});

router.delete("/delete", async (req, res) => {
  const course_id = +req.body.course_id;
  res.status(200).json(await courseModel.deleteCourse(course_id)).end;
});
router.patch("/disable", async (req, res) => {
  const course_id = req.body.course_id;
  try {
    await courseModel.disableCourse(course_id);
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
  const course_id = req.body.course_id;
  try {
    await courseModel.unDisableCourse(course_id);
    res.status(200).json({
      message: "Undisable success",
    });
  } catch (err) {
    return res.status(400).json({
      message: err,
    });
  }
});

router.get("/feedback/:id", async (req, res) => {
  const id = +req.params.id;
  const result = await courseModel.getFeedBack(id);
  if (result.length === 0) {
    return res.status(204).end();
  }
  res.status(200).json(result).end();
});
router.get("/query", async (req, res) => {
  const search = req.query.search;
  const categoryId = req.query.categoryId;
  const page = +req.query.page;
  const result =
    categoryId === "default" || !categoryId
      ? await courseModel.coursesSearchByPage(search, page)
      : await courseModel.coursesSearchByPageAndCate(
          search,
          page,
          parseInt(categoryId)
        );
  if (result.length === 0) {
    return res.status(200).json({ result: [], maxPage: 1 }).end();
  }
  for (let i = 0; i < result.length; i++) {
    let user = await userModel.isExistByUserId(result[i].user_id);
    result[i].lecturerFullName = user.user_name;
    result[i].lecturerImage = user.user_image;
    let reviews = await reviewModel.getCourseReviews(result[i].course_id);
    result[i].totalReviews = reviews.length;
    if (reviews.length !== 0) {
      const averageRating =
        reviews.map((r) => r.review_rating).reduce((a, b) => a + b) /
        reviews.length;
      result[i].course_rv_point = parseFloat(averageRating.toFixed(1));
    } else {
      result[i].course_rv_point = 5;
    }
  }
  const all = await courseModel.coursesSearchAll(search);
  const maxPage = Math.ceil(all.length / limit_of_page);
  res.status(200).json({ result, maxPage }).end();
});

router.get("/category", async (req, res) => {
  const category_id = +req.query.id;
  const page = req.query.page || 1;
  const result = await courseModel.getCourseByCategory(category_id, page);
  const all = await courseModel.getAllByCategory(category_id);

  if (result.length === 0) {
    return res.status(204).end();
  }
  const maxPage = Math.ceil(all.length / limit_of_page);
  res.status(200).json({ result, maxPage }).end();
});
router.get("/search", async (req, res) => {
  const key = req.query.key;
  const page = req.query.page || 1;
  const ret = await courseModel.searchAndSort(key, page);
  const all = await courseModel.coursesSearchAll(key);
  const maxPage = Math.ceil(all.length / limit_of_page);
  res.status(200).json({ ret, maxPage }).end();
});
/*

------------
course api
------------

*/
router.get("/", roleVerify, async (req, res) => {
  const { accessTokenPayload } = req;
  const page = req.query.page || 1;
  const courseList = await courseModel.allCoursesForGuest(page);

  if (courseList === null) {
    return res.status(204).json({ message: "Course empty" });
  }
  const all = await courseModel.all();
  const maxPage = Math.ceil(all.length / limit_of_page);
  const result = await setCourse(
    accessTokenPayload.user_id,
    accessTokenPayload.user_role,
    courseList
  );
  res.status(200).json({ result, maxPage });
});
router.get("/disable", roleVerify, async (req, res) => {
  const { accessTokenPayload } = req;
  const page = req.query.page || 1;
  const courseList = await courseModel.allDisableCoursesForGuest(page);

  if (courseList === null) {
    return res.status(204).json({ message: "Course empty" });
  }
  const all = await courseModel.all();
  const maxPage = Math.ceil(all.length / limit_of_page);
  const result = await setCourse(
    accessTokenPayload.user_id,
    accessTokenPayload.user_role,
    courseList
  );
  res.status(200).json({ result, maxPage });
});
router.get("/me", lecturerGuard, async (req, res) => {
  const { accessTokenPayload } = req;
  const courseList = await courseModel.getCourseByLecturerId(
    accessTokenPayload.user_id
  );
  if (courseList === null) {
    return res.status(200).json([]);
  }
  res.status(200).json(courseList);
});
router.get("/:courseId", roleVerify, async (req, res) => {
  const courseId = req.params.courseId;
  //console.log(courseId);
  const { accessTokenPayload } = req;
  const course = await courseModel.getCourseById(courseId);
  if (course === null) {
    return res.status(204).json({ message: "Course id not found" });
  }
  await courseModel.addViewEvent(courseId);
  //console.log([course]);
  const resCourse = await setCourse(
    accessTokenPayload.user_id,
    accessTokenPayload.user_role,
    [course]
  );
  res.status(200).json(resCourse[0]);
});
const courseSchema = require("../schemas/course.schema.json");
router.post(
  "/",
  lecturerGuard,
  require("../middlewares/validate.mdw")(courseSchema),
  async (req, res) => {
    const { accessTokenPayload } = req;
    const {
      courseName,
      shortDescription,
      categoryId,
      price,
      saleoff,
      sectionCount,
    } = req.body;
    try {
      let course = {
        course_name: courseName,
        course_shortdescription: shortDescription,
        category_id: categoryId,
        user_id: accessTokenPayload.user_id,
        price: price,
        saleoff: saleoff,
        section_count: sectionCount,
        course_status: false,
        last_update: new Date(),
        created_date: new Date(),
      };
      const courseAdded = await courseModel.addNewCourse(course);
      const cAdded = await courseModel.getCourseById(courseAdded[0]);
      res.status(201).json({
        message: "Create new Course successfully",
        newCourse: cAdded,
      });
    } catch (err) {
      return res.json({ message: err }).status(204);
    }
  }
);
router.patch("/:courseId", lecturerGuard, async (req, res) => {
  const courseId = req.params.courseId;
  const {
    courseName,
    shortDescription,
    categoryId,
    price,
    saleoff,
    sectionCount,
    courseStatus,
  } = req.body;
  const { accessTokenPayload } = req;
  const course = await courseModel.getCourseById(courseId);
  if (course === null) {
    return res.status(400).json({ message: "Course not found" });
  }
  if (course.user_id !== accessTokenPayload.user_id) {
    return res
      .status(401)
      .json({ message: "You do not have permission to modify this course" });
  }
  try {
    let updatedCourse = {
      course_name: courseName,
      course_shortdescription: shortDescription,
      category_id: categoryId,
      price: price,
      saleoff: saleoff,
      section_count: sectionCount,
      course_status: courseStatus,
      last_update: new Date(),
    };
    const courseAdded = await courseModel.updateCourse(courseId, updatedCourse);
    res.status(200).json({
      message: "Update course successfully",
    });
  } catch (err) {
    return res.status(400).json({ message: err });
  }
});
router.patch("/:courseId/description", lecturerGuard, async (req, res) => {
  const courseId = req.params.courseId;
  const { description } = req.body;
  const { accessTokenPayload } = req;
  const course = await courseModel.getCourseById(courseId);
  if (course === null) {
    return res.status(400).json({ message: "Course not found" });
  }
  if (course.user_id !== accessTokenPayload.user_id) {
    return res
      .status(401)
      .json({ message: "You do not have permission to modify this course" });
  }
  try {
    let updatedCourse = {
      course_description: description,
      last_update: new Date(),
    };
    const courseAdded = await courseModel.updateCourse(courseId, updatedCourse);
    res.status(200).json({
      message: "Update course successfully",
    });
  } catch (err) {
    return res.status(400).json({ message: err });
  }
});
router.patch("/:courseId/status", lecturerGuard, async (req, res) => {
  const courseId = req.params.courseId;
  const { courseStatus } = req.body;
  const { accessTokenPayload } = req;
  const course = await courseModel.getCourseById(courseId);
  if (course === null) {
    return res.status(400).json({ message: "Course not found" });
  }
  if (course.user_id !== accessTokenPayload.user_id) {
    return res
      .status(401)
      .json({ message: "You do not have permission to modify this course" });
  }
  try {
    let updatedCourse = {
      course_status: courseStatus,
      last_update: new Date(),
    };
    const courseAdded = await courseModel.updateCourse(courseId, updatedCourse);
    res.status(200).json({
      message: "Update status course successfully",
    });
  } catch (err) {
    return res.status(400).json({ message: err });
  }
});
const imageUpload = multer({ storage: uploadFile("image") }).single("image");
router.patch(
  "/:courseId/image",
  lecturerGuard,
  imageUpload,
  async (req, res) => {
    const { accessTokenPayload } = req;
    const course_id = req.params.courseId;
    //deleting old course image
    const courseFromDB = await courseModel.getCourseById(course_id);
    if (courseFromDB.course_image !== null) {
      DeleteImageFile([courseFromDB.course_image]);
    }
    //console.log(course_id);
    const course_image = req.file.filename;
    await courseModel.uploadCourseImage(course_id, course_image);
    res.status(201).json({
      message: "Upload course image successfully",
      newImage: course_image,
    });
  }
);

router.delete("/:courseId", adminGuard, async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const courseSections = await sectionModel.getAllSectionByCourseId(courseId);
    if (courseSections !== null) {
      const sectionIdList = courseSections.map((s) => s.section_id);

      //console.log(sectionIdList);
      if (sectionIdList.length !== 0) {
        for (let i = 0; i < sectionIdList.length; i++) {
          //get video from db
          let videos = await videoModel.getAllVideoBySectionId(
            sectionIdList[i]
          );
          if (videos.length !== 0) {
            //console.log(videos);
            //get video path if not null to delete
            let videoPaths = videos
              .map((v) => v.video_path)
              .filter((v) => v.video_path !== null);
            //console.log(videoPaths);
            if (videoPaths.length !== 0) {
              //console.log("video path not empty")
              DeleteVideoFile(videoPaths);
            }
          }
        }
      }
    }

    const courseFromDB = await courseModel.getCourseById(courseId);
    if (courseFromDB.course_image !== null) {
      DeleteImageFile([courseFromDB.course_image]);
    }
    await courseModel.delete(courseId);
    res.status(200).json({ message: "Delete course successfully" });
  } catch (err) {
    return res.status(400).json({ message: err });
  }
});

//return course list with access permission base on role and userID
async function setCourse(userId, role, courses) {
  const responseCourses = [];
  for (let i = 0; i < courses.length; i++) {
    let singleCourse = await getCourseDetail(courses[i]);
    //permission = guest,  this course lecturer, student not buy this courses => preview mode
    if (role === ROLE_GUEST) {
      singleCourse.isView = false;
      singleCourse.isEdit = false;
      singleCourse.isDelete = false;
      responseCourses.push(singleCourse);
    } else {
      const isUserPurchasedCourse =
        await courseSubscribeModel.checkIsPurchasedCourse(
          userId,
          singleCourse.course_id
        );
      // console.log(userId,singleCourse.course_id);
      // console.log(isUserPurchasedCourse);
      if (isUserPurchasedCourse === false && singleCourse.user_id !== userId) {
        //console.log("guest mode");
        singleCourse.isView = false;
        singleCourse.isEdit = false;
        singleCourse.isDelete = false;
        responseCourses.push(singleCourse);
      } else {
        if (role === ROLE_ADMIN) {
          singleCourse.isView = true;
          singleCourse.isEdit = true;
          singleCourse.isDelete = true;
          responseCourses.push(singleCourse);
        } else if (role === ROLE_LECTURER) {
          singleCourse.isView = true;
          singleCourse.isEdit = true;
          singleCourse.isDelete = false;
          responseCourses.push(singleCourse);
        } else {
          singleCourse.isView = true;
          singleCourse.isEdit = false;
          singleCourse.isDelete = false;
          responseCourses.push(singleCourse);
        }
      }
    }
  }
  return responseCourses;
}
async function getCourseDetail(course) {
  const courseSections = await sectionModel.getAllSectionByCourseIdLiteral(
    course.course_id
  );
  //console.log(courseSections);
  if (courseSections !== null) {
    for (let i = 0; i < courseSections.length; i++) {
      //get video from db
      let videos = await videoModel.getAllVideoBySectionIdLiteral(
        courseSections[i].section_id
      );
      courseSections[i].videos = videos;
    }
  }
  course.sections = courseSections;
  course.totalStudent = await courseSubscribeModel.getTotalStudents(
    course.course_id
  );
  const reviews = await reviewModel.getCourseReviews(course.course_id);
  if (reviews.length === 0) {
    course.totalReview = 0;
    course.averageRating = 5;
    // course.reviews = [];
    return course;
  }
  // for(let i = 0 ;i < reviews.length ; i++){
  //     let user = await userModel.isExistByUserId(reviews[i].user_id);
  //     reviews[i].userFullName = user.user_name;
  // }
  // course.reviews = reviews;

  const averageRating =
    reviews.map((r) => r.review_rating).reduce((a, b) => a + b) /
    reviews.length;

  course.totalReview = reviews.length;
  course.averageRating = averageRating.toFixed(1);
  return course;
}
//chat bot api get courses by categoryid
router.get("/category/:categoryId", async (req, res) => {
  const categoryId = req.params.categoryId;
  const courseList = await courseModel.getCoursesByCategoryId(categoryId);
  res.status(200).json(courseList).end();
});
module.exports = router;
