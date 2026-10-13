import Product from "../models/Product.js";
import cloudinary from "../utils/cloudinary.js";

// Add product with images
export const addProductWithImages = async (req, res) => {
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

// Get all products (for seller dashboard)
export const getAllProductsForSeller = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// Update product (offerPrice & inStock)
export const updateProductDetails = async (req, res) => {
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
