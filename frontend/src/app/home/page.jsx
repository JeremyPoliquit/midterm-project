"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const page = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
    } else {
      fetch("http://localhost:5000/api/auth/profile", {
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
          router.push("/");
        });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  if (!user) return <div className="font-semibold">Can't access this page</div>;

  const latestRecord = user.records?.[0]; // optional: latest record lang

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Welcome, {user.student_name}</h1>
      <p>Student #: {user.student_number}</p>
      <p>Course: {user.course}</p>
      <p>Year Level: {user.year_level}</p>
      <p>Semester: {user.semester}</p>
      <p>Status: {user.student_status}</p>

      <div className="mt-6 overflow-x-auto">
        <h2 className="text-xl font-bold mb-4">My Records</h2>
        <table className="table table-zebra table-auto w-full">
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Output</th>
              <th>Score</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {user.records && user.records.length > 0 ? (
              user.records.map((record) => (
                <tr key={record.record_id}>
                  <td>{record.course_code}</td>
                  <td>{record.output}</td>
                  <td>{record.scores}</td>
                  <td>{new Date(record.createdAt).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button onClick={handleLogout} className="btn btn-danger mt-4">
        Logout
      </button>
    </div>
  );
};

export default page;
