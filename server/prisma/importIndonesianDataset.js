import fs from "fs";
import readline from "readline";
import path from "path";
import { fileURLToPath } from "url";
import prisma from "../config/prisma.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dataset location
const DATASET_PATH = path.resolve(
  __dirname,
  "../../Comprehensive Dataset of Indonesian Wholesale Groc/JSON Version/products_detail.jsonl"
);

// Map dataset categories to FreshCart core categories
const CATEGORY_MAP = {
  Vegetables: "Vegetables",
  Fruits: "Fruits",
  Drinks: "Drinks",
  "Milk/Coffe/Tea": "Drinks",
  "Dairy & Frozen": "Dairy",
  Bakery: "Bakery",
  "Bulk Product": "Grains",
  "Biscuit/Snacks": "Snacks",
  "Sauces&Spices": "Instant",
  Fish: "Instant",
  Meat: "Instant",
};

// High quality category & keyword based image pools
const IMAGE_POOLS = {
  Vegetables: [
    "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=60", // Potato
    "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=60", // Tomato
    "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop&q=60", // Carrot
    "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&auto=format&fit=crop&q=60", // Onion
    "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=60", // Spinach
    "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=500&auto=format&fit=crop&q=60", // Bell pepper
    "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60", // Fresh salad
  ],
  Fruits: [
    "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=60", // Apple
    "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=60", // Banana
    "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=500&auto=format&fit=crop&q=60", // Orange
    "https://images.unsplash.com/photo-1589984662646-e7b2e495949c?w=500&auto=format&fit=crop&q=60", // Melon
    "https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&auto=format&fit=crop&q=60", // Mango
    "https://images.unsplash.com/photo-1596363505729-4190a9506133?w=500&auto=format&fit=crop&q=60", // Grape
    "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&auto=format&fit=crop&q=60", // Strawberry
  ],
  Drinks: [
    "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=60", // Drinks assortment
    "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=500&auto=format&fit=crop&q=60", // Coffee / Latte
    "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=60", // Tea / Green tea
    "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60", // Soda can
    "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&auto=format&fit=crop&q=60", // Orange juice
    "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=500&auto=format&fit=crop&q=60", // Mineral water
  ],
  Dairy: [
    "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=60", // Fresh milk
    "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&auto=format&fit=crop&q=60", // Cheese block
    "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=60", // Yogurt
    "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&auto=format&fit=crop&q=60", // Butter
    "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500&auto=format&fit=crop&q=60", // Eggs
  ],
  Bakery: [
    "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60", // Artisan bread
    "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=60", // Croissants
    "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&auto=format&fit=crop&q=60", // Burger buns
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60", // Cake / pastry
  ],
  Grains: [
    "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60", // Rice
    "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=60", // Wheat / Flour
    "https://images.unsplash.com/photo-1621996346565-e3d5d6281781?w=500&auto=format&fit=crop&q=60", // Egg noodles
    "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=500&auto=format&fit=crop&q=60", // Beans / Grains
    "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=60", // Cooking oil
    "https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=500&auto=format&fit=crop&q=60", // Sugar
  ],
  Snacks: [
    "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=60", // Potato chips
    "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500&auto=format&fit=crop&q=60", // Cookies
    "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500&auto=format&fit=crop&q=60", // Chocolate
    "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500&auto=format&fit=crop&q=60", // Almonds / Nuts
    "https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=500&auto=format&fit=crop&q=60", // Jelly / Candy
  ],
  Instant: [
    "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&auto=format&fit=crop&q=60", // Ramen / Noodles
    "https://images.unsplash.com/photo-1589135233689-d65287d3a033?w=500&auto=format&fit=crop&q=60", // Sauces
    "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=60", // Spices
    "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=500&auto=format&fit=crop&q=60", // Canned corn / sausage
  ],
};

