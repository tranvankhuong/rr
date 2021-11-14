const db = require("../utils/db");
const limit_of_page = process.env.LIMIT_OF_PAGE;
module.exports = {
  all(){
    return db("subject")
  }
};
