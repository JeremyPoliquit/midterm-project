"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const page = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    student_number: "",
    user_password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const parsedNumber = parseInt(form.student_number.trim(), 10);

    if (isNaN(parsedNumber)) {
      alert("Invalid student number");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          student_number: parsedNumber,
          user_password: form.user_password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // in case backend needs it (like session/cookies)
        }
      );

      console.log("Login response:", res.data);

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        router.push("/home");
      } else {
        alert("No token received");
      }
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div
      className="flex justify-center items-center"
      style={{ minHeight: "100vh" }}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Student Number Input */}
        <div>
          <label className="input validator">
            <input
              type="text"
              name="student_number"
              onChange={handleChange}
              placeholder="202311242"
              required
            />
          </label>
        </div>

        {/* Password Input */}
        <div>
          <label className="input validator">
            <input
              type="password"
              name="user_password"
              onChange={handleChange}
              required
              placeholder="Password"
              minLength={8}
              pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
              title="Must be more than 8 characters, including number, lowercase letter, uppercase letter"
            />
          </label>
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn btn-success btn-wide">
          Login
        </button>
      </form>
    </div>
  );
};

export default page;
