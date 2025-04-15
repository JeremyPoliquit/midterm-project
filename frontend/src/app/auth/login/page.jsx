// app/auth/login/page.jsx (assuming you're using app directory and JSX)

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const page = () => {
  const [userName, setUserName] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login/admin",
        {
          user_name: userName,
          user_password: userPassword,
        }
      );

      const { token } = response.data;

      // Store the token in localStorage or cookie
      localStorage.setItem("token", token);

      // Decode token to get user_role
      const decoded = jwtDecode(token);
      const role = decoded.user_role;

      // Redirect based on role
      if (role === "admin") {
        router.push("/dashboard/admin");
      } else if (role === "professor") {
        router.push("/dashboard/professor");
      } else {
        setError("Unknown role.");
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message); // exact message from backend
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <>
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-full max-w-lg px-6">
          <h1 className="text-xl font-semibold text-center mb-6">
            CvSU Bacoor Authorize Personel
          </h1>

          <form onSubmit={handleLogin} className="flex flex-col gap-4 max-w-lg">
            {/* Student Number Input */}
            <div>
              <input
                type="text"
                className="input validator w-full"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Josh Doe"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="input validator w-full">
                <input
                  type="password"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  required
                  placeholder="Password"
                  pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                  title="Must be more than 8 characters, including number, lowercase letter, uppercase letter"
                />
              </label>
              <p className="validator-hint hidden">
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
    </>
  );
};

export default page;
