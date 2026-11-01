import prisma from "../config/prisma.js";
import cloudinary from "../utils/cloudinary.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
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
    // Group order items by productId and sum quantity
    const topOrdered = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 10,
    });

    const productIds = topOrdered.map((item) => item.productId);

    // Get in-stock products from top ordered list
    let products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        inStock: true,
      },
    });

    // If fewer than 4 in-stock products, fill with other in-stock products
    if (products.length < 4) {
      const existingIds = products.map((p) => p.id);
      const additionalProducts = await prisma.product.findMany({
        where: {
          inStock: true,
          id: { notIn: existingIds },
        },
        take: 4 - products.length,
      });

      products = [...products, ...additionalProducts];
    }

    // Sort to match top order rankings if available
    const sortedProducts = productIds
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean);

    // Append any extra products needed to reach 4
    for (const p of products) {
      if (!sortedProducts.some((sp) => sp.id === p.id)) {
        sortedProducts.push(p);
      }
    }

    res.json(sortedProducts.slice(0, 4));
  } catch (err) {
    console.error("Error fetching best sellers:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    });
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

    const parsedDescription = Array.isArray(description)
      ? description
      : [description].filter(Boolean);

    const newProduct = await prisma.product.create({
      data: {
        name,
        description: parsedDescription,
        category,
        price: parseFloat(price),
        offerPrice: parseFloat(offerPrice),
        image: imageUrls,
      },
    });

    res.status(201).json({ message: "Product created", product: newProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: req.params.id },
    });
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
    const updateData = {};
    if (offerPrice !== undefined) updateData.offerPrice = parseFloat(offerPrice);
    if (inStock !== undefined) updateData.inStock = inStock;

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: updateData,
    });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to update product" });
  }
};

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
