import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { API_URL } from "../config";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const { addToCart, updateQuantity, getCartQuantityById } = useAppContext();

  const [product, setProduct] = useState(null);
  const [thumbnail, setThumbnail] = useState("");
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/products/${productId}`);
        const data = res.data;
        setProduct(data);
        setThumbnail(data.image?.[0] || "");
        setCount(getCartQuantityById(data._id || data.id) || 1);
      } catch (err) {
        console.error("Product not found:", err);
        navigate("/404");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, navigate, getCartQuantityById]);

  const pId = product?._id || product?.id;

  const handleAddToCart = () => {
    if (!product || !product.inStock) {
      toast.error("Product is currently out of stock");
      return;
    }

    const currentQty = getCartQuantityById(pId);

    if (currentQty === 0) {
      addToCart(pId, count);
    } else {
      updateQuantity(pId, count);
    }

    toast.success(`${count}x "${product.name}" added to cart`);
  };

  const getDescriptionPoints = (desc) => {
    if (Array.isArray(desc)) return desc;
    if (typeof desc === "string") {
      return desc
        .split(/[\n•\-•\.]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    }
    return [];
  };

  if (loading) {
    return (
      <div className="max-w-6xl w-full px-6 mx-auto mb-16 pt-28">
        <div className="animate-pulse flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-1/2 h-96 bg-gray-200 rounded-3xl" />
          <div className="w-full md:w-1/2 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-10 bg-gray-200 rounded w-3/4" />
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-32 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const discount =
    product.price > product.offerPrice
      ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
      : 0;

  const savings = Math.max(0, product.price - product.offerPrice);

  return (
    <div className="max-w-6xl w-full px-4 sm:px-6 mx-auto mb-16 pt-24">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 py-4 flex-wrap">
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
        <span
          className="cursor-pointer hover:text-green-600 transition capitalize"
          onClick={() => navigate(`/products?category=${encodeURIComponent(product.category)}`)}
        >
          {product.category}
        </span>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-xs">
          {product.name}
        </span>
      </nav>

      <div className="flex flex-col md:flex-row gap-10 lg:gap-14 mt-2 bg-white rounded-3xl border border-gray-200 p-6 sm:p-10 shadow-sm">
        {/* Left Column: Images */}
        <div className="flex flex-col-reverse sm:flex-row gap-4 w-full md:w-1/2">
          {/* Thumbnails */}
          {Array.isArray(product.image) && product.image.length > 1 && (
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[420px] scrollbar-none">
              {product.image.map((img, index) => (
                <div
                  key={index}
                  onClick={() => setThumbnail(img)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 border-2 rounded-2xl overflow-hidden cursor-pointer p-1.5 bg-gray-50 transition-all ${
                    thumbnail === img
                      ? "border-green-600 ring-2 ring-green-100 scale-95"
                      : "border-gray-200 hover:border-green-300"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Main Showcase Image */}
          <div className="flex-1 border border-gray-200 rounded-3xl overflow-hidden p-6 bg-gradient-to-br from-gray-50 via-white to-green-50/20 flex items-center justify-center min-h-[340px] max-h-[440px]">
            <img
              src={thumbnail || assets.snacks_image}
              alt={product.name}
              className="max-h-[380px] w-auto max-w-full object-contain hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = assets.snacks_image;
              }}
            />
          </div>
        </div>

        {/* Right Column: Information & Actions */}
        <div className="w-full md:w-1/2 flex flex-col justify-between">
          <div>
            {/* Badges Bar */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className="text-xs font-bold uppercase tracking-wider bg-green-100 text-green-800 px-3 py-1 rounded-full">
                {product.category}
              </span>

              {product.brand && (
                <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                  Brand: {product.brand}
                </span>
              )}

              {product.unit && (
                <span className="text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full">
                  Net: {product.unit}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-snug">
              {product.name}
            </h1>

            {/* Price Box */}
            <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50/40 border border-green-200 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Special Offer Price</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-black text-gray-900">
                    ₹{product.offerPrice}
                  </span>
                  {product.price > product.offerPrice && (
                    <span className="text-base text-gray-400 line-through">
                      MRP ₹{product.price}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-gray-500 font-medium">
                  Inclusive of all taxes & standard packaging
                </span>
              </div>

              {discount > 0 && (
                <div className="text-right">
                  <span className="text-sm font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-xl block">
                    Save {discount}%
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold block mt-1">
                    (₹{savings} discount)
                  </span>
                </div>
              )}
            </div>

            {/* Stock Availability */}
            <div className="mt-5 flex items-center gap-3">
              <span
                className={`inline-block w-3 h-3 rounded-full ${
                  product.inStock ? "bg-green-500 animate-pulse" : "bg-red-500"
                }`}
              />
              <span className="text-sm font-semibold text-gray-800">
                {product.inStock
                  ? `In Stock (${product.stockQuantity || 50} units available)`
                  : "Currently Out of Stock"}
              </span>
            </div>

            {/* Quantity Selector */}
            {product.inStock && (
              <div className="mt-6 flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-700">Quantity:</span>
                <div className="flex items-center border-2 border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
                  <button
                    onClick={() => setCount((prev) => Math.max(1, prev - 1))}
                    className="px-3.5 py-1.5 text-lg font-bold text-gray-700 hover:bg-gray-200 transition"
                  >
                    −
                  </button>
                  <span className="px-5 py-1.5 font-bold text-gray-900 bg-white">
                    {count}
                  </span>
                  <button
                    onClick={() =>
                      setCount((prev) =>
                        Math.min(product.stockQuantity || 99, prev + 1)
                      )
                    }
                    className="px-3.5 py-1.5 text-lg font-bold text-gray-700 hover:bg-gray-200 transition"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-gray-400">
                  Total: ₹{product.offerPrice * count}
                </span>
              </div>
            )}

            {/* About Product Details */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-3">
                Product Details
              </h3>
              <ul className="space-y-2">
                {getDescriptionPoints(product.description).map((desc, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">•</span>
                    <span>{desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex gap-4">
            {product.inStock ? (
              <button
                onClick={handleAddToCart}
                className="flex-1 py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-base rounded-2xl shadow-lg shadow-green-600/30 hover:shadow-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
              >
                <img src={assets.cart_icon} alt="cart" className="w-5 h-5 invert brightness-0" />
                <span>Add {count} to Cart (₹{product.offerPrice * count})</span>
              </button>
            ) : (
              <button
                disabled
                className="flex-1 py-4 px-6 bg-gray-200 text-gray-500 font-bold text-base rounded-2xl cursor-not-allowed"
              >
                Item Out of Stock
              </button>
            )}

            <button
              onClick={() => navigate("/cart")}
              className="px-5 py-4 border-2 border-green-600 text-green-700 hover:bg-green-50 font-bold text-sm rounded-2xl transition cursor-pointer"
            >
              View Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