// Select image based on product keywords and category
function getProductImage(name, category, index) {
  const n = (name || "").toLowerCase();
  const pool = IMAGE_POOLS[category] || IMAGE_POOLS["Snacks"];

  // Specific keyword matching
  if (n.includes("potato") || n.includes("kentang")) return pool[0];
  if (n.includes("tomato") || n.includes("tomat")) return pool[1] || pool[0];
  if (n.includes("carrot") || n.includes("wortel")) return pool[2] || pool[0];
  if (n.includes("onion") || n.includes("bawang")) return pool[3] || pool[0];
  if (n.includes("spinach") || n.includes("bayam")) return pool[4] || pool[0];

  if (n.includes("apple") || n.includes("apel")) return pool[0];
  if (n.includes("banana") || n.includes("pisang")) return pool[1] || pool[0];
  if (n.includes("orange") || n.includes("jeruk")) return pool[2] || pool[0];
  if (n.includes("melon") || n.includes("semangka")) return pool[3] || pool[0];
  if (n.includes("mango") || n.includes("mangga")) return pool[4] || pool[0];

  if (n.includes("milk") || n.includes("susu")) return pool[0];
  if (n.includes("coffee") || n.includes("kopi")) return pool[1] || pool[0];
  if (n.includes("tea") || n.includes("teh")) return pool[2] || pool[0];
  if (n.includes("soda") || n.includes("cola")) return pool[3] || pool[0];
  if (n.includes("juice") || n.includes("jus")) return pool[4] || pool[0];
  if (n.includes("water") || n.includes("air")) return pool[5] || pool[0];

  if (n.includes("cheese") || n.includes("keju")) return pool[1] || pool[0];
  if (n.includes("yogurt")) return pool[2] || pool[0];
  if (n.includes("butter") || n.includes("mentega")) return pool[3] || pool[0];
  if (n.includes("egg") || n.includes("telur")) return pool[4] || pool[0];

  if (n.includes("bread") || n.includes("roti")) return pool[0];
  if (n.includes("croissant")) return pool[1] || pool[0];
  if (n.includes("burger") || n.includes("bun")) return pool[2] || pool[0];
  if (n.includes("cake") || n.includes("kue")) return pool[3] || pool[0];

  if (n.includes("rice") || n.includes("beras")) return pool[0];
  if (n.includes("flour") || n.includes("tepung")) return pool[1] || pool[0];
  if (n.includes("noodle") || n.includes("mie")) return pool[2] || pool[0];
  if (n.includes("oil") || n.includes("minyak")) return pool[4] || pool[0];

  if (n.includes("chip") || n.includes("keripik") || n.includes("chitato")) return pool[0];
  if (n.includes("biscuit") || n.includes("biskuit") || n.includes("cookie")) return pool[1] || pool[0];
  if (n.includes("chocolate") || n.includes("cokelat") || n.includes("choco")) return pool[2] || pool[0];
  if (n.includes("almond") || n.includes("kacang") || n.includes("nut")) return pool[3] || pool[0];
  if (n.includes("candy") || n.includes("permen") || n.includes("jelly")) return pool[4] || pool[0];

  // Fallback round-robin from category pool
  return pool[index % pool.length];
}

// Check stock status
function getInStock(str) {
  if (!str) return true;
  const match = str.match(/(\d+)\s*Items?/i);
  if (match) {
    const qty = parseInt(match[1], 10);
    return qty > 0;
  }
  return !/out of stock|habis|kosong/i.test(str);
}

async function main() {
  console.log("📦 Starting Indonesian Wholesale Grocery Dataset import...");

  if (!fs.existsSync(DATASET_PATH)) {
    console.error(`❌ Dataset file not found at: ${DATASET_PATH}`);
    process.exit(1);
  }

  const rl = readline.createInterface({
    input: fs.createReadStream(DATASET_PATH),
    crlfDelay: Infinity,
  });

  const productsToInsert = [];
  const categoryStats = {};
  let totalLines = 0;
  let skipped = 0;

  for await (const line of rl) {
    if (!line.trim()) continue;
    totalLines++;

    try {
      const item = JSON.parse(line);
      const rawCategory = item.store_info?.item_category || "";
      const mappedCategory = CATEGORY_MAP[rawCategory];

      // Only import food & grocery categories
      if (!mappedCategory) {
        skipped++;
        continue;
      }

      // Parse price (convert IDR to reasonable INR / units)
      const digits = (item.price || "").replace(/[^\d]/g, "");
      const numVal = parseInt(digits, 10) || 5000;
      const price = Math.max(15, Math.round(numVal / 100));
      const offerPrice = Math.max(10, Math.round(price * 0.85));

      // Clean description
      let descPoints = (item.description || "")
        .split("\n")
        .map((l) => l.replace(/^[•\-\* \t\?]+/, "").trim())
        .filter((l) => l.length > 5 && !l.toLowerCase().includes("pesan sekarang"));

      if (descPoints.length === 0) {
        descPoints = [
          `Fresh and authentic ${item.product_name}`,
          `Category: ${mappedCategory}`,
          "Wholesale grocery standard, sealed for freshness and guaranteed quality.",
        ];
      }

      const inStock = getInStock(item.store_info?.stock_availability);
      const image = [
        getProductImage(item.product_name, mappedCategory, productsToInsert.length),
      ];

      productsToInsert.push({
        name: item.product_name,
        category: mappedCategory,
        price,
        offerPrice,
        description: descPoints.slice(0, 5),
        image,
        inStock,
      });

      categoryStats[mappedCategory] = (categoryStats[mappedCategory] || 0) + 1;
    } catch (parseErr) {
      console.warn("Skipping malformed line:", parseErr.message);
    }
  }

  console.log(`🔍 Processed ${totalLines} raw entries. Found ${productsToInsert.length} grocery items.`);
  console.log("📊 Category Breakdown:", categoryStats);

  // Batch insert into database
  console.log(`💾 Inserting ${productsToInsert.length} products into PostgreSQL...`);
  const BATCH_SIZE = 500;
  let inserted = 0;

  for (let i = 0; i < productsToInsert.length; i += BATCH_SIZE) {
    const batch = productsToInsert.slice(i, i + BATCH_SIZE);
    await prisma.product.createMany({
      data: batch,
    });
    inserted += batch.length;
    console.log(`  Progress: ${inserted} / ${productsToInsert.length} products inserted...`);
  }

  const finalCount = await prisma.product.count();
  console.log(`\n🎉 Import Complete! Total products in database: ${finalCount}`);
}

main()
  .catch((err) => {
    console.error("❌ Import failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

