import { React, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets.js";
import { useAppContext } from "../context/AppContext";
import axios from "../utils/axiosInstance";
import toast from "react-hot-toast";
const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, setUser } = useAppContext();
  const navigate = useNavigate();
  const { cartItems } = useAppContext();
  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const { setShowUserLogin, searchQuery, setSearchQuery } = useAppContext();

  useEffect(() => {
    if (
      searchQuery.length > 0 &&
      !window.location.pathname.includes("/products")
    ) {
      navigate("/products");
      window.location.reload();
    }
  }, [searchQuery, navigate]);
  const handleLogout = () => {
    localStorage.removeItem("token"); // 🧹 Clear token
    setUser(false); // 📴 Reset user state
    navigate("/"); // 🏠 Redirect to home
    toast.success("Logged out successfully");
  };

  const goToOrders = () => {
    navigate("/myorders");
    window.location.reload();
  };

  return (
    <div>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 lg:px-16 xl:px-20 py-3 border-b border-gray-200 bg-white shadow-sm transition-all duration-300">
        <NavLink to="/" className="flex-shrink-0">
          <img
            className="h-12 w-auto object-contain hover:scale-105 transition-transform duration-200"
            src="/hitman.grocery.logo.png"
            alt="Hitman Grocery Logo"
          />
        </NavLink>

        {/* Desktop Menu */}
        <div className="hidden sm:flex items-center gap-6 lg:gap-8">
          <div
            onClick={() => {
              setSearchQuery("");
              navigate("/");
              window.location.reload();
            }}
            className="text-gray-700 hover:text-primary font-medium transition-colors duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full cursor-pointer"
          >
            Home
          </div>

          <div
            onClick={() => {
              setSearchQuery("");
              navigate("/products");
              window.location.reload();
            }}
            className="text-gray-700 hover:text-primary font-medium transition-colors duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full cursor-pointer"
          >
            All Products
          </div>

          <NavLink
            to="/faq"
            className="text-gray-700 hover:text-primary font-medium transition-colors duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
            onClick={() => setSearchQuery("")}
          >
            FAQs
          </NavLink>
          <NavLink
            to="/seller-login"
            className="text-gray-700 hover:text-primary font-medium transition-colors duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
            onClick={() => {
              setSearchQuery("");
            }}
          >
            Seller login
          </NavLink>

          <div className="hidden lg:flex items-center text-sm gap-2 border-2 border-gray-200 hover:border-primary/50 focus-within:border-primary px-4 py-2 rounded-full bg-gray-50 hover:bg-white transition-all duration-200 shadow-sm">
            <input
              onChange={(e) => setSearchQuery(e.target.value)}
              value={searchQuery}
              className="py-1 w-full bg-transparent outline-none placeholder-gray-400 text-gray-700 min-w-[180px]"
              type="text"
              placeholder="Search products..."
            />
            <img
              src={assets.search_icon}
              alt="searchIcon"
              className="w-4 h-4 opacity-60"
            />
          </div>

          <div className="relative cursor-pointer group">
            <div
              onClick={() => {
                navigate("/cart");
                window.location.reload();
              }}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
            >
              <img
                src={assets.nav_cart_icon}
                alt="cartIcon"
                className="w-6 h-6 opacity-70 group-hover:opacity-100 transition-opacity duration-200"
              />
              <button className="absolute -top-1 -right-1 text-xs text-white bg-primary hover:bg-primary-dark w-5 h-5 rounded-full flex items-center justify-center font-semibold shadow-lg transition-all duration-200 hover:scale-110">
                {totalCount}
              </button>
            </div>
          </div>

          {!user ? (
            <button
              onClick={() => setShowUserLogin(true)}
              className="cursor-pointer px-6 py-2.5 bg-primary hover:bg-primary-dark transition-all duration-200 text-white font-medium rounded-full shadow-md hover:shadow-lg transform hover:scale-105"
            >
              Login
            </button>
          ) : (
            <div className="relative group">
              <img
                src={assets.profile_icon}
                className="w-10 h-10 rounded-full cursor-pointer border-2 border-gray-200 hover:border-primary transition-all duration-200 shadow-sm hover:shadow-md"
                alt="User Profile"
              />

              <ul className="hidden group-hover:flex flex-col absolute top-10 right-0 bg-white shadow-xl border border-gray-100 py-2 min-w-[160px] rounded-lg text-sm z-50 pt-3">
                <li
                  onClick={goToOrders}
                  className="px-4 py-3 hover:bg-primary/5 text-gray-700 cursor-pointer transition-colors duration-150 font-medium "
                >
                  My Orders
                </li>

                <li
                  onClick={handleLogout}
                  className="px-4 py-3 hover:bg-primary/5 text-gray-700 cursor-pointer transition-colors duration-150 font-medium border-t border-gray-100"
                >
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-2 sm:hidden">
          {/* Mobile Search Icon - Triggers search input visibility */}
          <div className="relative">
            <div className="flex items-center border border-gray-300 rounded-full px-3 py-1 bg-gray-50 w-32">
              <input
                onChange={(e) => setSearchQuery(e.target.value)}
                value={searchQuery}
                className="py-1 w-20 bg-transparent outline-none placeholder-gray-400 text-gray-700 ml-1 text-lg"
                type="text"
                placeholder="Search..."
              />
              <img
                src={assets.search_icon}
                alt="searchIcon"
                className="w-4 h-4 opacity-60 "
              />
            </div>
          </div>

          <div
            onClick={() => {
              navigate("/cart");
              window.location.reload();
            }}
            className="relative p-1 rounded-full hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
          >
            <img
              src={assets.nav_cart_icon}
              alt="cartIcon"
              className="w-6 h-6 opacity-70"
            />
            <span className="absolute -top-1 -right-1 text-xs text-white bg-primary hover:bg-primary-dark w-5 h-5 rounded-full flex items-center justify-center font-semibold shadow-md transition-all duration-200">
              {totalCount}
            </span>
          </div>

          <button
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            className="sm:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <img src={assets.menu_icon} alt="menuIcon" className="w-6 h-6" />
          </button>
        </div>
        {/* Mobile Menu */}
        <div
          className={`${
            open
              ? "flex opacity-100 translate-y-0"
              : "hidden opacity-0 -translate-y-2"
          } absolute top-[72px] left-0 w-full bg-white shadow-xl border-t border-gray-100 py-4 flex-col items-start gap-1 px-6 text-sm md:hidden transition-all duration-300 z-40`}
        >
          <div
            onClick={() => {
              setOpen(false);
              navigate("/");
              window.location.reload();
            }}
            className="w-full py-3 px-2 text-gray-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 font-medium cursor-pointer"
          >
            Home
          </div>

          <div
            onClick={() => {
              setOpen(false);
              navigate("/products");
              window.location.reload();
            }}
            className="w-full py-3 px-2 text-gray-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 font-medium cursor-pointer"
          >
            All Products
          </div>

          {user && (
            <button
              onClick={() => {
                navigate("/myorders");
                setOpen(false);
              }}
              className="w-full text-left py-3 px-2 text-gray-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 font-medium"
            >
              My orders
            </button>
          )}
          <NavLink
            to="/faq"
            onClick={() => setOpen(false)}
            className="w-full py-3 px-2 text-gray-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 font-medium"
          >
            FAQs
          </NavLink>
          <NavLink
            to="/seller-login"
            onClick={() => setOpen(false)}
            className="w-full py-3 px-2 text-gray-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 font-medium"
          >
            Seller Login
          </NavLink>

          <div className="w-full border-t border-gray-100 mt-2 pt-3">
            {!user ? (
              <button
                onClick={() => {
                  setOpen(false);
                  setShowUserLogin(true);
                }}
                className="w-full cursor-pointer px-6 py-3 bg-primary hover:bg-primary-dark transition-all duration-200 text-white font-medium rounded-lg shadow-md"
              >
                Login
              </button>
            ) : (
              <button
                onClick={() => {
                  setOpen(false);
                  handleLogout();
                }}
                className="w-full cursor-pointer px-6 py-3 bg-red-500 hover:bg-red-600 transition-all duration-200 text-white font-medium rounded-lg shadow-md"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
