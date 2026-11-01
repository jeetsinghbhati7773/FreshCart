import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sampleProducts = [
  // Vegetables
  {
    name: "Fresh Potato 1kg",
    category: "Vegetables",
    price: 35,
    offerPrice: 28,
    image: [
      "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Fresh farm-harvested potatoes",
      "Rich in potassium and carbohydrates",
      "Perfect for curries, baking, and fries",
    ],
    inStock: true,
  },
  {
    name: "Fresh Hybrid Tomato 1kg",
    category: "Vegetables",
    price: 45,
    offerPrice: 34,
    image: [
      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Plump, ripe red tomatoes",
      "Rich in antioxidant Lycopene & Vitamin C",
      "Essential for curries, salads, and purées",
    ],
    inStock: true,
  },
  {
    name: "Fresh Orange Carrot 500g",
    category: "Vegetables",
    price: 32,
    offerPrice: 26,
    image: [
      "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Crisp, sweet organic carrots",
      "Loaded with Beta-Carotene & Vitamin A",
      "Great for raw snacking, salads, or cooking",
    ],
    inStock: true,
  },
  {
    name: "Red Onion 1kg",
    category: "Vegetables",
    price: 38,
    offerPrice: 30,
    image: [
      "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Crispy, aromatic medium-sized red onions",
      "A must-have staple for everyday cooking",
    ],
    inStock: true,
  },
  {
    name: "Organic Baby Spinach 250g",
    category: "Vegetables",
    price: 25,
    offerPrice: 20,
    image: [
      "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Tender, pesticide-free fresh spinach leaves",
      "Rich source of iron, folic acid, and calcium",
    ],
    inStock: true,
  },

  // Fruits
  {
    name: "Royal Gala Apple 1kg",
    category: "Fruits",
    price: 160,
    offerPrice: 139,
    image: [
      "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Sweet, crunchy, and freshly picked",
      "Packed with dietary fiber and Vitamin C",
    ],
    inStock: true,
  },
  {
    name: "Robusta Banana 1 Dozen",
    category: "Fruits",
    price: 60,
    offerPrice: 48,
    image: [
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Naturally ripened sweet bananas",
      "High in potassium and quick daily energy",
    ],
    inStock: true,
  },
  {
    name: "Nagpur Oranges 1kg",
    category: "Fruits",
    price: 90,
    offerPrice: 75,
    image: [
      "https://images.unsplash.com/photo-1547514701-42782101795e?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Juicy and pulpy fresh citrus oranges",
      "Rich natural source of Vitamin C",
    ],
    inStock: true,
  },
  {
    name: "Fresh Seedless Green Grapes 500g",
    category: "Fruits",
    price: 80,
    offerPrice: 65,
    image: [
      "https://images.unsplash.com/photo-1596363505729-4190a9506133?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Crisp, sweet seedless green grapes",
      "Perfect healthy bite-sized snack",
    ],
    inStock: true,
  },

  // Dairy Products
  {
    name: "Amul Taaza Toned Milk 1L",
    category: "Dairy",
    price: 64,
    offerPrice: 56,
    image: [
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Pasteurized homogenized toned milk",
      "Rich in calcium and natural proteins",
    ],
    inStock: true,
  },
  {
    name: "Fresh Malai Paneer 200g",
    category: "Dairy",
    price: 95,
    offerPrice: 82,
    image: [
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Super soft and fresh cottage cheese",
      "High protein content for a healthy diet",
    ],
    inStock: true,
  },
  {
    name: "Farm Fresh Brown Eggs (6 Pcs)",
    category: "Dairy",
    price: 55,
    offerPrice: 48,
    image: [
      "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Clean, protein-rich fresh poultry eggs",
      "Graded and checked for maximum quality",
    ],
    inStock: true,
  },

  // Cold Drinks
  {
    name: "Coca-Cola Original 300ml Can",
    category: "Drinks",
    price: 40,
    offerPrice: 35,
    image: [
      "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Refreshing carbonated soft drink",
      "Best enjoyed ice cold",
    ],
    inStock: true,
  },
  {
    name: "Sprite Lemon-Lime 500ml Bottle",
    category: "Drinks",
    price: 45,
    offerPrice: 38,
    image: [
      "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Clear, crisp, and thirst-quenching lime soda",
    ],
    inStock: true,
  },

  // Instant Food
  {
    name: "Maggi 2-Minute Masala Noodles 280g",
    category: "Instant",
    price: 55,
    offerPrice: 49,
    image: [
      "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "India's favorite instant noodles",
      "Quick 2-minute snack with iconic tastemaker spices",
    ],
    inStock: true,
  },
  {
    name: "Knorr Mixed Vegetable Soup 43g",
    category: "Instant",
    price: 40,
    offerPrice: 32,
    image: [
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Hearty, warming vegetable soup in minutes",
      "100% real vegetables and zero preservatives",
    ],
    inStock: true,
  },

  // Bakery & Breads
  {
    name: "Whole Wheat Brown Bread 400g",
    category: "Bakery",
    price: 45,
    offerPrice: 40,
    image: [
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Freshly baked high-fiber brown bread",
      "Ideal for morning toasts and healthy sandwiches",
    ],
    inStock: true,
  },
  {
    name: "Butter Croissants (Pack of 2)",
    category: "Bakery",
    price: 110,
    offerPrice: 90,
    image: [
      "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Flaky, golden, all-butter French-style croissants",
    ],
    inStock: true,
  },

  // Grains & Cereals
  {
    name: "Daawat Rozana Basmati Rice 5kg",
    category: "Grains",
    price: 450,
    offerPrice: 389,
    image: [
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Aromatic long-grain basmati rice",
      "Ideal for everyday cooking, biryani, and pulao",
    ],
    inStock: true,
  },
  {
    name: "Aashirvaad Shudh Chakki Atta 5kg",
    category: "Grains",
    price: 240,
    offerPrice: 215,
    image: [
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "100% pure whole wheat flour",
      "Produces fluffy, soft rotis that stay fresh",
    ],
    inStock: true,
  },

  // Snacks
  {
    name: "Classic Salted Crispy Potato Wafers 100g",
    category: "Snacks",
    price: 30,
    offerPrice: 25,
    image: [
      "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Golden fried crispy chips seasoned with sea salt",
      "Classic crunchy party snack",
    ],
    inStock: true,
  },
  {
    name: "California Roasted & Salted Almonds 200g",
    category: "Snacks",
    price: 260,
    offerPrice: 219,
    image: [
      "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Premium crunchy roasted almonds",
      "Heart-healthy snack loaded with Vitamin E & protein",
    ],
    inStock: true,
  },
];

async function main() {
  console.log("🌱 Seeding database with products...");

  // Clear existing products to avoid duplicates
  await prisma.orderItem.deleteMany();
  await prisma.product.deleteMany();

  for (const product of sampleProducts) {
    await prisma.product.create({
      data: product,
    });
  }

  const count = await prisma.product.count();
  console.log(`✅ Successfully seeded ${count} products into PostgreSQL!`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
