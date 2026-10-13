import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const { addToCart, updateQuantity, getCartQuantityById } = useAppContext();

  const [product, setProduct] = useState(null);
  const [thumbnail, setThumbnail] = useState("");
  const [count, setCount] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // const res = await axios.get(
        //   `${import.meta.env.VITE_BACKEND_URL}/api/products/${productId}`
        // );
        const res = await axios.get(
          `https://hitman-grocery-backend.onrender.com/api/products/${productId}`
        );
        const data = res.data;
        setProduct(data);
        setThumbnail(data.image[0]);
        setCount(getCartQuantityById(data._id) || 1);
      } catch (err) {
        console.error("Product not found:", err);
        navigate("/404");
      }
    };

    fetchProduct();
  }, [productId, navigate, getCartQuantityById]);

  const handleAddToCart = () => {
    if (!product.inStock) {
      toast.error("Product is out of stock");
      return;
    }

    const currentQty = getCartQuantityById(product._id);

    if (currentQty === 0) {
      addToCart(product._id);
      if (count > 1) updateQuantity(product._id, count);
    } else {
      updateQuantity(product._id, count);
    }

    toast.success(`${count} ${product.name} added to cart`);
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

  if (!product) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="max-w-6xl w-full px-6 mx-auto mb-8 pt-20">
      <p className="py-4">
        <span
          className="cursor-pointer hover:text-primary-dull"
          onClick={() => navigate("/")}
        >
          Home
        </span>{" "}
        /{" "}
        <span
          className="cursor-pointer hover:text-primary-dull"
          onClick={() => navigate("/products")}
        >
          Products
        </span>{" "}
        /{" "}
        <span
          className="cursor-pointer hover:text-primary"
          onClick={() =>
            navigate(`/products/${product.category.toLowerCase()}`)
          }
        >
          {product.category}
        </span>{" "}
        / <span className="text-primary">{product.name}</span>
      </p>

      <div className="flex flex-col md:flex-row gap-16 mt-4">
        <div className="flex gap-3">
          <div className="flex flex-col gap-3">
            {product.image.map((img, index) => (
              <div
                key={index}
                onClick={() => setThumbnail(img)}
                className={`border max-w-24 rounded overflow-hidden cursor-pointer transition-all ${
                  thumbnail === img
                    ? " ring-2 ring-green-200"
                    : "border-gray-300"
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-auto"
                />
              </div>
            ))}
          </div>
          <div className="border border-gray-300 rounded-lg overflow-hidden max-w-[500px]">
            <img
              src={thumbnail}
              alt={product.name}
              className="w-full h-auto object-contain max-h-[500px]"
            />
          </div>
        </div>

        <div className="text-sm w-full md:w-1/2">
          <h1 className="text-3xl font-medium">{product.name}</h1>

          {product.rating && (
            <div className="flex items-center gap-0.5 mt-1">
              {Array(5)
                .fill("")
                .map((_, i) =>
                  i < product.rating ? (
                    <img src={assets.star_icon} alt="star" key={i} />
                  ) : (
                    <img src={assets.star_dull_icon} alt="star" key={i} />
                  )
                )}
              <p className="text-base ml-2">({product.rating})</p>
            </div>
          )}

          <div className="mt-6">
            <p className="text-gray-500/70 line-through">
              MRP: ₹{product.price}
            </p>
            <p className="text-2xl font-medium">₹{product.offerPrice}</p>
            <span className="text-gray-500/70">(inclusive of all taxes)</span>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <p className="text-base font-medium">Quantity:</p>
            <div className="flex items-center border border-gray-300 rounded-md">
              <button
                onClick={() => setCount((prev) => Math.max(1, prev - 1))}
                className="px-3 py-1 text-lg hover:bg-gray-100"
              >
                -
              </button>
              <span className="px-4 py-1 border-x border-gray-300">
                {count}
              </span>
              <button
                onClick={() => setCount((prev) => prev + 1)}
                className="px-3 py-1 text-lg hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>

          <p className="text-base font-medium mt-6">About Product</p>
          <ul className="list-disc ml-5 text-gray-500/80 text-sm space-y-1 mt-2">
            {getDescriptionPoints(product.description).map((desc, i) => (
              <li key={i}>{desc}</li>
            ))}
          </ul>

          <div className="flex mt-10 gap-4 text-base">
            {product.inStock ? (
              <button
                onClick={handleAddToCart}
                className="w-full py-3.5 cursor-pointer font-medium bg-primary hover:bg-primary-dull transition text-white rounded-sm"
              >
                Add to Cart
              </button>
            ) : (
              <div className="w-full py-3.5 text-center font-medium bg-gray-300 text-gray-600 rounded-sm cursor-not-allowed">
                Out of Stock
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
