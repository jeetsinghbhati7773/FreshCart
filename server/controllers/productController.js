import Product from "../models/Product.js";
import Order from "../models/orders.js";
import mongoose from "mongoose";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    console.log(products);
    res.status(200).json({ products });
  } catch (err) {
    console.error("Error fetching products:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch products", error: err.message });
  }
};

export const getBestSellers = async (req, res) => {
  try {
    const topOrdered = await Order.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.product",
          totalOrdered: { $sum: "$products.quantity" },
        },
      },
      { $sort: { totalOrdered: -1 } },
      { $limit: 10 }, // Get more in case some are out of stock
    ]);

    let productIds = topOrdered.map((item) => item._id);

    // Get only in-stock products from the top ordered list
    let products = await Product.find({
      _id: { $in: productIds },
      inStock: true,
    });

    // If fewer than 4 in-stock products, fill with fallback in-stock ones
    if (products.length < 4) {
      const fallbackIds = [
        "686597adb02253cf3ee45b19",
        "6868df5143f2a0c3271d017e",
        "686a2eeaf67f5611975d5b76",
        "686a2f2af67f5611975d5b78",
      ];

      const needed = 4 - products.length;

      const additionalProducts = await Product.find({
        _id: { $in: fallbackIds },
        inStock: true,
        _id: { $nin: products.map((p) => p._id) },
      }).limit(needed);

      products = [...products, ...additionalProducts];
    }

    // Sort products to match original top order
    const sortedProducts = productIds
      .map((id) => products.find((p) => p._id.toString() === id.toString()))
      .filter(Boolean); // remove any undefined if some IDs were filtered out

    res.json(sortedProducts.slice(0, 4)); // Ensure only top 4
  } catch (err) {
    console.error("Error fetching best sellers:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, category, price, offerPrice } = req.body;
    const imageFiles = req.files;

    if (!imageFiles || imageFiles.length === 0) {
      return res
        .status(400)
        .json({ error: "Please upload at least one image" });
    }

    const uploadPromises = imageFiles.map(
      (file) =>
        new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ folder: "products" }, (error, result) => {
              if (error) return reject(error);
              resolve(result.secure_url);
            })
            .end(file.buffer);
        })
    );

    const imageUrls = await Promise.all(uploadPromises);

    const newProduct = new Product({
      name,
      description,
      category,
      price,
      offerPrice,
      image: imageUrls,
    });

    await newProduct.save();

    res.status(201).json({ message: "Product created", product: newProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete product", error: err.message });
  }
};

export const updateProduct = async (req, res) => {
  const { offerPrice, inStock } = req.body;
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { offerPrice, inStock },
      { new: true }
    );
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to update product" });
  }
};

export const getSellerProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};
