import React, { useEffect, useState, useRef } from "react";
import { FiEdit } from "react-icons/fi";
import { sellerAxios } from "../../utils/axiosInstance";
import toast from "react-hot-toast";

const ManageStock = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await sellerAxios.get("/seller/products");
        setProducts(res.data);
      } catch (err) {
        toast.error("Failed to fetch products");
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="flex-1 pb-10 flex flex-col justify-between">
      <div className="w-full md:p-10 p-4">
        <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-primary-dull">
          Manage Stock
        </h2>

        <div className="overflow-x-auto rounded-md border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-900 bg-gray-100 text-sm">
              <tr>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  Product
                </th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">
                  Category
                </th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">
                  Offer Price
                </th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  Stock Qty
                </th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell whitespace-nowrap">
                  Low Threshold
                </th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  In Stock
                </th>
              </tr>
            </thead>

            <tbody className="text-gray-700 bg-white">
              {Array.isArray(products) &&
                products.map((product) => (
                  <ProductRow key={product.id || product._id} product={product} />
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ProductRow = ({ product }) => {
  const productId = product.id || product._id;
  const [isEditing, setIsEditing] = useState(false);
  const [price, setPrice] = useState(product.offerPrice);
  const [stockQuantity, setStockQuantity] = useState(product.stockQuantity ?? 0);
  const [lowStockThreshold, setLowStockThreshold] = useState(
    product.lowStockThreshold ?? 10
  );
  const [inStock, setInStock] = useState(product.inStock);

  const inputRef = useRef(null);
  const rowRef = useRef(null);

  const updateProduct = async () => {
    try {
      const parsedQty = Math.max(0, Number(stockQuantity));
      const parsedThreshold = Math.max(0, Number(lowStockThreshold));
      await sellerAxios.put(`/seller/update/${productId}`, {
        offerPrice: Number(price),
        stockQuantity: parsedQty,
        lowStockThreshold: parsedThreshold,
        inStock: parsedQty > 0 ? inStock : false,
      });
      setInStock(parsedQty > 0 ? inStock : false);
      toast.success(`Updated "${product.name}"`);
    } catch {
      toast.error("Update failed");
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (rowRef.current && !rowRef.current.contains(e.target)) {
        if (isEditing) updateProduct();
        setIsEditing(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditing]);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const handleEditClick = () => {
    if (!isEditing) setIsEditing(true);
    else {
      updateProduct();
      setIsEditing(false);
    }
  };

  const handleToggleStock = async () => {
    const newVal = !inStock;
    setInStock(newVal);
    try {
      await sellerAxios.put(`/seller/update/${productId}`, {
        offerPrice: Number(price),
        stockQuantity: Number(stockQuantity),
        inStock: newVal,
      });
      toast.success(`Stock updated for "${product.name}"`);
    } catch {
      toast.error("Failed to update stock");
    }
  };

  return (
    <tr
      ref={rowRef}
      className="border-t border-gray-200 hover:bg-gray-50 transition"
    >
      <td className="px-4 py-3 min-w-[220px]">
        <div className="flex items-center gap-3">
          <img
            src={product.image?.[0]}
            alt={product.name}
            className="w-12 h-12 sm:w-14 sm:h-14 object-contain border rounded"
          />
          <div>
            <p className="font-medium text-sm sm:text-base">{product.name}</p>
            <div className="flex items-center gap-2 mt-1 sm:hidden">
              <input
                type="number"
                ref={inputRef}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={`w-24 px-2 py-1 rounded border font-medium text-gray-800 text-sm ${
                  isEditing
                    ? "border-blue-400 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                    : "border-gray-300 bg-gray-100 cursor-default"
                }`}
              />
              <button
                onClick={handleEditClick}
                className="text-gray-500 hover:text-blue-600"
              >
                <FiEdit size={14} />
              </button>
            </div>
          </div>
        </div>
      </td>

      <td className="px-4 py-3 hidden sm:table-cell">{product.category}</td>

      <td className="px-4 py-3 hidden md:table-cell">
        <div className="flex items-center gap-2">
          <input
            type="number"
            ref={inputRef}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={`w-20 px-2 py-1 rounded border font-medium text-gray-800 ${
              isEditing
                ? "border-blue-400 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                : "border-gray-300 bg-gray-100 cursor-default"
            }`}
          />
          <button
            onClick={handleEditClick}
            className="text-gray-500 hover:text-blue-600"
          >
            <FiEdit size={16} />
          </button>
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            value={stockQuantity}
            onChange={(e) => setStockQuantity(e.target.value)}
            onBlur={updateProduct}
            className="w-20 px-2 py-1 rounded border border-gray-300 bg-white font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          {Number(stockQuantity) === 0 ? (
            <span className="text-[11px] font-semibold text-red-600">Out</span>
          ) : Number(stockQuantity) <= Number(lowStockThreshold) ? (
            <span className="text-[11px] font-semibold text-amber-600">Low</span>
          ) : null}
        </div>
      </td>

      <td className="px-4 py-3 hidden lg:table-cell">
        <input
          type="number"
          min="0"
          value={lowStockThreshold}
          onChange={(e) => setLowStockThreshold(e.target.value)}
          onBlur={updateProduct}
          className="w-20 px-2 py-1 rounded border border-gray-300 bg-white font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </td>

      <td className="px-4 py-3">
        <label className="relative inline-flex items-center cursor-pointer gap-3">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={inStock}
            onChange={handleToggleStock}
          />
          <div className="w-12 h-7 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-colors duration-200" />
          <span className="dot absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5" />
        </label>
      </td>
    </tr>
  );
};

export default ManageStock;
