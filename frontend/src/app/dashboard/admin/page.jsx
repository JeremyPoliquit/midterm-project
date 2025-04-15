"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

const page = () => {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      router.push("/auth/login");
      return;
    }

    try {
      const decoded = jwtDecode(storedToken);
      if (decoded.user_role !== "admin") {
        router.push("/auth/login");
      }
    } catch (err) {
      router.push("/auth/login");
    }

    setToken(storedToken);
    const decoded = jwtDecode(storedToken);
    setUser(decoded);
  }, []);

  if (!user) return <div className="font-semibold">Can't access this page</div>;

  return (
    <>
      <h1>Welcome Admin Dashboard</h1>
      <p>Dashboard</p>
    </>
  );
};

export default page;
