import prisma from "../config/prisma.js";

export const bakeryList = [
  {
    name: "English Oven Milk Bread 400g",
    category: "Bakery",
    price: 65,
    offerPrice: 55,
    image: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Soft, fluffy sandwich bread made with real milk for a rich flavour",
      "English Oven's most popular everyday bread – fresh and preservative-conscious",
      "Perfect for toast, sandwiches, and French toast",
    ],
    inStock: true,
  },
  {
    name: "The Health Factory Whole Wheat Bread (Zero Maida) 400g",
    category: "Bakery",
    price: 60,
    offerPrice: 52,
    image: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60"],
    description: [
      "100% whole wheat bread with zero maida – high in protein and dietary fibre",
      "Nutritionist-approved healthier bread for weight-conscious eaters",
      "Dense, hearty, wholesome slices ideal for clean eating",
    ],
    inStock: true,
  },
  {
    name: "Modern Sandwich Supreme White Bread 400g",
    category: "Bakery",
    price: 65,
    offerPrice: 55,
    image: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Soft, pillowy white sandwich bread with a classic mild flavour",
      "Even slices perfect for school tiffin, grilled sandwiches, and French toast",
      "Modern Bread – a trusted Indian bread brand for 70+ years",
    ],
    inStock: true,
  },
  {
    name: "Baker's Loaf Zero Preservatives Whole Wheat Bread 400g",
    category: "Bakery",
    price: 85,
    offerPrice: 75,
    image: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Preservative-free whole wheat bread with clean ingredients",
      "No artificial additives – just wholesome wheat goodness",
      "Great for health-conscious households seeking clean label bread",
    ],
    inStock: true,
  },
  {
    name: "English Oven Premium White Bread (No Palm Oil) 400g",
    category: "Bakery",
    price: 55,
    offerPrice: 46,
    image: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Light, airy premium white bread made without palm oil",
      "Soft texture ideal for sandwiches and everyday breakfast",
      "Cleaner ingredient profile than standard bread – popular health-first choice",
    ],
    inStock: true,
  },
  {
    name: "Protein Chef 42g Protein Bread 400g",
    category: "Bakery",
    price: 72,
    offerPrice: 62,
    image: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60"],
    description: [
      "High-protein bread with 42g protein per loaf for fitness enthusiasts",
      "Low carb, high fibre, made with soy and wheat protein",
      "Ideal post-workout toast or gym-goer's daily sandwich base",
    ],
    inStock: true,
  },
  {
    name: "Iyengars Bakery Special Bread 400g",
    category: "Bakery",
    price: 75,
    offerPrice: 65,
    image: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Bangalore's beloved Iyengar Bakery-style soft white bread",
      "Traditional recipe with a characteristic soft, pillowy crumb",
      "Popular among South Indian families – best paired with filter coffee",
    ],
    inStock: true,
  },
  {
    name: "English Oven Burger Buns (Pack of 6) 240g",
    category: "Bakery",
    price: 42,
    offerPrice: 35,
    image: ["https://images.unsplash.com/photo-1562059390-a761a084768e?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Soft, sesame-topped burger buns ready for home gourmet burgers",
      "Even size with a sturdy yet soft crumb that holds fillings well",
      "Perfect for homemade aloo tikki burgers, paneer burgers, and sliders",
    ],
    inStock: true,
  },
  {
    name: "Modern Cremtreat Vanilla Cream Bun",
    category: "Bakery",
    price: 12,
    offerPrice: 10,
    image: ["https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Soft sweet bun filled with smooth vanilla cream",
      "Classic Indian bakery treat loved by school children",
      "Affordable indulgence – India's favourite cream bun",
    ],
    inStock: true,
  },
  {
    name: "Britannia Sweet Bun Pack of 4",
    category: "Bakery",
    price: 38,
    offerPrice: 32,
    image: ["https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Soft, lightly sweet bread buns from India's most trusted brand",
      "Mildly sweet with a feather-light texture",
      "Great for tiffin, evening snack, or as dinner roll",
    ],
    inStock: true,
  },
  {
    name: "Lavash Flatbread 200g",
    category: "Bakery",
    price: 105,
    offerPrice: 90,
    image: ["https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Thin, crispy Armenian-style flatbread popular in modern Indian cafes",
      "Versatile flatbread for wraps, dips, and mezze platters",
      "Available freshly baked at home bakeries and specialty stores",
    ],
    inStock: true,
  },
  {
    name: "Kulcha Bread (Pack of 4) 300g",
    category: "Bakery",
    price: 25,
    offerPrice: 20,
    image: ["https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Soft, slightly leavened North Indian kulcha bread perfect for chole kulcha",
      "Mild taste, fluffy texture – great with curries and chaat",
      "Traditional Indian flatbread loved across North India",
    ],
    inStock: true,
  },
  {
    name: "Pav Bhaji Pav Big Size (12 Pieces) 450g",
    category: "Bakery",
    price: 68,
    offerPrice: 58,
    image: ["https://images.unsplash.com/photo-1562059390-a761a084768e?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Big, fluffy Mumbai-style pav buns perfect for pav bhaji and vada pav",
      "Soft, pillowy interior with golden crust",
      "12-piece family pack ideal for party snacks and street-food nights",
    ],
    inStock: true,
  },
  {
    name: "French Bread Loaf 300g",
    category: "Bakery",
    price: 48,
    offerPrice: 40,
    image: ["https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Classic elongated French-style bread loaf with crispy golden crust",
      "Light, airy crumb with a chewy interior – café favourite",
      "Perfect with butter, olive oil, or sliced for bruschetta",
    ],
    inStock: true,
  },
  {
    name: "Classic French Baguette 250g",
    category: "Bakery",
    price: 99,
    offerPrice: 85,
    image: ["https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Authentic French baguette with a crackly thin crust and open crumb",
      "Baked fresh daily with traditional French baking techniques",
      "Ideal for cheese boards, soups, sandwiches, and bruschetta",
    ],
    inStock: true,
  },
  {
    name: "Italian Herb Panini Bread (2 Pieces) 200g",
    category: "Bakery",
    price: 32,
    offerPrice: 28,
    image: ["https://images.unsplash.com/photo-1562059390-a761a084768e?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Italian-style panini rolls infused with herbs – ready to grill",
      "Crispy exterior with soft, herb-fragrant interior",
      "Perfect for grilled panini sandwiches at home",
    ],
    inStock: true,
  },
];

async function main() {
  console.log("🍞 Updating Bakery catalog...");

  const existing = await prisma.product.findMany({
    where: { category: "Bakery" },
    select: { name: true },
  });
  const existingNames = new Set(existing.map((p) => p.name));

  const toAdd = bakeryList.filter((p) => !existingNames.has(p.name));
  console.log(`  Found ${existingNames.size} existing Bakery items. Adding ${toAdd.length} new items.`);

  if (toAdd.length > 0) {
    await prisma.product.createMany({ data: toAdd });
  }

  const total = await prisma.product.count({ where: { category: "Bakery" } });
  console.log(`✅ Bakery total now: ${total}`);
}

main()
  .catch((e) => { console.error("Error:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

