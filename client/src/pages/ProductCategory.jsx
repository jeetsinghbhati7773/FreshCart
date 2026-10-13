import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";

const ProductCategory = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();

  const {
    products,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartQuantityById,
  } = useAppContext();

  // Filter products by category (case-insensitive)
  const categoryProducts = products.filter(
    (product) => product.category.toLowerCase() === categoryName.toLowerCase()
  );

  const handleAdd = (productId) => {
    addToCart(productId);
    toast.success("Added to Cart");
  };

  const handleChange = (productId, delta) => {
    const currentQty = getCartQuantityById(productId);
    const newQty = currentQty + delta;

    if (newQty <= 0) {
      removeFromCart(productId);
      toast("Removed from Cart", { icon: "❌" });
    } else {
      updateQuantity(productId, newQty);
      toast(`${delta > 0 ? "Added" : "Removed"} to Cart`);
    }
  };

  return (
    <div className="mt-24 mb-16 px-4">
      <h1 className="text-2xl md:text-3xl font-medium mb-6 capitalize">
        {categoryName.replace(/-/g, " ")}
      </h1>

      {categoryProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-center">
          {categoryProducts.map((product) => {
            const count = getCartQuantityById(product._id);

            return (
              <div
                key={product._id}
                className="bg-gradient-to-br from-blue-50 via-white to-green-50 border border-gray-200 rounded-xl p-4 w-full max-w-[260px] shadow-sm hover:shadow-md transition"
              >
                <div
                  className="group cursor-pointer flex items-center justify-center px-2"
                  onClick={() => {
                    navigate(`/product/${product._id}`);
                    window.scrollTo(0, 0);
                  }}
                >
                  <img
                    className="group-hover:scale-105 transition max-w-26 md:max-w-36"
                    src={product.image[0]}
                    alt={product.name}
                  />
                </div>

                <div className="text-gray-500/60 text-sm mt-4">
                  <p>{product.category}</p>
                  <p className="text-gray-700 font-medium text-lg truncate">
                    {product.name}
                  </p>
                  <div className="flex items-center gap-0.5">
                    {Array(5)
                      .fill("")
                      .map((_, i) => (
                        <img
                          key={i}
                          src={
                            i < (product.rating || 0)
                              ? assets.star_icon
                              : assets.star_dull_icon
                          }
                          alt="star"
                          className="w-4 h-4"
                        />
                      ))}
                    <p>({product.rating || 0})</p>
                  </div>

                  <div className="flex items-end justify-between mt-3">
                    <p className="md:text-xl text-base font-medium text-primary">
                      ₹{product.offerPrice}{" "}
                      <span className="text-primary-dull md:text-sm text-xs line-through">
                        ₹{product.price}
                      </span>
                    </p>

                    <div className="text-primary">
                      {count === 0 ? (
                        <button
                          onClick={() => handleAdd(product._id)}
                          className="flex items-center justify-center gap-2 px-4 py-2 border border-green-400 text-green-500 bg-green-50 rounded-md shadow-sm hover:bg-green-200 transition duration-200"
                        >
                          <img
                            src={assets.cart_icon}
                            alt="cart"
                            className="w-4 h-4"
                          />
                          <span className="font-medium">Add</span>
                        </button>
                      ) : (
                        <div className="flex items-center justify-center gap-3 px-4 py-2 h-[40px] border border-green-400 text-green-500 bg-green-100 rounded-md shadow-sm transition duration-200">
                          <button
                            onClick={() => handleChange(product._id, -1)}
                            className="text-base font-medium hover:text-green-600"
                          >
                            −
                          </button>
                          <span className="text-base font-medium">{count}</span>
                          <button
                            onClick={() => handleChange(product._id, 1)}
                            className="text-base font-medium hover:text-green-600"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          No products found in this category.
        </p>
      )}
    </div>
  );
};

export default ProductCategory;
