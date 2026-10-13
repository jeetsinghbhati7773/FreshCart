import React from "react";
import { useNavigate } from "react-router-dom";
import { categories } from "../assets/assets";

const Categories = () => {
  const navigate = useNavigate();

  return (
    <div className="mt-16 mb-16">
      <p className="text-2xl md:text-3xl font-medium mb-6">Categories</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {categories.map((category, index) => (
          <div
            key={index}
            className="group cursor-pointer p-6 rounded-xl flex flex-col justify-center items-center hover:shadow-lg transition-all duration-300 bg-white"
            style={{ backgroundColor: category.bgColor }}
            onClick={() => {
              navigate(
                `/products?category=${encodeURIComponent(
                  category.text.toLowerCase()
                )}`
              );

              scrollTo(0, 0);
            }}
          >
            <img
              src={category.image}
              alt={category.text}
              className="group-hover:scale-105 transition-transform duration-300 w-24 h-24  object-contain mb-4"
            />
            <p className="text-xl font-medium text-center">{category.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
