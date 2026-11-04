import React from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaInstagram, FaTwitter, FaFacebookF, FaYoutube } from "react-icons/fa";

const Footer = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  const handleExternalLink = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const quickLinks = [
    { name: "Home", action: () => handleNavigation("/") },
    { name: "Best Sellers", action: () => handleNavigation("/") },
    { name: "All Products", action: () => handleNavigation("/products") },
    { name: "FAQs", action: () => handleNavigation("/faq") },
  ];

  const helpLinks = [
    {
      name: "Return & Refund Policy",
      action: () => toast("Coming Soon! 🚧", { duration: 3000 }),
    },
    {
      name: "Payment Methods",
      action: () => handleNavigation("/payment-methods"),
    },
    {
      name: "Track your Order",
      action: () => handleNavigation("/myorders"),
    },

    {
      name: "Contact Us",
      action: () =>
        handleExternalLink("https://www.instagram.com/modimeet_45/"),
    },
  ];

  const socialIcons = [
    {
      icon: <FaInstagram />,
      url: "https://www.instagram.com/modimeet_45/",
      label: "Instagram",
    },
    {
      icon: <FaTwitter />,
      url: "https://x.com/hitmanDotX?t=xMZaPBWULAcsnHjjaYsPug&s=08",
      label: "Twitter",
    },
    {
      icon: <FaFacebookF />,
      url: "https://www.instagram.com/modimeet_45/",
      label: "Facebook",
    },
    {
      icon: <FaYoutube />,
      url: "https://youtube.com/@hitman.investing?si=X9W7B5NXNCJE0ON_",
      label: "YouTube",
    },
  ];

  return (
    <footer className="bg-green-50 px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32 text-gray-600">
      <div className="flex flex-col lg:flex-row justify-between gap-12 pt-8 pb-4 lg:pb-6 border-b border-gray-300">
        {/* Logo & Description */}
        <div className="lg:max-w-md text-left">
          <div
            className="flex items-center gap-2.5 mb-4 cursor-pointer"
            onClick={() => handleNavigation("/")}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-green-600 to-emerald-400 flex items-center justify-center text-white shadow-md">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-700 via-emerald-600 to-teal-700 bg-clip-text text-transparent">
                ShopPilot
              </span>
              <span className="text-[10px] block font-semibold text-emerald-600 -mt-1 uppercase tracking-wider">
                Autonomous Grocery Agent
              </span>
            </div>
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-gray-500">
            ShopPilot delivers fresh authentic Indian groceries and snacks directly to your doorstep. Powered by intelligent autonomous shopping workflows.
          </p>
        </div>

        {/* Link Sections */}
        <div className="w-full lg:flex lg:justify-end lg:items-start lg:gap-20">
          <div className="grid grid-cols-2 gap-8 sm:gap-10 w-full lg:w-auto">
            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 text-base md:text-lg">
                Quick Links
              </h3>
              <ul className="space-y-2 text-sm sm:text-base">
                {quickLinks.map((link, i) => (
                  <li key={i}>
                    <button
                      onClick={link.action}
                      className="hover:text-gray-900 transition-colors duration-200 text-left w-full"
                    >
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Need Help */}
            <div className="text-left">
              <h3 className="font-semibold text-gray-800 mb-3 text-base md:text-lg">
                Need Help?
              </h3>
              <ul className="space-y-2 text-sm sm:text-base">
                {helpLinks.map((link, i) => (
                  <li key={i}>
                    <button
                      onClick={link.action}
                      className="hover:text-gray-900 transition-colors duration-200 text-left w-full"
                    >
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Mobile-only Social Icons */}
          <div className="sm:hidden mt-12 flex justify-center items-center gap-4 w-full">
            {socialIcons.map((social, idx) => (
              <button
                key={idx}
                onClick={() => handleExternalLink(social.url)}
                aria-label={social.label}
                className="text-2xl text-gray-600 hover:text-primary transition"
              >
                {social.icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <p className="py-4 text-center text-xs sm:text-sm text-gray-400">
        © 2026 ShopPilot. All Rights Reserved. Built for PayPal AI Hackathon.
      </p>
    </footer>
  );
};

export default Footer;
