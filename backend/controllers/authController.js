const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET =
  "TpOjmT4K1B5Auv7JDHBhC9bO2wyPBVxCWGFbSaFMeQy7B0kom3iPT7RfxU6fOGqG";

exports.student = async (req, res, db) => {
  const {
    student_number,
    student_name,
    course,
    year_level,
    semester,
    student_status,
  } = req.body;

  const insertQuery =
    "INSERT INTO students_info (student_number, student_name, course, year_level, semester, student_status) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(
    insertQuery,
    [
      student_number,
      student_name,
      course,
      year_level,
      semester,
      student_status,
    ],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Insert error" });
      res.status(201).json({ message: "Student created" });
    }
  );
};

exports.register = async (req, res, db) => {
  const { user_number, user_password, student_number } = req.body;
  const hashedPassword = await bcrypt.hash(user_password, 10);

  const checkQuery = "SELECT * FROM users WHERE user_number = ?";
  db.query(checkQuery, [user_number], (err, result) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (result.length)
      return res.status(400).json({ message: "Email already exists" });

    const insertQuery =
      "INSERT INTO users (user_number, user_password, student_number) VALUES (?, ?, ?)";
    db.query(
      insertQuery,
      [user_number, hashedPassword, student_number],
      (err, result) => {
        if (err) return res.status(500).json({ error: "Insert error" });
        res.status(201).json({ message: "User registered" });
      }
    );
  });
};

exports.login = async (req, res, db) => {
  const { student_number, user_password } = req.body;

  try {
    // Step 1: Hanapin user sa `users` table
    const userQuery = "SELECT * FROM users WHERE student_number = ?";
    db.query(userQuery, [student_number], async (err, userResult) => {
      if (err) {
        console.error("DB error (users):", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (userResult.length === 0) {
        return res.status(401).json({ message: "Student not found first" });
      }

      const user = userResult[0];

      // Step 2: Check password
      const isMatch = await bcrypt.compare(user_password, user.user_password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Step 3: Hanapin student info sa `students_info`
      const studentQuery =
        "SELECT * FROM students_info WHERE student_number = ?";
      db.query(studentQuery, [student_number], (err, studentResult) => {
        if (err) {
          console.error("DB error (students_info):", err);
          return res.status(500).json({ message: "Server error" });
        }

        if (studentResult.length === 0) {
          return res.status(404).json({ message: "Student info not found second" });
        }

        // Step 4: Generate JWT
        const token = jwt.sign({ student_number }, JWT_SECRET, {
          expiresIn: "1h",
        });

        // Step 5: Send response
        res.json({
          message: "Login successful",
          token
        });
      });
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.profile = async (req, res, db) => {
  const student_number = req.user.student_number;

  const query = `
    SELECT 
      student_number,
      student_name, 
      course, 
      year_level, 
      semester, 
      student_status
    FROM students_info
    WHERE student_number = ?
  `;

  db.query(query, [student_number], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(results[0]);
  });
};

