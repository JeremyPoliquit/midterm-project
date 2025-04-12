const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET =
  "TpOjmT4K1B5Auv7JDHBhC9bO2wyPBVxCWGFbSaFMeQy7B0kom3iPT7RfxU6fOGqG";

exports.register = async (req, res, db) => {
  const { username, user_email, user_password } = req.body;
  const hashedPassword = await bcrypt.hash(user_password, 10);

  const checkQuery = "SELECT * FROM users WHERE user_email = ?";
  db.query(checkQuery, [user_email], (err, result) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (result.length)
      return res.status(400).json({ message: "Email already exists" });

    const insertQuery =
      "INSERT INTO users (username, user_email, user_password) VALUES (?, ?, ?)";
    db.query(
      insertQuery,
      [username, user_email, hashedPassword],
      (err, result) => {
        if (err) return res.status(500).json({ error: "Insert error" });
        res.status(201).json({ message: "User registered" });
      }
    );
  });
};

exports.login = async (req, res, db) => {
  const { user_email, user_password } = req.body;
  const query = "SELECT * FROM users WHERE user_email = ?";

  db.query(query, [user_email], async (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (results.length === 0)
      return res.status(404).json({ message: "User not found" });

    const user = results[0];
    const match = await bcrypt.compare(user_password, user.user_password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.users_id, user_email: user.user_email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ message: "Login successful", token });
  });
};

exports.profile = async (req, res, db) => {
  const userId = req.user.id;

  const query = "SELECT users_id, username, user_email FROM users WHERE users_id = ?";
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "DB error", details: err.message });
    }
    if (results.length === 0)
      return res.status(404).json({ message: "User not found" });

    const user = results[0];
    res.json({ user });
  });
};
