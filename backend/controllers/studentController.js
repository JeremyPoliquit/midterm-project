const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET =
  "TpOjmT4K1B5Auv7JDHBhC9bO2wyPBVxCWGFbSaFMeQy7B0kom3iPT7RfxU6fOGqG";

// full student creation
exports.createStudentRecord = (req, res, db) => {
  const {
    student_number,
    student_name,
    section,
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
      "INSERT INTO students_info (student_number, student_name, section, course, year_level, semester, student_status) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.query(
      insertStudent,
      [
        student_number,
        student_name,
        section,
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

// records only except info's
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

exports.addScheduleOnly = async (req, res, db) => {
  const {
    student_number,
    course_code,
    room,
    professor,
    sched_day,
    sched_time,
  } = req.body;

  try {
    const checkQuery = "SELECT * FROM students_info WHERE student_number = ?";
    db.query(checkQuery, [student_number], (err, result) => {
      if (err) return res.status(500).json({ err: "DB Error" });

      if (result.length === 0)
        return res.status(404).json({ error: "Student number not found" });

      const insertQuery =
        "INSERT INTO students_sched (student_number, course_code, room, professor, sched_day) VALUES (?, ?, ?, ?, ?, ?)";
      db.query(
        insertQuery,
        [student_number, course_code, room, professor, sched_day, sched_time],
        (err) => {
          if (err)
            return res.status(500).json({ error: "Error inserting sched" });

          res.status(201).json({ message: "Schedule added successfully" });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: "Server Error " });
  }
};

// profile of student
exports.profile = async (req, res, db) => {
  const student_number = req.user.student_number;

  const query = `
      SELECT 
        s.student_number,
        s.student_name, 
        s.section,
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
      section,
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
        section,
        course,
        year_level,
        semester,
        student_status,
        records,
      },
    });
  });
};
