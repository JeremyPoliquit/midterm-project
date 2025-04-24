const express = require("express");
const {
  loginAdmin,
  profileAdmin,
  createAdmin,
} = require("../controllers/authController");
const verifyToken = require("../middleware/auth");

module.exports = (db) => {
  const router = express.Router();
  router.post("/create/admin", (req, res) => createAdmin(req, res, db)); // create admin/professor
  router.post("/login/admin", (req, res) => loginAdmin(req, res, db)); // login admin/prof
  router.get("/profile/admin", verifyToken, (req, res) =>
    profileAdmin(req, res, db)
  );
  return router;
};
