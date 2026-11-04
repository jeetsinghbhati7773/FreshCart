import React from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";

const AllProducts = () => {
  const {
    searchQuery,
    setSearchQuery,
    navigate,
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    products,
    loadingProducts,
    productError,
  } = useAppContext();

  const getCartQuantity = (productId) => {
    const cartItem = cartItems.find((item) => item._id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAdd = (productId) => {
    addToCart(productId);
    toast.success("Added to Cart");
  };
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const selectedCategory = queryParams.get("category");

  const [visibleCount, setVisibleCount] = React.useState(24);

  React.useEffect(() => {
    setVisibleCount(24);
  }, [searchQuery, selectedCategory]);

  const filteredProducts = Array.isArray(products)
    ? products.filter((product) => {
        const matchesSearch =
          !searchQuery ||
          String(product.name || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          String(product.description || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

        const catStr = String(product.category || "").toLowerCase();
        const selStr = String(selectedCategory || "").toLowerCase();
        const matchesCategory =
          !selectedCategory ||
          catStr === selStr ||
          (selStr.includes("veggie") && catStr === "vegetables") ||
          (selStr.includes("fruit") && catStr === "fruits") ||
          (selStr.includes("drink") && catStr === "drinks") ||
          (selStr.includes("dairy") && catStr === "dairy") ||
          (selStr.includes("instant") && catStr === "instant") ||
          (selStr.includes("baker") && catStr === "bakery") ||
          (selStr.includes("grain") && catStr === "grains") ||
          (selStr.includes("snack") && catStr === "snacks");

        return matchesSearch && matchesCategory;
      })
    : [];

  const handleChange = (productId, delta) => {
    const currentQuantity = getCartQuantity(productId);
    const newQuantity = currentQuantity + delta;

    if (newQuantity <= 0) {
      removeFromCart(productId);
      toast("Removed from Cart", { icon: "❌" });
    } else {
      if (currentQuantity === 0) {
        addToCart(productId);
      } else {
        updateQuantity(productId, newQuantity);
      }

      const action = delta > 0 ? "Added" : "Removed";
      toast(`${action} to Cart`);
    }
  };

  return (
    <div className="mt-16 mb-16 px-2 pt-16">
      <p className="text-2xl md:text-3xl font-medium mb-6">All Products</p>

      {/* Loader/Error */}
      {loadingProducts ? (
        <p className="text-xl text-gray-500">Loading products...</p>
      ) : productError ? (
        <p className="text-xl text-red-500">{productError}</p>
      ) : filteredProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-center">
            {filteredProducts.slice(0, visibleCount).map((product) => {
              const count = getCartQuantity(product._id);

              return (
                <div
                  key={product._id}
                  className="w-full bg-gradient-to-br from-blue-50 via-white to-green-50 border border-gray-200 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition"
                >
                  <div
                    className="group cursor-pointer flex items-center justify-center mb-2"
                    onClick={() => {
                      setSearchQuery("");
                      navigate(`/product/${product._id}`);
                      window.scrollTo(0, 0);
                    }}
                  >
                    <img
                      className={`group-hover:scale-105 transition max-w-[200px] sm:max-w-[120px] md:max-w-[140px] h-[140px] object-contain ${
                        !product.inStock ? "grayscale opacity-60" : ""
                      }`}
                      src={product.image && product.image[0] ? product.image[0] : assets.snacks_image}
                      alt={product.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = assets.snacks_image;
                      }}
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
                      {product.inStock ? (
                        count === 0 ? (
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
                            <span className="text-base font-medium">
                              {count}
                            </span>
                            <button
                              onClick={() => handleChange(product._id, 1)}
                              className="text-base font-medium hover:text-green-600"
                            >
                              +
                            </button>
                          </div>
                        )
                      ) : (
                        <span className="flex items-center justify-center h-[40px] px-3 text-sm text-red-500 border border-red-300 bg-red-50 rounded-md">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {visibleCount < filteredProducts.length && (
          <div className="flex flex-col items-center justify-center mt-10 gap-2">
            <button
              onClick={() => setVisibleCount((prev) => prev + 24)}
              className="px-8 py-3 bg-primary text-white font-medium rounded-lg shadow-sm hover:bg-primary-dull transition duration-200 cursor-pointer"
            >
              Load More Products
            </button>
            <p className="text-sm text-gray-500">
              Showing {Math.min(visibleCount, filteredProducts.length)} of {filteredProducts.length} products
            </p>
          </div>
        )}
      </>
      ) : (
        <p className="text-2xl md:text-xl font-medium mb-6 text-black/50">
          No Products Found
        </p>
      )}
    </div>
  );
};

export default AllProducts;
