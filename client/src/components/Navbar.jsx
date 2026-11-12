import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { assets } from "../assets/assets.js";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, setUser } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, setShowUserLogin, searchQuery, setSearchQuery } = useAppContext();

  const totalCount = Array.isArray(cartItems)
    ? cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
    : 0;

  useEffect(() => {
    if (searchQuery.length > 0 && !location.pathname.startsWith("/products")) {
      navigate("/products");
    }
  }, [searchQuery, navigate, location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(false);
    navigate("/");
    toast.success("Logged out successfully");
  };

  const goToOrders = () => {
    navigate("/myorders");
  };

  return (
    <div>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 lg:px-16 xl:px-20 py-3 border-b border-gray-200 bg-white/95 backdrop-blur-md shadow-sm transition-all duration-300">
        {/* ShopPilot Brand */}
        <NavLink to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-green-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-green-500/20 group-hover:scale-105 transition-transform duration-200">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold bg-gradient-to-r from-green-700 via-emerald-600 to-teal-700 bg-clip-text text-transparent tracking-tight">
              ShopPilot
            </span>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-600 -mt-1">
              AI Grocery Platform
            </span>
          </div>
        </NavLink>

        {/* Desktop Menu */}
        <div className="hidden sm:flex items-center gap-6 lg:gap-8">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `font-medium transition-colors duration-200 relative py-1 ${
                isActive ? "text-green-600" : "text-gray-700 hover:text-green-600"
              }`
            }
            onClick={() => setSearchQuery("")}
          >
            Home
          </NavLink>

          <NavLink
            to="/products"
            className={({ isActive }) =>
              `font-medium transition-colors duration-200 relative py-1 ${
                isActive ? "text-green-600" : "text-gray-700 hover:text-green-600"
              }`
            }
          >
            All Products
          </NavLink>

          <NavLink
            to="/shopping-assistant"
            className={({ isActive }) =>
              `font-medium transition-colors duration-200 relative py-1 flex items-center gap-1 ${
                isActive ? "text-emerald-600" : "text-gray-700 hover:text-emerald-600"
              }`
            }
            onClick={() => setSearchQuery("")}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>AI Concierge</span>
          </NavLink>

          <NavLink
            to="/faq"
            className={({ isActive }) =>
              `font-medium transition-colors duration-200 relative py-1 ${
                isActive ? "text-green-600" : "text-gray-700 hover:text-green-600"
              }`
            }
            onClick={() => setSearchQuery("")}
          >
            FAQs
          </NavLink>

          <NavLink
            // to="/seller-login"
            to="/seller"
            className={({ isActive }) =>
              `font-medium transition-colors duration-200 relative py-1 ${
                isActive ? "text-green-600" : "text-gray-700 hover:text-green-600"
              }`
            }
            onClick={() => setSearchQuery("")}
          >
            Seller Portal
          </NavLink>

          {/* Search bar */}
          <div className="hidden lg:flex items-center text-sm gap-2 border-2 border-gray-200 hover:border-green-500/50 focus-within:border-green-600 px-4 py-1.5 rounded-full bg-gray-50 hover:bg-white transition-all duration-200 shadow-sm w-64 xl:w-72">
            <input
              onChange={(e) => setSearchQuery(e.target.value)}
              value={searchQuery}
              className="py-1 w-full bg-transparent outline-none placeholder-gray-400 text-gray-700"
              type="text"
              placeholder="Search 230+ groceries..."
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-gray-400 hover:text-gray-600 text-xs px-1"
              >
                ✕
              </button>
            )}
            <img
              src={assets.search_icon}
              alt="searchIcon"
              className="w-4 h-4 opacity-60 flex-shrink-0"
            />
          </div>

          {/* Cart Icon */}
          <div className="relative cursor-pointer group">
            <div
              onClick={() => navigate("/cart")}
              className="p-2 rounded-full hover:bg-green-50 transition-colors duration-200 cursor-pointer"
            >
              <img
                src={assets.nav_cart_icon}
                alt="cartIcon"
                className="w-6 h-6 opacity-70 group-hover:opacity-100 transition-opacity duration-200"
              />
              <span className="absolute -top-1 -right-1 text-xs text-white bg-green-600 hover:bg-green-700 w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-md transition-transform duration-200 group-hover:scale-110">
                {totalCount}
              </span>
            </div>
          </div>

          {/* Auth Button / Profile Menu */}
          {!user ? (
            <button
              onClick={() => setShowUserLogin(true)}
              className="cursor-pointer px-6 py-2 bg-green-600 hover:bg-green-700 transition-all duration-200 text-white font-medium rounded-full shadow-md hover:shadow-lg transform hover:scale-105"
            >
              Login
            </button>
          ) : (
            <div className="relative group">
              <div className="flex items-center gap-2 cursor-pointer p-1 rounded-full hover:bg-gray-100">
                <img
                  src={assets.profile_icon}
                  className="w-9 h-9 rounded-full border-2 border-green-500/50 shadow-sm"
                  alt="User Profile"
                />
                <span className="hidden xl:inline text-sm font-medium text-gray-700 max-w-[100px] truncate">
                  {user.name || "My Account"}
                </span>
              </div>

              <ul className="hidden group-hover:flex flex-col absolute top-10 right-0 bg-white shadow-xl border border-gray-100 py-2 min-w-[170px] rounded-xl text-sm z-50">
                <li className="px-4 py-2 text-xs font-semibold uppercase text-gray-400">
                  {user.email}
                </li>
                <li
                  onClick={() => navigate("/shopping-assistant")}
                  className="px-4 py-2.5 hover:bg-emerald-50 text-gray-700 cursor-pointer transition-colors font-medium flex items-center gap-2"
                >
                  <span>🤖</span> AI Concierge
                </li>
                <li
                  onClick={goToOrders}
                  className="px-4 py-2.5 hover:bg-green-50 text-gray-700 cursor-pointer transition-colors font-medium flex items-center gap-2"
                >
                  <span>📦</span> My Orders
                </li>
                <li
                  onClick={handleLogout}
                  className="px-4 py-2.5 hover:bg-red-50 text-red-600 cursor-pointer transition-colors font-medium border-t border-gray-100 flex items-center gap-2"
                >
                  <span>🚪</span> Logout
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Mobile Header Controls */}
        <div className="flex items-center gap-2 sm:hidden">
          <div className="flex items-center border border-gray-300 rounded-full px-2.5 py-1 bg-gray-50 w-28">
            <input
              onChange={(e) => setSearchQuery(e.target.value)}
              value={searchQuery}
              className="py-0.5 w-full bg-transparent outline-none placeholder-gray-400 text-gray-700 text-xs"
              type="text"
              placeholder="Search..."
            />
          </div>

          <div
            onClick={() => navigate("/cart")}
            className="relative p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
          >
            <img src={assets.nav_cart_icon} alt="cartIcon" className="w-5 h-5 opacity-70" />
            <span className="absolute -top-1 -right-1 text-[10px] text-white bg-green-600 w-4 h-4 rounded-full flex items-center justify-center font-bold shadow">
              {totalCount}
            </span>
          </div>

          <button
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <img src={assets.menu_icon} alt="menuIcon" className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Dropdown */}
        {open && (
          <div className="absolute top-[65px] left-0 w-full bg-white shadow-xl border-t border-gray-100 py-4 flex flex-col items-start gap-1 px-6 text-sm sm:hidden z-40 animate-fadeIn">
            <div
              onClick={() => {
                setOpen(false);
                setSearchQuery("");
                navigate("/");
              }}
              className="w-full py-2.5 px-3 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg font-medium cursor-pointer"
            >
              Home
            </div>

            <div
              onClick={() => {
                setOpen(false);
                navigate("/products");
              }}
              className="w-full py-2.5 px-3 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg font-medium cursor-pointer"
            >
              All Products
            </div>

            <div
              onClick={() => {
                setOpen(false);
                navigate("/shopping-assistant");
              }}
              className="w-full py-2.5 px-3 text-emerald-700 hover:bg-emerald-50 rounded-lg font-bold cursor-pointer flex items-center gap-2"
            >
              <span>🤖</span> AI Concierge
            </div>

            {user && (
              <div
                onClick={() => {
                  setOpen(false);
                  goToOrders();
                }}
                className="w-full py-2.5 px-3 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg font-medium cursor-pointer"
              >
                My Orders
              </div>
            )}

            <NavLink
              to="/faq"
              onClick={() => setOpen(false)}
              className="w-full py-2.5 px-3 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg font-medium"
            >
              FAQs
            </NavLink>

            <NavLink
              // to="/seller-login"
              to="/seller"
              onClick={() => setOpen(false)}
              className="w-full py-2.5 px-3 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg font-medium"
            >
              Seller Portal
            </NavLink>

            <div className="w-full border-t border-gray-100 mt-2 pt-3">
              {!user ? (
                <button
                  onClick={() => {
                    setOpen(false);
                    setShowUserLogin(true);
                  }}
                  className="w-full py-2.5 bg-green-600 text-white font-medium rounded-lg shadow-md"
                >
                  Login
                </button>
              ) : (
                <button
                  onClick={() => {
                    setOpen(false);
                    handleLogout();
                  }}
                  className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg shadow-md"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
