const express = require("express");
const {
  createStudentRecord,
  addRecordStudent,
  addScheduleOnly,
  deleteRecord,
  getByStudentNumber,
  getSchedule,
  profile,
} = require("../controllers/studentController");
const verifyToken = require("../middleware/auth");

module.exports = (db) => {
  const router = express.Router();
  router.post("/create/student/record", (req, res) =>
    createStudentRecord(req, res, db)
  );
  router.post("/add-schedule-only", (req, res) => addScheduleOnly(req, res, db));
  router.post("/add-record-only", (req, res) => addRecordStudent(req, res, db));
  router.get("/records", (req, res) => getByStudentNumber(req, res, db));
  router.delete("/delete/record/:record_id", (req, res) => deleteRecord(req, res, db));
  router.get("/profile", verifyToken, (req, res) => profile(req, res, db)); // record of student
  router.get("/get-schedules", (req, res) => getSchedule(req, res, db)); // record of student
  return router;
};
