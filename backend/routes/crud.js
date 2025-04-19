const express = require("express");
const {
  createStudentRecord,
  addRecordStudent,
  profile,
} = require("../controllers/studentController");
const verifyToken = require("../middleware/auth");

module.exports = (db) => {
  const router = express.Router();
  router.post("/create/record", (req, res) =>
    createStudentRecord(req, res, db)
  );
  router.post("/add-record-only", (req, res) => addRecordStudent(req, res, db));
  router.get("/profile", verifyToken, (req, res) => profile(req, res, db)); // record of student
  return router;
};
