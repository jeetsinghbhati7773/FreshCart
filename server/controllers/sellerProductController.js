import * as productService from "../services/productService.js";
import prisma from "../config/prisma.js";
import cloudinary from "../utils/cloudinary.js";

// Add product with images
export const addProductWithImages = async (req, res) => {
  try {
    const { name, description, category, price, offerPrice, brand, unit, stockQuantity } = req.body;
    const imageFiles = req.files;

    if (!imageFiles || imageFiles.length === 0) {
      return res.status(400).json({ error: "Please upload at least one image" });
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

    const parsedDescription = Array.isArray(description)
      ? description
      : [description].filter(Boolean);

    const newProduct = await productService.createProduct({
      name,
      description: parsedDescription,
      category,
      price: parseFloat(price),
      offerPrice: parseFloat(offerPrice),
      image: imageUrls,
      brand,
      unit,
      stockQuantity,
    });

    res.status(201).json({ message: "Product created", product: newProduct });
  } catch (error) {
    console.error("Seller add product error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all products (for seller dashboard)
export const getAllProductsForSeller = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// Update product (offerPrice & inStock & stockQuantity)
export const updateProductDetails = async (req, res) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to update product" });
  }
};
