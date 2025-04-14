const express = require('express');
const { student, records } = require('../controllers/authController');

module.exports = (db) => {
  const router = express.Router();
  router.post('/create', (req, res) => student(req, res, db));
  router.post('/create/record', (req, res) => records(req, res, db));
  return router;
};
