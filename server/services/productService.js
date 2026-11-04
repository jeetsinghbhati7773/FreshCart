import prisma from "../config/prisma.js";

/**
 * Retrieve products with rich filtering, search, sorting, and pagination
 * @param {object} filters
 * @returns {Promise<{products: Array, total: number, page: number, limit: number, totalPages: number}>}
 */
export async function getAllProducts(filters = {}) {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    brand,
    inStockOnly,
    sortBy = "newest",
    page = 1,
    limit,
    includeInactive = false,
  } = filters;

  const where = {};

  // Active status
  if (!includeInactive) {
    where.isActive = true;
  }

  // Category filter (case-insensitive in PostgreSQL)
  if (category && category !== "all") {
    where.category = {
      equals: category,
      mode: "insensitive",
    };
  }

  // Brand filter
  if (brand && brand !== "all") {
    where.brand = {
      equals: brand,
      mode: "insensitive",
    };
  }

  // Stock availability
  if (inStockOnly === true || inStockOnly === "true") {
    where.inStock = true;
    where.stockQuantity = { gt: 0 };
  }

  // Price range
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.offerPrice = {};
    if (minPrice !== undefined && !isNaN(Number(minPrice))) {
      where.offerPrice.gte = Number(minPrice);
    }
    if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
      where.offerPrice.lte = Number(maxPrice);
    }
  }

  // Full-text search on name and description
  if (search && search.trim()) {
    const term = search.trim();
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { category: { contains: term, mode: "insensitive" } },
      { brand: { contains: term, mode: "insensitive" } },
      { description: { hasSome: [term] } },
    ];
  }

  // Sorting
  let orderBy = { createdAt: "desc" };
  switch (sortBy) {
    case "price-asc":
      orderBy = { offerPrice: "asc" };
      break;
    case "price-desc":
      orderBy = { offerPrice: "desc" };
      break;
    case "name-asc":
      orderBy = { name: "asc" };
      break;
    case "name-desc":
      orderBy = { name: "desc" };
      break;
    case "oldest":
      orderBy = { createdAt: "asc" };
      break;
    case "newest":
    default:
      orderBy = { createdAt: "desc" };
      break;
  }

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = limit ? Math.max(1, parseInt(limit, 10)) : undefined;
  const skip = parsedLimit ? (parsedPage - 1) * parsedLimit : undefined;

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: parsedLimit,
    }),
  ]);

  const totalPages = parsedLimit ? Math.ceil(total / parsedLimit) : 1;

  return {
    products,
    total,
    page: parsedPage,
    limit: parsedLimit || total,
    totalPages,
  };
}

/**
 * Retrieve single product by ID
 * @param {string} id
 */
export async function getProductById(id) {
  return prisma.product.findUnique({
    where: { id },
  });
}

/**
 * Search products helper
 * @param {string} query
 * @param {number} [limit=20]
 */
export async function searchProducts(query, limit = 20) {
  return getAllProducts({ search: query, limit });
}

/**
 * Get products by category
 * @param {string} category
 * @param {object} [filters={}]
 */
export async function getProductsByCategory(category, filters = {}) {
  return getAllProducts({ ...filters, category });
}

/**
 * Check if a product is available in the desired quantity
 * @param {string} id
 * @param {number} [quantity=1]
 */
export async function checkProductAvailability(id, quantity = 1) {
  const product = await getProductById(id);
  if (!product || !product.isActive) {
    return { available: false, reason: "Product does not exist or is inactive" };
  }
  if (!product.inStock || product.stockQuantity < quantity) {
    return {
      available: false,
      reason: product.stockQuantity === 0 ? "Out of stock" : `Only ${product.stockQuantity} items in stock`,
      stockQuantity: product.stockQuantity,
    };
  }
  return { available: true, product };
}

/**
 * Retrieve distinct categories with counts and representative images
 */
export async function getCategories() {
  const grouped = await prisma.product.groupBy({
    by: ["category"],
    where: { isActive: true },
    _count: { id: true },
  });

  const categoryDetails = await Promise.all(
    grouped.map(async (g) => {
      const sample = await prisma.product.findFirst({
        where: { category: g.category, isActive: true },
        select: { image: true },
      });
      return {
        id: g.category.toLowerCase(),
        name: g.category,
        count: g._count.id,
        imageUrl: sample?.image?.[0] || "",
      };
    })
  );

  return categoryDetails.sort((a, b) => b.count - a.count);
}

/**
 * Create a new product (seller/admin)
 */
export async function createProduct(data) {
  const {
    name,
    description = [],
    category,
    price,
    offerPrice,
    image = [],
    brand,
    unit,
    stockQuantity = 50,
  } = data;

  const parsedDesc = Array.isArray(description) ? description : [description].filter(Boolean);
  const parsedImgs = Array.isArray(image) ? image : [image].filter(Boolean);

  return prisma.product.create({
    data: {
      name,
      description: parsedDesc,
      category,
      price: parseFloat(price),
      offerPrice: parseFloat(offerPrice),
      image: parsedImgs,
      brand: brand || null,
      unit: unit || null,
      stockQuantity: parseInt(stockQuantity, 10) || 50,
      inStock: (parseInt(stockQuantity, 10) || 50) > 0,
      isActive: true,
    },
  });
}

/**
 * Update an existing product
 */
export async function updateProduct(id, data) {
  const updateData = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) {
    updateData.description = Array.isArray(data.description)
      ? data.description
      : [data.description].filter(Boolean);
  }
  if (data.category !== undefined) updateData.category = data.category;
  if (data.price !== undefined) updateData.price = parseFloat(data.price);
  if (data.offerPrice !== undefined) updateData.offerPrice = parseFloat(data.offerPrice);
  if (data.brand !== undefined) updateData.brand = data.brand;
  if (data.unit !== undefined) updateData.unit = data.unit;
  if (data.stockQuantity !== undefined) {
    updateData.stockQuantity = Math.max(0, parseInt(data.stockQuantity, 10));
    updateData.inStock = updateData.stockQuantity > 0;
  }
  if (data.inStock !== undefined) updateData.inStock = Boolean(data.inStock);
  if (data.isActive !== undefined) updateData.isActive = Boolean(data.isActive);
  if (data.image !== undefined) {
    updateData.image = Array.isArray(data.image) ? data.image : [data.image].filter(Boolean);
  }

  return prisma.product.update({
    where: { id },
    data: updateData,
  });
}

/**
 * Soft delete or hard delete product
 */
export async function deleteProduct(id, soft = true) {
  if (soft) {
    return prisma.product.update({
      where: { id },
      data: { isActive: false, inStock: false },
    });
  }
  return prisma.product.delete({
    where: { id },
  });
}

