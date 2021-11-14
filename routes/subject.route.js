const express = require("express");
const subjectModel = require("../models/subject.model");
const router = express.Router();
router.get("/all", async (req, res) => {
  const result = await subjectModel.all();
   if(result.length === 0){
       return res.status(204).end();
   }
  res.status(200).json((result)).end();
});
module.exports = router;
