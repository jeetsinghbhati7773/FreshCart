import React from "react";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";

const MainBanner = () => {
  return (
    <div className="relative w-full">
      {/* Background Images */}
      <div>
        <img
          src={assets.main_banner_bg}
          alt="banner"
          className="w-full hidden md:block"
        />
        <img
          src={assets.main_banner_bg_sm}
          alt="banner"
          className="w-full md:hidden max-h-[420px] object-cover rounded-md"
        />
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col items-start justify-end md:justify-center px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24 py-10 md:py-0">
        <h1 className="text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-left max-w-[90%] sm:max-w-md lg:max-w-2xl leading-snug sm:leading-tight lg:leading-[1.15] text-black">
          Freshness You Can Trust, Savings You will Love!
        </h1>

        <div className="flex items-center mt-6 font-medium space-x-4">
          <Link
            to={"/products"}
            className="group flex items-center gap-2 px-5 py-2.5 text-sm sm:text-base bg-primary hover:bg-primary-dull transition-all duration-300 rounded text-white"
          >
            Shop now
            <img
              className="transition-all duration-300 group-hover:translate-x-1"
              src={assets.white_arrow_icon}
              alt="arrow"
            />
          </Link>

          <Link
            to={"/products"}
            className="group hidden md:flex items-center gap-2 px-6 md:px-8 py-3 text-gray-800 hover:text-black transition-all duration-300"
          >
            Explore deals
            <img
              className="transition-all duration-300 group-hover:translate-x-1"
              src={assets.black_arrow_icon}
              alt="arrow"
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MainBanner;
