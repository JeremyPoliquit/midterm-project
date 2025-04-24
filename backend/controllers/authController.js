const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET =
  "TpOjmT4K1B5Auv7JDHBhC9bO2wyPBVxCWGFbSaFMeQy7B0kom3iPT7RfxU6fOGqG";

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
          return res
            .status(404)
            .json({ message: "Student info not found second" });
        }

        // Step 4: Generate JWT
        const token = jwt.sign(
          { student_number: user.student_number, user_role: user.user_role },
          JWT_SECRET,
          {
            expiresIn: "1h",
          }
        );

        // Step 5: Send response
        res.json({
          message: "Login successful",
          token,
        });
      });
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createAdmin = async (req, res, db) => {
  const { user_name, user_password, user_role } = req.body;
  const hashedPassword = await bcrypt.hash(user_password, 10);

  const checkQuery = "SELECT * FROM admin_account WHERE user_name = ?";
  db.query(checkQuery, [user_name], (err, result) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (result.length)
      return res.status(400).json({ message: "Admin already exists" });

    const insertQuery = `
      INSERT INTO admin_account (user_name, user_password, user_role)
      VALUES (?, ?, ?)
    `;
    db.query(
      insertQuery,
      [user_name, hashedPassword, user_role],
      (err, result) => {
        if (err) return res.status(500).json({ error: "Insert error" });
        res.status(201).json({ message: "Admin account created" });
      }
    );
  });
};

exports.loginAdmin = async (req, res, db) => {
  const { user_name, user_password } = req.body;

  if (!user_name || !user_password) {
    return res
      .status(400)
      .json({ message: "Please provide both username and password." });
  }

  // Query to check if the user exists
  const query = `
    SELECT * FROM admin_account WHERE user_name = ?
  `;

  db.query(query, [user_name], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Admin/Professor not found" });
    }

    const user = results[0]; // Assuming one user is returned

    // Check if the password is correct
    bcrypt.compare(user_password, user.user_password, (err, isMatch) => {
      if (err) {
        console.error("Error comparing passwords:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Create JWT token
      const payload = {
        user_name: user.user_name,
        user_role: user.user_role, // This could be 'admin' or 'professor'
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

      return res.json({ token }); // Return the token
    });
  });
};

exports.profileAdmin = async (req, res, db) => {
  const user_name = req.user.user_name; // Extracted from the token

  // Query to get the profile data based on the user_name
  const query = `
    SELECT * FROM admin_account WHERE user_name = ?
  `;

  db.query(query, [user_name], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Admin/Professor not found" });
    }

    const user = results[0];

    res.json({
      user: {
        user_name: user.user_name,
        user_role: user.user_role, // Role: 'admin' or 'professor'
        // Add more fields as necessary, like email, full name, etc.
      },
    });
  });
};
