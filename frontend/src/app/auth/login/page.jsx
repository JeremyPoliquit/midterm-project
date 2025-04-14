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
    <div className="max-w-md mx-auto mt-20 p-4 border rounded shadow">
      <h1 className="text-2xl font-semibold mb-4">Admin/Professor Login</h1>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="w-full p-2 border rounded mb-2"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={userPassword}
          onChange={(e) => setUserPassword(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          required
        />
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default page;
