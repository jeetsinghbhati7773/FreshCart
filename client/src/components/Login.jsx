import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import axios from "../utils/axiosInstance";
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

  // OTP related
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "");
  }, []);

  useEffect(() => {
    let interval;
    if (countdown > 0) {
      interval = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const resetOtpState = () => {
    setOtpSent(false);
    setOtpVerified(false);
    setOtp("");
    setCountdown(0);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "email" && (otpSent || otpVerified)) {
      resetOtpState();
    }
  };

  const handleSendOtp = async () => {
    if (!formData.email) return toast.error("Enter email first");

    try {
      setLoadingOtp(true);
      const res = await axios.post(
        "https://hitman-grocery-backend.onrender.com/api/otp/send",
        { email: formData.email }
      );
      toast.success(res.data.message);
      setOtpSent(true);
      setCountdown(30);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return toast.error("Enter OTP first");

    try {
      setLoadingOtp(true);
      const res = await axios.post(
        "https://hitman-grocery-backend.onrender.com/api/otp/verify",
        {
          email: formData.email,
          otp,
        }
      );
      toast.success(res.data.message);
      setOtpVerified(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otpVerified && currentView !== "login") {
      return toast.error("Please verify your email via OTP first");
    }

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
            "https://hitman-grocery-backend.onrender.com/api/users/register",
            {
              name: formData.name,
              email: formData.email,
              password: formData.password,
            }
          );
          break;

        case "login":
          res = await axios.post(
            "https://hitman-grocery-backend.onrender.com/api/users/login",
            {
              email: formData.email,
              password: formData.password,
            }
          );
          break;

        case "forgot":
          res = await axios.post(
            "https://hitman-grocery-backend.onrender.com/api/users/reset-password",
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
    resetOtpState();
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
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full sm:flex-1 px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                placeholder="Enter your email"
                required
              />
              {currentView !== "login" && !otpSent && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loadingOtp || countdown > 0 || !formData.email}
                  className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap w-full sm:w-auto ${
                    loadingOtp || countdown > 0 || !formData.email
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : "bg-primary text-white hover:bg-primary-dark shadow-md hover:shadow-lg"
                  }`}
                >
                  {loadingOtp ? "Sending..." : "Send OTP"}
                </button>
              )}
            </div>

            {/* OTP Section for register and forgot password */}
            {currentView !== "login" && otpSent && !otpVerified && (
              <div className="mt-3 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="flex-1 px-3 py-2 rounded-lg border border-primary/30 bg-primary/5 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-center text-base font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={loadingOtp || !otp}
                    className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                      loadingOtp || !otp
                        ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg"
                    }`}
                  >
                    {loadingOtp ? "Verifying..." : "Verify"}
                  </button>
                </div>
                {countdown > 0 && (
                  <p className="text-xs text-gray-500 text-right">
                    Resend available in {countdown}s
                  </p>
                )}
              </div>
            )}

            {otpVerified && (
              <div className="mt-2 flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded-lg text-sm">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Email verified successfully!</span>
              </div>
            )}
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

          {currentView === "forgot" && otpVerified && (
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
            disabled={loading || (currentView !== "login" && !otpVerified)}
            className={`w-full py-2.5 rounded-lg font-medium transition-all duration-200 mt-4 ${
              loading || (currentView !== "login" && !otpVerified)
                ? "bg-primary text-white hover:bg-primary-dark shadow-md hover:shadow-lg cursor-pointer"
                : "bg-primary text-white hover:bg-primary-dark shadow-md hover:shadow-lg"
            }`}
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
