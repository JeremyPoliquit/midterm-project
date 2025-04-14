const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET =
  "TpOjmT4K1B5Auv7JDHBhC9bO2wyPBVxCWGFbSaFMeQy7B0kom3iPT7RfxU6fOGqG";


  exports.createStudentRecord = (req, res, db) => {
    const {
      student_number,
      student_name,
      course,
      year_level,
      semester,
      student_status,
      user_number,
      user_password,
      course_code,
      output,
      scores,
    } = req.body;
  
    const checkStudent = "SELECT * FROM students_info WHERE student_number = ?";
    db.query(checkStudent, [student_number], (err, result) => {
      if (err) return res.status(500).json({ error: "DB error" });
  
      if (result.length) {
        return res.status(400).json({ message: "Student already exists" });
      }
  
      const insertStudent =
        "INSERT INTO students_info (student_number, student_name, course, year_level, semester, student_status) VALUES (?, ?, ?, ?, ?, ?)";
      db.query(
        insertStudent,
        [
          student_number,
          student_name,
          course,
          year_level,
          semester,
          student_status,
        ],
        (err) => {
          if (err) return res.status(500).json({ error: "Student insert error" });
  
          // Hash password inside the flow
          bcrypt.hash(user_password, 10, (err, hashedPassword) => {
            if (err) return res.status(500).json({ error: "Hashing error" });
  
            const insertUser =
              "INSERT INTO users (user_number, user_password, student_number) VALUES (?, ?, ?)";
            db.query(
              insertUser,
              [user_number, hashedPassword, student_number],
              (err) => {
                if (err)
                  return res.status(500).json({ error: "User insert error" });
  
                const insertRecord =
                  "INSERT INTO records (course_code, output, scores, student_number) VALUES (?, ?, ?, ?)";
                db.query(
                  insertRecord,
                  [course_code, output, scores, student_number],
                  (err) => {
                    if (err)
                      return res
                        .status(500)
                        .json({ error: "Record insert error" });
                    res
                      .status(201)
                      .json({ message: "Student, user, and record created" });
                  }
                );
              }
            );
          });
        }
      );
    });
  };

exports.addRecordStudent = async (req, res, db) => {
  const { student_number, course_code, output, scores } = req.body;

  try {
    // Check if student exists
    const checkQuery = "SELECT * FROM students_info WHERE student_number = ?";
    db.query(checkQuery, [student_number], (err, result) => {
      if (err) return res.status(500).json({ error: "DB error" });

      if (result.length === 0) {
        return res.status(404).json({ error: "Student not found" });
      }

      // Insert record
      const insertQuery = `
        INSERT INTO records (course_code, output, scores, student_number)
        VALUES (?, ?, ?, ?)`;
      db.query(
        insertQuery,
        [course_code, output, scores, student_number],
        (err) => {
          if (err)
            return res.status(500).json({ error: "Error inserting record" });

          res.status(201).json({ message: "Record added successfully" });
        }
      );
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.createStudent = async (req, res, db) => {
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

exports.records = async (req, res, db) => {
  const { course_code, output, scores, student_number } = req.body;

  const insertQuery =
    "INSERT INTO records (course_code, output, scores, student_number) VALUES (?, ?, ?, ?)";
  db.query(
    insertQuery,
    [course_code, output, scores, student_number],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Insert record error" });
      res.status(201).json({ message: "Record created" });
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
      return res.status(400).json({ message: "user number already exists" });

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

exports.profile = async (req, res, db) => {
  const student_number = req.user.student_number;

  const query = `
    SELECT 
      s.student_number,
      s.student_name, 
      s.course, 
      s.year_level, 
      s.semester, 
      s.student_status,
      r.record_id,
      r.course_code,
      r.output,
      r.scores,
      r.createdAt
    FROM students_info s
    LEFT JOIN records r ON s.student_number = r.student_number
    WHERE s.student_number = ?
  `;

  db.query(query, [student_number], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const {
      student_number,
      student_name,
      course,
      year_level,
      semester,
      student_status,
    } = results[0];

    const records = results
      .filter((row) => row.record_id !== null) // skip null rows (in case walang records)
      .map((row) => ({
        record_id: row.record_id,
        course_code: row.course_code,
        output: row.output,
        scores: row.scores,
        createdAt: row.createdAt,
      }));

    res.json({
      user: {
        student_number,
        student_name,
        course,
        year_level,
        semester,
        student_status,
        records,
      },
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
