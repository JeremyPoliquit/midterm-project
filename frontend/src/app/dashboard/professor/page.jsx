// app/dashboard/professor/page.jsx (assuming you're using app directory and JSX)

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const page = () => {
  const [token, setToken] = useState(null);
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  // Full Insert Form
  const [student_number, setStudentNumber] = useState("");
  const [student_name, setStudentName] = useState("");
  const [section, setSection] = useState("");
  const [course, setCourse] = useState("");
  const [year_level, setYearLevel] = useState("");
  const [semester, setSemester] = useState("");
  const [student_status, setStudentStatus] = useState("");
  const [user_number, setUserNumber] = useState("");
  const [user_password, setUserPassword] = useState("");
  const [course_code, setCourseCode] = useState("");
  const [output, setOutput] = useState("");
  const [scores, setScores] = useState("");

  // Add Sched only
  const [schedule_student_number, setScheduleStudentNumber] = useState("");
  const [schedule_course_code, setScheduleCourseCode] = useState("");
  const [schedule_room, setScheduleRoom] = useState("");
  const [schedule_professor, setScheduleProfessor] = useState("");
  const [schedule_timeIn, setScheduleTimeIn] = useState("");
  const [schedule_timeOut, setScheduleTimeOut] = useState("");

  // Add Record Only Form
  const [record_student_number, setRecordStudentNumber] = useState("");
  const [record_course_code, setRecordCourseCode] = useState("");
  const [record_output, setRecordOutput] = useState("");
  const [record_scores, setRecordScores] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/auth/login");
      return;
    }

    try {
      const decoded = jwtDecode(storedToken);
      if (decoded.user_role !== "professor") {
        router.push("/auth/login");
      }
    } catch (err) {
      router.push("/auth/login");
    }

    setToken(storedToken);
    const decoded = jwtDecode(storedToken);
    setUser(decoded);
  }, []);

  const handleFullInsert = async (e) => {
    e.preventDefault();

    // Validate that the required fields are not empty
    if (
      !student_number ||
      !student_name ||
      !section ||
      !course ||
      !year_level ||
      !semester ||
      !student_status ||
      !user_number ||
      !user_password ||
      !course_code ||
      !output ||
      !scores
    ) {
      alert("Please fill all fields before submitting.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/student/create/student/record",
        {
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
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Full student + record inserted!");
      // Reset form after successful submission (optional)
      setStudentNumber("");
      setStudentName("");
      setSection("");
      setCourse("");
      setYearLevel("");
      setSemester("");
      setStudentStatus("");
      setUserNumber("");
      setUserPassword("");
      setCourseCode("");
      setOutput("");
      setScores("");
    } catch (err) {
      console.error("Error during full insert:", err);

      // Handle specific errors based on the response from backend
      if (err.response) {
        // Server responded with a status other than 2xx
        alert(
          `Error: ${err.response.data.error || "An unexpected error occurred"}`
        );
      } else if (err.request) {
        // No response from server
        alert("Server did not respond. Please try again.");
      } else {
        // Something else caused the error
        alert("Full insert failed. Please check the inputs and try again.");
      }
    }
  };

  const handleRecordOnlyInsert = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/student/add-record-only",
        {
          student_number: record_student_number,
          course_code: record_course_code,
          output: record_output,
          scores: record_scores,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Record inserted successfully!");
      setRecordStudentNumber("");
      setRecordCourseCode("");
      setRecordOutput("");
      setRecordScores("");
    } catch (err) {
      console.error(err);
      alert("Record only insert failed.");
    }
  };

  const handleScheduleOnlyInsert = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/api/student/add-schedule-only",
        {
          student_number: schedule_student_number,
          course_code: schedule_course_code,
          room: schedule_room, // bago: “room”
          professor: schedule_professor, // bago: “professor”
          sched_in: schedule_timeIn, // bago: “sched_in”
          sched_out: schedule_timeOut, // bago: “sched_out”
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Schedule inserted successfully");
      setScheduleStudentNumber("");
      setScheduleCourseCode("");
      setScheduleRoom("");
      setScheduleProfessor("");
      setScheduleTimeIn("");
      setScheduleTimeOut("");
    } catch (error) {
      console.error(error);
      alert("Schedule only insert failed.");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:5000/api/auth/profile/admin", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized or bad response");
        return res.json();
      })
      .then((data) => {
        setUser(data.user); // ✅ fixed here
      })
      .catch((err) => {
        console.error(err);
      });
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth/login"); // Authorized Personel
  };

  if (!user) return <div className="font-semibold">Can't access this page</div>;

  return (
    <div className="flex flex-col gap-8 mx-12 my-8">
      <div className="flex justify-between">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold mb-6">Professor Homepage</h1>
          <p>Welcome, {user.user_name}</p>

          <Link href="/dashboard/professor/panel">
            <p className="text-green-400">Go to Panel</p>
          </Link>
        </div>

        <div>
          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-error mt-4"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Full Insert Form */}
        <div className="bg-base-200 p-6 rounded-xl shadow-xl">
          <h2 className="text-xl font-bold mb-4">
            Full Insert (New Student + Record)
          </h2>
          <form onSubmit={handleFullInsert} className="grid gap-4">
            <input
              type="text"
              placeholder="Student Number"
              className="input input-bordered"
              onChange={(e) => setStudentNumber(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Student Name"
              className="input input-bordered"
              onChange={(e) => setStudentName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Section"
              className="input input-bordered"
              onChange={(e) => setSection(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Course"
              className="input input-bordered"
              onChange={(e) => setCourse(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Year Level"
              className="input input-bordered"
              onChange={(e) => setYearLevel(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Semester"
              className="input input-bordered"
              onChange={(e) => setSemester(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Student Status"
              className="input input-bordered"
              onChange={(e) => setStudentStatus(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="User Number"
              className="input input-bordered"
              onChange={(e) => setUserNumber(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="User Password"
              className="input input-bordered"
              onChange={(e) => setUserPassword(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Course Code"
              className="input input-bordered"
              onChange={(e) => setCourseCode(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Output"
              className="input input-bordered"
              onChange={(e) => setOutput(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Scores"
              className="input input-bordered"
              onChange={(e) => setScores(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary">
              Insert Full Record
            </button>
          </form>
        </div>

        {/* Record Only Form */}
        <div className="bg-base-200 p-6 rounded-xl shadow-xl flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold mb-4">
              Add Output to Existing Student
            </h2>
            <form onSubmit={handleRecordOnlyInsert} className="grid gap-4">
              <input
                type="text"
                placeholder="Student Number"
                className="input input-bordered"
                value={record_student_number}
                onChange={(e) => setRecordStudentNumber(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Course Code"
                className="input input-bordered"
                value={record_course_code}
                onChange={(e) => setRecordCourseCode(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Output"
                className="input input-bordered"
                value={record_output}
                onChange={(e) => setRecordOutput(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Scores"
                className="input input-bordered"
                value={record_scores}
                onChange={(e) => setRecordScores(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-accent">
                Add Record Only
              </button>
            </form>
          </div>

          {/* Class Schedule */}
          <div>
            <h2 className="text-xl font-bold mb-4">Add Schedule</h2>

            <form
              onSubmit={handleScheduleOnlyInsert}
              className="flex flex-col gap-4"
            >
              <input
                type="text"
                placeholder="Student Number"
                className="input input-bordered"
                value={schedule_student_number}
                onChange={(e) => setScheduleStudentNumber(e.target.value)}
                required
              />

              <input
                type="text"
                placeholder="Course Code"
                className="input input-bordered"
                value={schedule_course_code}
                onChange={(e) => setScheduleCourseCode(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="room"
                className="input input-bordered"
                value={schedule_room}
                onChange={(e) => setScheduleRoom(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="professor"
                className="input input-bordered"
                value={schedule_professor}
                onChange={(e) => setScheduleProfessor(e.target.value)}
                required
              />

              <div className="flex justify-between">
                <div>
                  <label className="input">
                    <p>Time In</p>
                    <input
                      type="time"
                      value={schedule_timeIn}
                      onChange={(e) => setScheduleTimeIn(e.target.value)}
                    />
                  </label>
                </div>

                <div>
                  <label className="input">
                    <p>Time Out</p>
                    <input
                      type="time"
                      value={schedule_timeOut}
                      onChange={(e) => setScheduleTimeOut(e.target.value)}
                    />
                  </label>
                </div>
              </div>

              <button type="submit" className="btn btn-accent">
                Add Schedule
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
