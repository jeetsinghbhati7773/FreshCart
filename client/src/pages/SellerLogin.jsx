import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "../utils/axiosInstance";
import { useAppContext } from "../context/AppContext";
import { sellerAxios } from "../utils/axiosInstance";

const SellerLogin = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const { setIsSeller } = useAppContext();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Use sellerAxios instead of the default axios
      const res = await sellerAxios.post("/seller/login", form);
      const { token } = res.data;

      localStorage.setItem("sellerToken", token);
      setIsSeller(true);
      navigate("/seller");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      {/* 🔙 Back to Home */}
      <div
        className="absolute top-4 left-4 sm:top-6 sm:left-6 cursor-pointer text-primary hover:text-primary-dull transition duration-200 flex items-center gap-2 font-medium"
        onClick={() => {
          navigate("/");
          window.location.reload();
        }}
      >
        <span className="text-lg">←</span>
        <span className="hidden sm:inline">Back to Home</span>
        <span className="sm:hidden">Back</span>
      </div>

      {/* 🧾 Login Card */}
      <div className="bg-white max-w-md w-full rounded-xl shadow-lg p-8 space-y-6 border border-gray-200">
        <div className="text-center">
          <img
            src="/hitman.grocery.logo.png"
            alt="Hitman Grocery"
            className="w-32 mx-auto mb-2"
          />
          <h2 className="text-2xl font-semibold text-primary-dull">
            Seller Login
          </h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Seller Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="admin@hitman.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="hitman123"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-dull transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellerLogin;
