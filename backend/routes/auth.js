const express = require("express");
const {
  register,
  login,
  loginAdmin,
  profile,
  profileAdmin,
  createAdmin,
} = require("../controllers/authController");
const verifyToken = require("../middleware/auth");

module.exports = (db) => {
  const router = express.Router();
  router.post("/register", (req, res) => register(req, res, db));
  router.post("/login", (req, res) => login(req, res, db)); // student login
  router.post("/create/admin", (req, res) => createAdmin(req, res, db)); // create admin/professor
  router.post("/login/admin", (req, res) => loginAdmin(req, res, db)); // login admin/prof
  router.get("/profile", verifyToken, (req, res) => profile(req, res, db)); // record of student
  router.get("/profile/admin", verifyToken, (req, res) =>
    profileAdmin(req, res, db)
  );
  return router;
};
