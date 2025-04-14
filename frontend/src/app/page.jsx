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
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full max-w-lg px-6">
        <h1 className="text-xl font-semibold text-center mb-6">
          CvSU Bacoor Student Record
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-lg">
          {/* Student Number Input */}
          <div>
            <label className="input validator w-full">
              <input
                type="text"
                name="student_number"
                onChange={handleChange}
                placeholder="202311242"
                minLength={9}
                title="Must be 8 whole numbers only"
                required
              />
            </label>
            <p className="validator-hint hidden">
              Must be 9 whole numbers only
              <br />
              No any words
              <br />
              No special characters
            </p>
          </div>

          {/* Password Input */}
          <div>
            <label className="input validator w-full">
              <input
                type="password"
                name="user_password"
                onChange={handleChange}
                required
                placeholder="Password"
                minLength="8"
                pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                title="Must be more than 8 characters, including number, lowercase letter, uppercase letter"
              />
            </label>
            <p className="validator-hint hidden">
              Must be more than 8 characters, including
              <br />
              At least one number
              <br />
              At least one lowercase letter
              <br />
              At least one uppercase letter
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button type="submit" className="btn btn-success btn-wide">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default page;
