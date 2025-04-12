const express = require('express');
const { register, login, profile } = require('../controllers/authController');
const verifyToken = require('../middleware/auth');

module.exports = (db) => {
  const router = express.Router();
  router.post('/register', (req, res) => register(req, res, db));
  router.post('/login', (req, res) => login(req, res, db));
  router.get('/profile', verifyToken, (req, res) => profile(req, res, db));
  return router;
};
