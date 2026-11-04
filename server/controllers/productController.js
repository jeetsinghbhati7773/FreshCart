import * as productService from "../services/productService.js";
import prisma from "../config/prisma.js";
import cloudinary from "../utils/cloudinary.js";

/**
 * GET /api/products
 * Retrieve products with filtering, searching, sorting, and pagination
 */
export const getAllProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      brand,
      inStockOnly,
      sortBy = "newest",
      page,
      limit,
    } = req.query;

    const result = await productService.getAllProducts({
      search,
      category,
      minPrice,
      maxPrice,
      brand,
      inStockOnly,
      sortBy,
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      products: result.products,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: err.message,
    });
  }
};

/**
 * GET /api/products/bestsellers
 */
export const getBestSellers = async (req, res) => {
  try {
    const topOrdered = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: {
        _sum: { quantity: "desc" },
      },
      take: 10,
    });

    const productIds = topOrdered.map((item) => item.productId);

    let products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        inStock: true,
        isActive: true,
      },
    });

    if (products.length < 8) {
      const existingIds = products.map((p) => p.id);
      const additional = await prisma.product.findMany({
        where: {
          inStock: true,
          isActive: true,
          id: { notIn: existingIds },
        },
        take: 8 - products.length,
      });
      products = [...products, ...additional];
    }

    res.json(products.slice(0, 8));
  } catch (err) {
    console.error("Error fetching best sellers:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/products/:id
 */
export const getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
};

/**
 * GET /api/categories
 */
export const getCategories = async (req, res) => {
  try {
    const categories = await productService.getCategories();
    res.status(200).json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * GET /api/categories/:name/products
 */
export const getProductsByCategory = async (req, res) => {
  try {
    const { name } = req.params;
    const { page, limit, sortBy, minPrice, maxPrice } = req.query;

    const result = await productService.getProductsByCategory(name, {
      page,
      limit,
      sortBy,
      minPrice,
      maxPrice,
    });

    res.status(200).json({
      success: true,
      category: name,
      products: result.products,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * POST /api/products/add
 */
export const createProduct = async (req, res) => {
  try {
    const { name, description, category, price, offerPrice, brand, unit, stockQuantity } = req.body;
    const imageFiles = req.files;

    let imageUrls = [];

    if (imageFiles && imageFiles.length > 0) {
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
      imageUrls = await Promise.all(uploadPromises);
    } else if (req.body.image) {
      imageUrls = Array.isArray(req.body.image) ? req.body.image : [req.body.image];
    } else {
      return res.status(400).json({ error: "Please upload or provide at least one image" });
    }

    const newProduct = await productService.createProduct({
      name,
      description,
      category,
      price,
      offerPrice,
      brand,
      unit,
      stockQuantity,
      image: imageUrls,
    });

    res.status(201).json({ success: true, message: "Product created", product: newProduct });
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * PUT /api/products/:id
 */
export const updateProduct = async (req, res) => {
  try {
    const updated = await productService.updateProduct(req.params.id, req.body);
    res.status(200).json({ success: true, message: "Product updated", product: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to update product" });
  }
};

/**
 * DELETE /api/products/:id
 */
export const deleteProduct = async (req, res) => {
  try {
    await productService.deleteProduct(req.params.id, true); // soft delete
    res.status(200).json({ success: true, message: "Product deactivated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete product", error: err.message });
  }
};

/**
 * GET /api/seller/products
 */
export const getSellerProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};
