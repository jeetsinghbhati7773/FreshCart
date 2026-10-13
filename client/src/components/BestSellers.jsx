import React, { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";

const BestSellers = () => {
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const {
    getCartQuantityById,
    addToCart,
    updateQuantity,
    removeFromCart,
    navigate,
  } = useAppContext();

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const res = await axios.get(
          `https://hitman-grocery-backend.onrender.com/api/products/bestsellers`
        );

        setBestSellers(res.data);
      } catch (err) {
        setError("Failed to load best sellers");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, []);

  const handleAdd = (productId) => {
    addToCart(productId);
    toast.success("Added to Cart");
  };

  const handleChange = (productId, delta) => {
    const currentQuantity = getCartQuantityById(productId);
    const newQuantity = currentQuantity + delta;

    if (newQuantity <= 0) {
      removeFromCart(productId);
      toast("Removed from Cart", { icon: "❌" });
    } else {
      updateQuantity(productId, newQuantity);
      toast(`${delta > 0 ? "Added" : "Removed"} to Cart`);
    }
  };

  return (
    <div className="mt-16 mb-16 px-2 pt-16 md:px-0 md:pt-0">
      <p className="text-2xl md:text-3xl font-medium mb-6">Best Sellers</p>

      {loading ? (
        <p className="text-xl text-gray-500">Loading best sellers...</p>
      ) : error ? (
        <p className="text-xl text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {bestSellers.map((product) => {
            const count = getCartQuantityById(product._id);

            return (
              <div
                key={product._id}
                className="w-full bg-gradient-to-br from-blue-50 via-white to-green-50 border border-gray-200 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition"
              >
                <div
                  className="group cursor-pointer flex items-center justify-center mb-2"
                  onClick={() => {
                    navigate(`/product/${product._id}`);
                    window.scrollTo(0, 0);
                  }}
                >
                  <img
                    className="group-hover:scale-105 transition max-w-[150px] sm:max-w-[120px] md:max-w-[140px]"
                    src={product.image[0]}
                    alt={product.name}
                  />
                </div>
                <div className="text-gray-500/60 text-sm">
                  <p>{product.category}</p>
                  <p className="text-gray-700 font-medium text-lg truncate w-full">
                    {product.name}
                  </p>
                  <div className="flex items-center gap-0.5">
                    {Array(5)
                      .fill("")
                      .map((_, i) => (
                        <img
                          key={i}
                          src={
                            i < product.rating
                              ? assets.star_icon
                              : assets.star_dull_icon
                          }
                          alt="star"
                          className="w-4 h-4"
                        />
                      ))}
                    <p>(0)</p>
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
      )}
    </div>
  );
};

export default BestSellers;
