const express = require('express');
const { create } = require('../controllers/authController');

module.exports = (db) => {
  const router = express.Router();
  router.post('/create', (req, res) => create(req, res, db));
  return router;
};
