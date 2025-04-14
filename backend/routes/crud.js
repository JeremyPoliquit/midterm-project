const express = require('express');
const { createStudent, records, createStudentRecord, createStudentAndRecord, addRecordStudent } = require('../controllers/authController');

module.exports = (db) => {
  const router = express.Router();
  // router.post('/create/info', (req, res) => createStudentRecord(req, res, db));
  // router.post('/create/record', (req, res) => addRecordStudent(req, res, db));
  router.post('/create/record', (req, res) => createStudentRecord(req, res, db));
  router.post('/add-record-only', (req, res) => addRecordStudent(req, res, db));
  // router.post('/create/postman', (req, res) => createStudent(req, res, db));
  // router.post('/create/record/postman', (req, res) => records(req, res, db));
  return router;
};
