import prisma from "../config/prisma.js";

// Chocolates added to Snacks category (best fit)
export const chocolateList = [
  // Cadbury / Mondelez India
  {
    name: "Cadbury Dairy Milk Chocolate Bar 40g",
    category: "Snacks",
    price: 50,
    offerPrice: 40,
    image: ["https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500&auto=format&fit=crop&q=60"],
    description: [
      "India's most-loved creamy milk chocolate since 1948",
      "Smooth, melt-in-mouth texture with rich cocoa and milk notes",
      "Perfect gifting chocolate for every occasion",
    ],
    inStock: true,
  },
  {
    name: "Cadbury Dairy Milk Silk Oreo Chocolate Bar 130g",
    category: "Snacks",
    price: 190,
    offerPrice: 165,
    image: ["https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Premium Silk chocolate layered with crunchy Oreo cookie bits",
      "Irresistible combo of creamy milk chocolate and biscuit crunch",
      "India's most popular premium gifting chocolate",
    ],
    inStock: true,
  },
  {
    name: "Cadbury 5 Star Chocolate Bar 40g",
    category: "Snacks",
    price: 40,
    offerPrice: 30,
    image: ["https://images.unsplash.com/photo-1575377427642-087cf684f29d?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Chewy caramel and nougat coated in smooth milk chocolate",
      "India's iconic 'Get Lost' chocolate bar loved for decades",
      "Satisfying, indulgent, and unique chewiness",
    ],
    inStock: true,
  },
  {
    name: "Cadbury Perk Chocolate Bar 36g",
    category: "Snacks",
    price: 20,
    offerPrice: 15,
    image: ["https://images.unsplash.com/photo-1575377427642-087cf684f29d?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Light, crunchy wafer fingers dipped in smooth Cadbury chocolate",
      "Popular anytime snack chocolate – light yet satisfying",
      "Great for kids and teens as a tiffin treat",
    ],
    inStock: true,
  },
  // Nestlé India
  {
    name: "KitKat 4-Finger Milk Chocolate 41.5g",
    category: "Snacks",
    price: 50,
    offerPrice: 40,
    image: ["https://images.unsplash.com/photo-1619740445970-e02d5bfb3161?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Crispy wafer fingers covered in smooth Nestlé milk chocolate",
      "Have a break, have a KitKat! – iconic global chocolate loved in India",
      "Perfect tea-time and study-break companion",
    ],
    inStock: true,
  },
  {
    name: "Nestlé Milkybar White Chocolate 30g",
    category: "Snacks",
    price: 30,
    offerPrice: 22,
    image: ["https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Smooth, creamy pure white chocolate loved by children across India",
      "Made from real milk solids for a rich milky taste",
      "India's favourite white chocolate bar",
    ],
    inStock: true,
  },
  {
    name: "Nestlé KitKat Mini Chocolate Sharebag 200g",
    category: "Snacks",
    price: 250,
    offerPrice: 210,
    image: ["https://images.unsplash.com/photo-1619740445970-e02d5bfb3161?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Pack of bite-sized KitKat mini bars perfect for sharing",
      "Crispy wafers and silky chocolate in every mini piece",
      "Great for parties, gifting, and office sharing",
    ],
    inStock: true,
  },
  // Amul
  {
    name: "Amul Dark Chocolate (99% Cocoa) 150g",
    category: "Snacks",
    price: 149,
    offerPrice: 125,
    image: ["https://images.unsplash.com/photo-1481391243133-f96216dcb5d2?w=500&auto=format&fit=crop&q=60"],
    description: [
      "India's favourite desi dark chocolate – intense 99% pure cocoa",
      "Rich, slightly bitter, antioxidant-packed dark chocolate",
      "Perfect for baking, desserts, or health-conscious snacking",
    ],
    inStock: true,
  },
  {
    name: "Amul Fruit & Nut Chocolate 150g",
    category: "Snacks",
    price: 140,
    offerPrice: 115,
    image: ["https://images.unsplash.com/photo-1481391243133-f96216dcb5d2?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Creamy Amul milk chocolate studded with raisins and crunchy almonds",
      "An affordable, wholesome Indian chocolate treat",
      "Desi chocolate loved by generations at a budget price",
    ],
    inStock: true,
  },
  // Ferrero Rocher
  {
    name: "Ferrero Rocher Hazelnut Chocolates T16 Gift Pack 200g",
    category: "Snacks",
    price: 795,
    offerPrice: 699,
    image: ["https://images.unsplash.com/photo-1548907040-4baa42d10919?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Premium golden Italian hazelnut chocolate balls in a gift box of 16",
      "Whole hazelnut encased in crunchy wafer and smooth praline",
      "India's most gifted premium chocolate for festivals and celebrations",
    ],
    inStock: true,
  },
  {
    name: "Ferrero Rocher T3 Mini Gift Box 37.5g",
    category: "Snacks",
    price: 170,
    offerPrice: 140,
    image: ["https://images.unsplash.com/photo-1548907040-4baa42d10919?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Pack of 3 Ferrero Rocher premium hazelnut chocolate balls",
      "Elegant golden gift box – perfect token gift",
      "Luxurious European taste for everyday moments",
    ],
    inStock: true,
  },
  // Mars / Snickers
  {
    name: "Snickers Peanut Chocolate Bar 50g",
    category: "Snacks",
    price: 60,
    offerPrice: 50,
    image: ["https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Satisfying hunger-busting bar with peanuts, caramel, nougat, and chocolate",
      "High energy bar beloved by athletes and snack lovers",
      "You're not you when you're hungry – grab a Snickers!",
    ],
    inStock: true,
  },
  {
    name: "Mars Chocolate Bar 51g",
    category: "Snacks",
    price: 60,
    offerPrice: 52,
    image: ["https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Classic caramel and nougat bar coated in smooth milk chocolate",
      "Rich, indulgent treat with layers of textures",
      "Popular international chocolate bar available across India",
    ],
    inStock: true,
  },
  // Lindt
  {
    name: "Lindt Excellence 70% Dark Chocolate Bar 100g",
    category: "Snacks",
    price: 450,
    offerPrice: 390,
    image: ["https://images.unsplash.com/photo-1481391243133-f96216dcb5d2?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Swiss master chocolatier's premium 70% dark cocoa bar",
      "Intense, smooth dark chocolate with deep cocoa and fruity notes",
      "Finest Swiss chocolate crafted from carefully selected cocoa beans",
    ],
    inStock: true,
  },
  {
    name: "Lindt Lindor Milk Chocolate Truffles Box 200g",
    category: "Snacks",
    price: 1100,
    offerPrice: 950,
    image: ["https://images.unsplash.com/photo-1548907040-4baa42d10919?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Irresistibly smooth Swiss milk chocolate truffles",
      "Hard shell gives way to a silky melt-in-your-mouth filling",
      "Premium gifting box for weddings, Diwali, and anniversaries",
    ],
    inStock: true,
  },
  // Toblerone
  {
    name: "Toblerone Swiss Milk Chocolate 100g Triangle Bar",
    category: "Snacks",
    price: 450,
    offerPrice: 390,
    image: ["https://images.unsplash.com/photo-1562690868-60bbe7293e94?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Iconic Swiss triangular chocolate bar with honey-almond nougat",
      "Distinctive mountain-peak shape inspired by the Swiss Alps",
      "Beloved premium import chocolate available in Indian duty-free and stores",
    ],
    inStock: true,
  },
  // Paul and Mike (Indian bean-to-bar)
  {
    name: "Paul and Mike Dark Chocolate 65% 50g Bar",
    category: "Snacks",
    price: 350,
    offerPrice: 299,
    image: ["https://images.unsplash.com/photo-1481391243133-f96216dcb5d2?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Indian artisan bean-to-bar dark chocolate from Kerala cacao",
      "65% single-origin Indian cacao with natural fruity complexity",
      "Craft chocolate supporting Indian cacao farmers directly",
    ],
    inStock: true,
  },
  // Manam Chocolate
  {
    name: "Manam Single Origin Dark Chocolate 70% 55g",
    category: "Snacks",
    price: 450,
    offerPrice: 399,
    image: ["https://images.unsplash.com/photo-1481391243133-f96216dcb5d2?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Premium Indian single-origin dark chocolate from Telangana cacao",
      "70% cocoa with distinctive terroir-driven flavor notes",
      "Award-winning Indian bean-to-bar chocolate brand",
    ],
    inStock: true,
  },
  // Fabelle (ITC)
  {
    name: "Fabelle Exquisite Chocolate Truffle Box 125g",
    category: "Snacks",
    price: 650,
    offerPrice: 575,
    image: ["https://images.unsplash.com/photo-1548907040-4baa42d10919?w=500&auto=format&fit=crop&q=60"],
    description: [
      "ITC's luxurious handcrafted Indian chocolate truffle collection",
      "Exquisite assortment of dark, milk, and white chocolate truffles",
      "Opulent gifting experience for celebrations and corporate occasions",
    ],
    inStock: true,
  },
];

async function main() {
  console.log("🍫 Adding chocolates to Snacks catalog...");

  // Check which chocolates already exist
  const existing = await prisma.product.findMany({
    where: { category: "Snacks" },
    select: { name: true },
  });
  const existingNames = new Set(existing.map((p) => p.name));

  const toAdd = chocolateList.filter((p) => !existingNames.has(p.name));
  console.log(`  Found ${existingNames.size} existing Snacks. Adding ${toAdd.length} new chocolate items.`);

  if (toAdd.length > 0) {
    await prisma.product.createMany({ data: toAdd });
  }

  const total = await prisma.product.count({ where: { category: "Snacks" } });
  console.log(`✅ Snacks total now: ${total}`);
}

main()
  .catch((e) => { console.error("Error:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

