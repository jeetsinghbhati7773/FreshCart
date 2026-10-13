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
          <img
            src="hitman.grocery.logo.png"
            alt="Hitman Grocery Logo"
            className="w-32 sm:w-36 object-contain mb-6 cursor-pointer"
            onClick={() => handleNavigation("/")}
          />
          <p className="text-sm sm:text-base leading-relaxed text-gray-500">
            We deliver fresh groceries and snacks straight to your door. Trusted
            by thousands, we aim to make your shopping experience simple and
            affordable.
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
      <p className="py-4 text-center text-xs sm:text-sm md:text-base text-gray-400">
        © 2025 Hitman.Grocery All Rights Reserved.
      </p>
    </footer>
  );
};

export default Footer;
