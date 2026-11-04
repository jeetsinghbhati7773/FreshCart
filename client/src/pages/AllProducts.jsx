import React, { useState, useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";

const CATEGORY_TABS = [
  { id: "all", label: "All Items", icon: "🛒" },
  { id: "vegetables", label: "Vegetables", icon: "🥦" },
  { id: "fruits", label: "Fruits", icon: "🍎" },
  { id: "dairy", label: "Dairy & Eggs", icon: "🥛" },
  { id: "snacks", label: "Snacks & Sweets", icon: "🍫" },
  { id: "grains", label: "Grains & Flours", icon: "🌾" },
  { id: "instant", label: "Instant Foods", icon: "🍜" },
  { id: "drinks", label: "Cold Drinks & Tea", icon: "🥤" },
  { id: "bakery", label: "Bakery & Breads", icon: "🍞" },
];

const PRICE_RANGES = [
  { id: "all", label: "Any Price" },
  { id: "under-50", label: "Under ₹50", min: 0, max: 50 },
  { id: "50-100", label: "₹50 - ₹100", min: 50, max: 100 },
  { id: "100-200", label: "₹100 - ₹200", min: 100, max: 200 },
  { id: "above-200", label: "Above ₹200", min: 200, max: 99999 },
];

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

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCat = queryParams.get("category") || "all";

  const [activeCategory, setActiveCategory] = useState(initialCat.toLowerCase());
  const [activePriceRange, setActivePriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(24);

  // Sync category from URL if changed
  React.useEffect(() => {
    const cat = queryParams.get("category");
    if (cat) setActiveCategory(cat.toLowerCase());
  }, [location.search]);

  // Reset pagination on filter change
  React.useEffect(() => {
    setVisibleCount(24);
  }, [searchQuery, activeCategory, activePriceRange, sortBy, inStockOnly]);

  const getCartQuantity = (productId) => {
    const cartItem = cartItems.find((item) => item._id === productId || item.id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAdd = (product) => {
    addToCart(product._id || product.id);
    toast.success(`Added ${product.name} to cart`);
  };

  const handleChange = (product, delta) => {
    const pId = product._id || product.id;
    const currentQuantity = getCartQuantity(pId);
    const newQuantity = currentQuantity + delta;

    if (newQuantity <= 0) {
      removeFromCart(pId);
      toast("Removed from cart", { icon: "🗑️" });
    } else {
      if (currentQuantity === 0) {
        addToCart(pId);
      } else {
        updateQuantity(pId, newQuantity);
      }
    }
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];

    let list = products.filter((product) => {
      // 1. Search Query
      if (searchQuery && searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = String(product.name || "").toLowerCase().includes(query);
        const descMatch = String(product.description || "").toLowerCase().includes(query);
        const brandMatch = String(product.brand || "").toLowerCase().includes(query);
        const catMatch = String(product.category || "").toLowerCase().includes(query);
        if (!nameMatch && !descMatch && !brandMatch && !catMatch) return false;
      }

      // 2. Category Filter
      if (activeCategory && activeCategory !== "all") {
        const cat = String(product.category || "").toLowerCase();
        if (activeCategory === "vegetables" && !cat.includes("veg")) return false;
        if (activeCategory === "fruits" && !cat.includes("fruit")) return false;
        if (activeCategory === "drinks" && !cat.includes("drink")) return false;
        if (activeCategory === "dairy" && !cat.includes("dairy")) return false;
        if (activeCategory === "snacks" && !cat.includes("snack")) return false;
        if (activeCategory === "grains" && !cat.includes("grain")) return false;
        if (activeCategory === "instant" && !cat.includes("instant")) return false;
        if (activeCategory === "bakery" && !cat.includes("baker")) return false;
      }

      // 3. Price Filter
      if (activePriceRange !== "all") {
        const range = PRICE_RANGES.find((r) => r.id === activePriceRange);
        if (range) {
          const price = Number(product.offerPrice);
          if (price < range.min || price > range.max) return false;
        }
      }

      // 4. In Stock Only Filter
      if (inStockOnly && !product.inStock) {
        return false;
      }

      return true;
    });

    // 5. Sorting
    switch (sortBy) {
      case "price-asc":
        return list.sort((a, b) => Number(a.offerPrice) - Number(b.offerPrice));
      case "price-desc":
        return list.sort((a, b) => Number(b.offerPrice) - Number(a.offerPrice));
      case "name-asc":
        return list.sort((a, b) => String(a.name).localeCompare(String(b.name)));
      case "name-desc":
        return list.sort((a, b) => String(b.name).localeCompare(String(a.name)));
      default:
        return list;
    }
  }, [products, searchQuery, activeCategory, activePriceRange, inStockOnly, sortBy]);

  const clearAllFilters = () => {
    setActiveCategory("all");
    setActivePriceRange("all");
    setInStockOnly(false);
    setSortBy("featured");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pt-24 pb-20 px-3 sm:px-6 lg:px-12 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-green-700 tracking-wider mb-1">
            <span>Freshness Guaranteed</span>
            <span>•</span>
            <span>230+ Authentic Essentials</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Shop All Groceries
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Browse fresh vegetables, farm fruits, pantry grains, dairy, and authentic Indian snacks.
          </p>
        </div>

        {/* Total found badge */}
        <div className="flex items-center gap-3">
          <span className="text-xs bg-green-100 text-green-800 font-semibold px-3 py-1.5 rounded-full border border-green-200">
            {filteredProducts.length} Products Found
          </span>
          {(activeCategory !== "all" || activePriceRange !== "all" || inStockOnly || searchQuery) && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-red-600 hover:text-red-700 font-medium underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-6">
        {CATEGORY_TABS.map((tab) => {
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-green-600 text-white shadow-md shadow-green-600/20 scale-105"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-green-300 hover:bg-green-50/50"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Secondary Controls Bar: Price & Sort */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-sm mb-8 flex flex-wrap items-center justify-between gap-4">
        {/* Price Range Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1">
            Price:
          </span>
          {PRICE_RANGES.map((range) => (
            <button
              key={range.id}
              onClick={() => setActivePriceRange(range.id)}
              className={`text-xs px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                activePriceRange === range.id
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Stock & Sort dropdowns */}
        <div className="flex items-center gap-3 ml-auto">
          <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded text-green-600 focus:ring-green-500 w-3.5 h-3.5"
            />
            <span>In Stock Only</span>
          </label>

          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="text-gray-400 font-medium hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1 text-xs font-medium text-gray-700 outline-none focus:border-green-600 cursor-pointer"
            >
              <option value="featured">Featured / Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid / Loader / Empty State */}
      {loadingProducts ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-4 border border-gray-200 animate-pulse flex flex-col justify-between h-72"
            >
              <div className="w-full h-36 bg-gray-200 rounded-xl mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="h-8 bg-gray-200 rounded-lg" />
            </div>
          ))}
        </div>
      ) : productError ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center text-red-600 my-8">
          <p className="text-lg font-semibold">{productError}</p>
          <p className="text-sm mt-1">Please make sure the backend server is running.</p>
        </div>
      ) : filteredProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.slice(0, visibleCount).map((product) => {
              const pId = product._id || product.id;
              const count = getCartQuantity(pId);
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
                      setSearchQuery("");
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
                        setSearchQuery("");
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

          {/* Load More Button */}
          {visibleCount < filteredProducts.length && (
            <div className="flex flex-col items-center justify-center mt-12 gap-2">
              <button
                onClick={() => setVisibleCount((prev) => prev + 24)}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-full shadow-md hover:shadow-lg hover:from-green-700 hover:to-emerald-700 transition duration-200 cursor-pointer"
              >
                Load More Products ({filteredProducts.length - visibleCount} remaining)
              </button>
              <p className="text-xs text-gray-400">
                Showing {Math.min(visibleCount, filteredProducts.length)} of {filteredProducts.length} items
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm my-8">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto text-2xl mb-3">
            🔍
          </div>
          <h3 className="text-xl font-bold text-gray-800">No matching groceries found</h3>
          <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">
            We couldn't find any items matching your selected filters or search terms. Try clearing your filters or searching for something else.
          </p>
          <button
            onClick={clearAllFilters}
            className="mt-5 px-6 py-2.5 bg-green-600 text-white text-xs font-semibold rounded-full hover:bg-green-700 shadow-md transition cursor-pointer"
          >
            Show All 230+ Groceries
          </button>
        </div>
      )}
    </div>
  );
};

export default AllProducts;
