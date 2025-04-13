"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const page = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/"); // If no token, redirect to login
    } else {
      fetch("http://localhost:5000/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Unauthorized or bad response");
          }
          return res.json();
        })
        .then((data) => {
          setUser(data); // FIX: direkta na
        })
        .catch((err) => {
          console.error(err);
          router.push("/"); // In case of error, redirect to login
        });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token from localStorage
    router.push("/"); // Redirect to the login page
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Welcome, {user.student_name}</h1>
      <p>Student #: {user.student_number}</p>
      <p>Course: {user.course}</p>
      <p>Year Level: {user.year_level}</p>
      <p>Semester: {user.semester}</p>
      <p>Status: {user.student_status}</p>

      <button
        onClick={handleLogout}
        className="btn btn-danger mt-4"
      >
        Logout
      </button>
    </div>
  );
};

export default page;
