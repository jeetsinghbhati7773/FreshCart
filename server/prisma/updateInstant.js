import prisma from "../config/prisma.js";

export const instantList = [
  // Maggi Noodles
  {
    name: "Maggi 2-Minute Masala Instant Noodles 70g",
    category: "Instant",
    price: 15,
    offerPrice: 14,
    image: ["https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=60"],
    description: [
      "India's most iconic instant noodles ready in just 2 minutes",
      "Signature tangy masala taste loved across generations",
      "Quick, easy, and satisfying comfort food any time of day",
    ],
    inStock: true,
  },
  {
    name: "Maggi Double Masala Instant Noodles 70g",
    category: "Instant",
    price: 20,
    offerPrice: 18,
    image: ["https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Maggi with double the masala punch for spice lovers",
      "2X masala tastemaker for an intensely flavored noodle experience",
      "Same beloved Maggi noodles, bolder and spicier flavor",
    ],
    inStock: true,
  },
  {
    name: "Smith & Jones Masala Instant Noodles 73g",
    category: "Instant",
    price: 15,
    offerPrice: 12,
    image: ["https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Budget-friendly instant masala noodles for everyday quick meals",
      "Spicy masala seasoning with thin quick-cook noodles",
      "Popular economy alternative to premium noodle brands",
    ],
    inStock: true,
  },
  {
    name: "Ching's Secret Singapore Curry Instant Noodles 240g",
    category: "Instant",
    price: 75,
    offerPrice: 65,
    image: ["https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Indo-Chinese fusion instant noodles with aromatic Singapore curry flavor",
      "Thick, chewy noodles in a fragrant coconut-lemongrass curry broth",
      "Bestselling Ching's noodle variant – bold, spicy, and exotic",
    ],
    inStock: true,
  },
  // Pasta
  {
    name: "Maggi Pazzta Masala Penne Instant Pasta 70g",
    category: "Instant",
    price: 35,
    offerPrice: 30,
    image: ["https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Quick-cook penne pasta with Maggi's signature masala seasoning",
      "Indian-style pasta ready in minutes – tangy, cheesy, and spicy",
      "Perfect after-school snack or quick weekday dinner",
    ],
    inStock: true,
  },
  {
    name: "Weikfield Cheesy Creamy Instant Pasta 100g",
    category: "Instant",
    price: 35,
    offerPrice: 30,
    image: ["https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Quick instant pasta with a rich cheesy cream sauce sachet",
      "Western-style creamy pasta experience made easy at home",
      "Kid-friendly quick meal ready in under 5 minutes",
    ],
    inStock: true,
  },
  {
    name: "Bambino Macaroni Elbow Pasta 500g",
    category: "Instant",
    price: 55,
    offerPrice: 48,
    image: ["https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Classic elbow-shaped semolina macaroni pasta from India's No.1 pasta brand",
      "Smooth texture that pairs perfectly with any sauce",
      "Trusted South Indian pasta brand popular across India for 70+ years",
    ],
    inStock: true,
  },
  // MTR Ready Mixes
  {
    name: "MTR 3-Minute Poha Breakfast Mix 80g",
    category: "Instant",
    price: 32,
    offerPrice: 28,
    image: ["https://images.unsplash.com/photo-1627308595229-7830a5c18037?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Authentic South Indian style poha breakfast ready in 3 minutes",
      "Pre-seasoned flattened rice with aromatic tempered spices",
      "No chopping or cooking required – just add hot water",
    ],
    inStock: true,
  },
  {
    name: "MTR Vegetable Upma Mix 200g",
    category: "Instant",
    price: 32,
    offerPrice: 28,
    image: ["https://images.unsplash.com/photo-1627308595229-7830a5c18037?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Instant semolina upma with real vegetable pieces and authentic seasoning",
      "South Indian breakfast classic ready in 3 minutes",
      "Convenient, nutritious morning meal without the fuss",
    ],
    inStock: true,
  },
  {
    name: "MTR Khaman Dhokla Ready Mix 200g",
    category: "Instant",
    price: 90,
    offerPrice: 79,
    image: ["https://images.unsplash.com/photo-1627308595229-7830a5c18037?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Authentic Gujarati steamed khaman dhokla from MTR's trusted mix",
      "Soft, fluffy, spongy dhokla with tangy-sweet balance",
      "Ready in 15 minutes – perfect for snacks and festive gatherings",
    ],
    inStock: true,
  },
  {
    name: "MTR Rava Idli Mix 500g",
    category: "Instant",
    price: 130,
    offerPrice: 115,
    image: ["https://images.unsplash.com/photo-1630383249896-424e482df921?w=500&auto=format&fit=crop&q=60"],
    description: [
      "No-ferment instant rava (semolina) idli mix for fluffy soft idlis",
      "South Indian breakfast staple ready without overnight soaking or grinding",
      "Consistently soft idlis every time with MTR's authentic recipe",
    ],
    inStock: true,
  },
  {
    name: "MTR Dosa Mix 500g",
    category: "Instant",
    price: 148,
    offerPrice: 130,
    image: ["https://images.unsplash.com/photo-1630383249896-424e482df921?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Instant rice and urad dal batter mix for crispy, golden dosas",
      "No overnight soaking – crispy dosa batter ready in minutes",
      "Authentic South Indian taste with MTR's heritage recipe",
    ],
    inStock: true,
  },
  // Ready-to-Eat
  {
    name: "Haldiram's Ready to Eat Veg Pulao 200g",
    category: "Instant",
    price: 85,
    offerPrice: 72,
    image: ["https://images.unsplash.com/photo-1536304993881-ff86e0c9b582?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Aromatic basmati rice cooked with fresh vegetables and whole spices",
      "Heat & eat in 2 minutes – perfect for travel and quick meals",
      "No preservatives, sealed for freshness",
    ],
    inStock: true,
  },
  {
    name: "Sankalp Paneer Butter Masala Ready to Eat 300g",
    category: "Instant",
    price: 165,
    offerPrice: 145,
    image: ["https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Restaurant-style creamy, rich paneer butter masala in a ready-to-eat pack",
      "Tomato-based makhani gravy with soft paneer cubes",
      "Heat in 3 minutes, serve with roti or rice for a complete meal",
    ],
    inStock: true,
  },
  {
    name: "Chokhi Dhani Dal Makhani Ready to Eat 300g",
    category: "Instant",
    price: 175,
    offerPrice: 155,
    image: ["https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Authentic Rajasthani-style slow-cooked dal makhani in a heat-and-eat pack",
      "Creamy black lentils cooked with butter and aromatic spices",
      "Traditional dhaba flavor with the convenience of instant heating",
    ],
    inStock: true,
  },
  {
    name: "iD Fresh Malabar Paratha (5 Pcs) 400g",
    category: "Instant",
    price: 115,
    offerPrice: 99,
    image: ["https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Soft, flaky, layered Malabar parathas – freshly made and refrigerated",
      "No maida preservative shortcuts – made with premium wheat flour",
      "Heat on tawa in 2 minutes, pair with dal or any curry",
    ],
    inStock: true,
  },
];

async function main() {
  console.log("🍜 Updating Instant Foods catalog...");

  const existing = await prisma.product.findMany({
    where: { category: "Instant" },
    select: { name: true },
  });
  const existingNames = new Set(existing.map((p) => p.name));

  const toAdd = instantList.filter((p) => !existingNames.has(p.name));
  console.log(`  Found ${existingNames.size} existing Instant items. Adding ${toAdd.length} new items.`);

  if (toAdd.length > 0) {
    await prisma.product.createMany({ data: toAdd });
  }

  const total = await prisma.product.count({ where: { category: "Instant" } });
  console.log(`✅ Instant Foods total now: ${total}`);
}

main()
  .catch((e) => { console.error("Error:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

