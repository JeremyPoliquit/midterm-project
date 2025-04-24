"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

const page = () => {
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRecords, setFilteredRecords] = useState([]);
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  // Fetch all records on load
  useEffect(() => {
    fetch("http://localhost:5000/api/student/records")
      .then((res) => res.json())
      .then((data) => setRecords(data.records))
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  const handleDelete = async (record_id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this record?"
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/student/delete/record/${record_id}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (res.ok) {
        setRecords((prev) => prev.filter((r) => r.record_id !== record_id));
        alert("Deleted successfully!");
      } else {
        alert(data.message || "Error deleting record");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Something went wrong");
    }
  };

  //   token
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

  //   profile of admin
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

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    const filtered = records.filter((record) =>
      record.student_number.toString().includes(value)
    );
    setFilteredRecords(filtered);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth/login"); // Authorized Personel
  };

  if (!user) return <div className="font-semibold">Can't access this page</div>;

  return (
    <div className="flex flex-col gap-8 mx-12 my-8">
      <div className="flex justify-between">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold mb-6">Professor Dashboard</h1>
          <p>Welcome, {user.user_name}</p>
          <Link href="/dashboard/professor">
            <p className="text-green-400">Go to Home</p>
          </Link>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by Student Number"
              value={searchTerm}
              onChange={handleSearch}
              className="input input-bordered w-full max-w-xs"
            />
          </div>
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

      <table className="table table-zebra table-auto w-full">
        <thead>
          <tr className="font-semibold">
            <th>student number</th>
            <th>student name</th>
            <th>course code</th>
            <th>output</th>
            <th>scores</th>
            <th>date</th>
            <th>option</th>
          </tr>
        </thead>
        <tbody>
          {filteredRecords.map((record) => (
            <tr key={record.record_id}>
              <td>{record.student_number}</td>
              <td>{record.student_name}</td>
              <td>{record.course_code}</td>
              <td>{record.output}</td>
              <td>{record.scores}</td>
              <td>{new Date(record.createdAt).toLocaleString()}</td>
              <td>
                <button
                  className="btn btn-error btn-sm"
                  onClick={() => handleDelete(record.record_id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default page;
