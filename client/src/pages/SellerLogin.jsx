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
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-green-600 to-emerald-400 flex items-center justify-center text-white shadow-md">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-700 via-emerald-600 to-teal-700 bg-clip-text text-transparent">
              ShopPilot
            </span>
          </div>
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
              placeholder="admin@shoppilot.com"
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
              placeholder="shoppilot123"
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
