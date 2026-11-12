import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import axios from "../utils/axiosInstance";
import { API_URL } from "../config";
import toast from "react-hot-toast";

const Login = () => {
  const { setShowUserLogin, setUser } = useAppContext();
  const [currentView, setCurrentView] = useState("login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "");
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (currentView === "forgot") {
      if (formData.newPassword !== formData.confirmPassword) {
        return toast.error("Passwords don't match");
      }
      if (formData.newPassword.length < 6) {
        return toast.error("Password must be at least 6 characters");
      }
    }

    try {
      setLoading(true);
      let res;

      switch (currentView) {
        case "register":
          res = await axios.post(
            `${API_URL}/users/register`,
            {
              name: formData.name,
              email: formData.email,
              password: formData.password,
            }
          );
          break;

        case "login":
          res = await axios.post(
            `${API_URL}/users/login`,
            {
              email: formData.email,
              password: formData.password,
            }
          );
          break;

        case "forgot":
          res = await axios.post(
            `${API_URL}/users/reset-password`,
            {
              email: formData.email,
              newPassword: formData.newPassword,
            }
          );
          toast.success(res.data.message);
          setCurrentView("login");
          resetForm();
          return;
      }

      toast.success(res.data.message);

      // ✅ Store token from backend
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      setUser(true);
      setShowUserLogin(false);
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const switchView = (view) => {
    setCurrentView(view);
    resetForm();
  };

  const getTitle = () => {
    switch (currentView) {
      case "login":
        return "Welcome Back";
      case "register":
        return "Create Account";
      case "forgot":
        return "Reset Password";
      default:
        return "Welcome";
    }
  };

  const getSubtitle = () => {
    switch (currentView) {
      case "login":
        return "Sign in to your account";
      case "register":
        return "Join us today";
      case "forgot":
        return "Enter your email to reset password";
      default:
        return "";
    }
  };

  return (
    <div
      onClick={() => setShowUserLogin(false)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden animate-fadeIn"
      >
        {/* Simplified Header */}
        <div className="bg-primary p-5 text-white text-center">
          <h2 className="text-3xl font-bold">{getTitle()}</h2>
          <p className="text-white/90 mt-0.5 text-lg">{getSubtitle()}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Name field for register */}
          {currentView === "register" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                placeholder="Enter your full name"
                required
              />
            </div>
          )}

          {/* Email Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password fields */}
          {currentView === "login" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                placeholder="Enter your password"
                required
              />
              <div className="text-right mt-1">
                <button
                  type="button"
                  onClick={() => switchView("forgot")}
                  className="text-xs text-primary hover:text-primary-dark hover:underline transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            </div>
          )}

          {currentView === "register" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                placeholder="Create a strong password"
                required
              />
            </div>
          )}

          {currentView === "forgot" && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) =>
                    handleInputChange("newPassword", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                  placeholder="Enter new password"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                  placeholder="Confirm new password"
                  required
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-medium transition-all duration-200 mt-4 bg-primary text-white hover:bg-primary-dark shadow-md hover:shadow-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {currentView === "login"
                  ? "Signing in..."
                  : currentView === "register"
                  ? "Creating account..."
                  : "Resetting password..."}
              </div>
            ) : (
              <>
                {currentView === "login"
                  ? "Sign In"
                  : currentView === "register"
                  ? "Create Account"
                  : "Reset Password"}
              </>
            )}
          </button>

          {/* Navigation Links */}
          <div className="text-center pt-3 border-t border-gray-200 mt-4">
            {currentView === "login" && (
              <p className="text-xs text-gray-600">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchView("register")}
                  className="text-primary hover:text-primary-dark font-medium hover:underline transition-colors"
                >
                  Sign up
                </button>
              </p>
            )}

            {currentView === "register" && (
              <p className="text-xs text-gray-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchView("login")}
                  className="text-primary hover:text-primary-dark font-medium hover:underline transition-colors"
                >
                  Sign in
                </button>
              </p>
            )}

            {currentView === "forgot" && (
              <p className="text-xs text-gray-600">
                Remember your password?{" "}
                <button
                  type="button"
                  onClick={() => switchView("login")}
                  className="text-primary hover:text-primary-dark font-medium hover:underline transition-colors"
                >
                  Back to login
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
