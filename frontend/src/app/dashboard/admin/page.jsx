"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

const page = () => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/auth/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.user_role !== "admin") {
        router.push("/auth/login");
      }
    } catch (err) {
      router.push("/auth/login");
    }
  }, []);

  return (
    <div>Welcome Admin Dashboard</div>
  )
}

export default page