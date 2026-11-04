import React, { useState } from "react";
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

  const [visibleCount, setVisibleCount] = useState(24);

  React.useEffect(() => {
    setVisibleCount(24);
  }, [categoryName]);

  // Filter products by category (case-insensitive)
  const categoryProducts = React.useMemo(() => {
    if (!Array.isArray(products)) return [];
    const query = (categoryName || "").toLowerCase();
    return products.filter((product) => {
      const cat = String(product.category || "").toLowerCase();
      return (
        cat === query ||
        (query.includes("veg") && cat.includes("veg")) ||
        (query.includes("fruit") && cat.includes("fruit")) ||
        (query.includes("drink") && cat.includes("drink")) ||
        (query.includes("dairy") && cat.includes("dairy")) ||
        (query.includes("snack") && cat.includes("snack")) ||
        (query.includes("grain") && cat.includes("grain")) ||
        (query.includes("instant") && cat.includes("instant")) ||
        (query.includes("baker") && cat.includes("baker"))
      );
    });
  }, [products, categoryName]);

  const handleAdd = (product) => {
    const pId = product._id || product.id;
    addToCart(pId);
    toast.success(`Added ${product.name} to cart`);
  };

  const handleChange = (product, delta) => {
    const pId = product._id || product.id;
    const currentQty = getCartQuantityById(pId);
    const newQty = currentQty + delta;

    if (newQty <= 0) {
      removeFromCart(pId);
      toast("Removed from cart", { icon: "🗑️" });
    } else {
      updateQuantity(pId, newQty);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pt-24 pb-20 px-3 sm:px-6 lg:px-12 max-w-7xl mx-auto">
      {/* Header and Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-4">
        <span
          className="cursor-pointer hover:text-green-600 transition"
          onClick={() => navigate("/")}
        >
          Home
        </span>
        <span>/</span>
        <span
          className="cursor-pointer hover:text-green-600 transition"
          onClick={() => navigate("/products")}
        >
          All Groceries
        </span>
        <span>/</span>
        <span className="text-gray-900 font-semibold capitalize">
          {categoryName.replace(/-/g, " ")}
        </span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 capitalize tracking-tight">
            {categoryName.replace(/-/g, " ")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Carefully curated fresh grocery selection from top verified Indian brands.
          </p>
        </div>

        <span className="text-xs bg-green-100 text-green-800 font-bold px-3.5 py-1.5 rounded-full border border-green-200 self-start sm:self-auto">
          {categoryProducts.length} Products Available
        </span>
      </div>

      {categoryProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {categoryProducts.slice(0, visibleCount).map((product) => {
              const pId = product._id || product.id;
              const count = getCartQuantityById(pId);
              const discount =
                product.price && product.offerPrice && product.price > product.offerPrice
                  ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
                  : 0;

              return (
                <div
                  key={pId}
                  className="group bg-white rounded-2xl border border-gray-200/90 hover:border-green-300 p-4 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                >
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-1 mb-2">
                    {discount > 0 ? (
                      <span className="text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full tracking-wider">
                        {discount}% OFF
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                        {product.brand || product.category}
                      </span>
                    )}

                    {product.unit && (
                      <span className="text-[11px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                        {product.unit}
                      </span>
                    )}
                  </div>

                  {/* Image Container */}
                  <div
                    className="relative cursor-pointer flex items-center justify-center py-3 my-1"
                    onClick={() => {
                      navigate(`/product/${pId}`);
                      window.scrollTo(0, 0);
                    }}
                  >
                    <img
                      className={`h-36 w-full object-contain group-hover:scale-105 transition-transform duration-300 ${
                        !product.inStock ? "grayscale opacity-50" : ""
                      }`}
                      src={product.image?.[0] || assets.snacks_image}
                      alt={product.name}
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = assets.snacks_image;
                      }}
                    />

                    {!product.inStock && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-red-600/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md backdrop-blur-sm">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="mt-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-green-700">
                      {product.category}
                    </p>

                    <h3
                      className="text-sm font-semibold text-gray-800 line-clamp-2 hover:text-green-700 transition cursor-pointer min-h-[2.5rem] mt-0.5"
                      title={product.name}
                      onClick={() => {
                        navigate(`/product/${pId}`);
                        window.scrollTo(0, 0);
                      }}
                    >
                      {product.name}
                    </h3>

                    {/* Price and Add/Counter */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-bold text-gray-900">
                            ₹{product.offerPrice}
                          </span>
                          {product.price > product.offerPrice && (
                            <span className="text-xs text-gray-400 line-through">
                              ₹{product.price}
                            </span>
                          )}
                        </div>
                      </div>

                      {product.inStock ? (
                        count === 0 ? (
                          <button
                            onClick={() => handleAdd(product)}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-green-50 text-green-700 hover:bg-green-600 hover:text-white border border-green-300 font-semibold text-xs rounded-xl shadow-sm hover:shadow transition duration-200 cursor-pointer"
                          >
                            <span>+</span>
                            <span>Add</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 bg-green-600 text-white px-2 py-1 rounded-xl shadow-sm font-bold text-xs">
                            <button
                              onClick={() => handleChange(product, -1)}
                              className="w-5 h-5 flex items-center justify-center hover:bg-green-700 rounded-md transition"
                            >
                              −
                            </button>
                            <span className="w-4 text-center">{count}</span>
                            <button
                              onClick={() => handleChange(product, 1)}
                              className="w-5 h-5 flex items-center justify-center hover:bg-green-700 rounded-md transition"
                            >
                              +
                            </button>
                          </div>
                        )
                      ) : (
                        <span className="text-[11px] text-gray-400 font-medium">Unavailable</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {visibleCount < categoryProducts.length && (
            <div className="flex flex-col items-center justify-center mt-12 gap-2">
              <button
                onClick={() => setVisibleCount((prev) => prev + 24)}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-full shadow-md hover:shadow-lg transition duration-200 cursor-pointer"
              >
                Load More Products ({categoryProducts.length - visibleCount} remaining)
              </button>
              <p className="text-xs text-gray-400">
                Showing {Math.min(visibleCount, categoryProducts.length)} of {categoryProducts.length} items
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm my-8">
          <p className="text-gray-500 text-base">
            No products found in category "{categoryName}".
          </p>
          <button
            onClick={() => navigate("/products")}
            className="mt-4 px-6 py-2.5 bg-green-600 text-white text-xs font-semibold rounded-full hover:bg-green-700 transition"
          >
            Browse All Groceries
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCategory;
