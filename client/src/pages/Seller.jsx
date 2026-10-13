import React, { useState } from "react";
import AddItems from "../components/Seller/AddItems";
import ManageStock from "../components/Seller/ManageStock";
import Orders from "../components/Seller/Orders";
import SellerUserChats from "../components/Seller/SellerUserChats";
import { HiMenu } from "react-icons/hi";
import axios from "../utils/axiosInstance";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { sellerAxios } from "../utils/axiosInstance";

const Seller = () => {
  const [activeTab, setActiveTab] = useState("add");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isSeller, setIsSeller } = useAppContext();
  const navigate = useNavigate();

  const menuItems = [
    {
      id: "add",
      name: "Add Items",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
          <path
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4v16m8-8H4"
          />
        </svg>
      ),
    },
    {
      id: "stock",
      name: "Manage Stock",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
          <path
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z"
          />
        </svg>
      ),
    },
    {
      id: "orders",
      name: "Orders",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
          <path
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 16V8a2 2 0 0 0-1-1.73L13 3.07a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.73z"
          />
          <path
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.27 6.96L12 12.01l8.73-5.05M12 22V12"
          />
        </svg>
      ),
    },
    {
      id: "userChats", // ✅ NEW TAB
      name: "User Chats",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
          <path
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"
          />
        </svg>
      ),
    },
  ];

  const componentsMap = {
    add: <AddItems />,
    stock: <ManageStock />,
    orders: <Orders />,
    userChats: <SellerUserChats />,
  };

  const handleLogout = async () => {
    try {
      const response = await sellerAxios.get(
        "https://hitman-grocery-backend.onrender.com/api/seller/logout",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("sellerToken")}`,
          },
        }
      );
      if (response.status === 200) {
        localStorage.removeItem("sellerToken");
        setIsSeller(false);
        navigate("/");
        toast.success("Logged out successfully");
      }
    } catch (err) {
      console.error("Logout failed", err);
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - visible on md+ and toggleable on mobile */}
      <div
        className={`fixed md:static top-0 left-0 z-30 bg-white border-r w-64 h-full p-4 transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <img
          className="w-40 mb-6"
          src="/hitman.grocery.logo.png"
          alt="Hitman Grocery Logo"
        />
        <div className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false); // close on mobile selection
              }}
              className={`flex items-center gap-3 w-full text-left px-4 py-2 rounded transition-all ${
                activeTab === item.id
                  ? "bg-primary/10 text-primary-dull font-semibold border-r-4 border-primary"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-center px-4 sm:px-6 py-4 bg-white border-b shadow-sm">
          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setSidebarOpen((prev) => !prev)}
          >
            <HiMenu size={24} />
          </button>

          <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
            <span className="block sm:hidden">Admin Dashboard</span>
            <span className="hidden sm:block">Welcome to Admin Dashboard</span>
          </h1>

          <button
            className="px-4 py-1.5 bg-primary hover:bg-primary-dull text-white rounded-full text-sm font-medium transition"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        {/* Component Content */}
        <div className="p-4 sm:p-6">{componentsMap[activeTab]}</div>
      </div>
    </div>
  );
};

export default Seller;
