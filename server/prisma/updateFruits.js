import prisma from "../config/prisma.js";

export const fruitList = [
  {
    name: "केला / Banana (Robusta / Yelakki / Desi) 1kg",
    category: "Fruits",
    price: 75,
    offerPrice: 60,
    image: [
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Naturally ripened sweet bananas (Kela)",
      "High in natural potassium, dietary fiber, and quick energy",
      "Ideal breakfast staple, smoothie base, and healthy snack",
    ],
    inStock: true,
  },
  {
    name: "अनार / Pomegranate (Anaar) 1kg",
    category: "Fruits",
    price: 260,
    offerPrice: 220,
    image: [
      "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Ruby-red, juicy arils bursting with sweet-tart juice",
      "Powerhouse of polyphenols and antioxidants supporting heart health",
      "Great for fresh fruit bowls, raita, and cold-pressed juice",
    ],
    inStock: true,
  },
  {
    name: "सेब / Apple (Royal Gala / Fuji / Red) 1kg",
    category: "Fruits",
    price: 195,
    offerPrice: 165,
    image: [
      "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Crisp, crunchy, sweet handpicked apples (Seb)",
      "Rich in soluble pectin fiber and Vitamin C",
      "Perfect daily immune-boosting snack",
    ],
    inStock: true,
  },
  {
    name: "पपीता / Papaya (Papita) 1 pc",
    category: "Fruits",
    price: 99,
    offerPrice: 85,
    image: [
      "https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Sweet, golden-orange flesh papaya with natural sweetness",
      "Contains papain digestive enzyme that promotes gut wellness",
      "Rich in Vitamin A for glowing skin and clear vision",
    ],
    inStock: true,
  },
  {
    name: "तरबूज / Watermelon (Tarbooz) 1 pc",
    category: "Fruits",
    price: 140,
    offerPrice: 115,
    image: [
      "https://images.unsplash.com/photo-1589984662646-e7b2e495949c?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Deep red, ultra-sweet and crisp hydrating whole watermelon",
      "92% natural water content with abundant Lycopene",
      "Ultimate cooling thirst-quencher for hot days",
    ],
    inStock: true,
  },
  {
    name: "आम / Mango (Kesar / Badami / Dasheri) 1kg",
    category: "Fruits",
    price: 280,
    offerPrice: 235,
    image: [
      "https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "The King of Fruits - Aromatic sweet Indian mangoes (Aam)",
      "Luscious saffron-gold pulp with rich tropical sweetness",
      "Pure delight for Aamras, mango shakes, and direct slicing",
    ],
    inStock: true,
  },
  {
    name: "नारियल / कच्चा नारियल (Tender Coconut) 1 pc",
    category: "Fruits",
    price: 55,
    offerPrice: 45,
    image: [
      "https://images.unsplash.com/photo-1544378730-8b5104b18790?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Fresh green tender coconut with naturally sweet electrolyte water",
      "Packed with natural potassium, magnesium, and zero fat",
      "100% natural, refreshing daily hydration",
    ],
    inStock: true,
  },
  {
    name: "मौसमी / Mosambi (Sweet Lime) 1kg",
    category: "Fruits",
    price: 85,
    offerPrice: 68,
    image: [
      "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Sweet, mild, soothing citrus juice fruit (Mosambi)",
      "Gentle on the stomach and deeply refreshing",
      "Favorite fruit for fresh roadside juices with a dash of chaat masala",
    ],
    inStock: true,
  },
  {
    name: "चेरी / Cherries (Fresh Sweet Cherries) 250g",
    category: "Fruits",
    price: 180,
    offerPrice: 160,
    image: [
      "https://images.unsplash.com/photo-1528825871115-3581a5387919?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Plump, dark red fresh sweet cherries",
      "Rich in anthocyanins, melatonin, and natural antioxidants",
      "Exquisite bite-sized fruit luxury for snacking and desserts",
    ],
    inStock: true,
  },
  {
    name: "खूबानी / Apricots (Fresh Khubani) 500g",
    category: "Fruits",
    price: 210,
    offerPrice: 186,
    image: [
      "https://images.unsplash.com/photo-1595180632517-56e6d1c79a40?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Velvety, golden-orange aromatic fresh apricots (Khubani)",
      "Sweet-tart flavor loaded with dietary fiber and Vitamin E",
      "Traditional delicacy of Himachal and Kashmir valleys",
    ],
    inStock: true,
  },
  {
    name: "चीकू / Sapota (Chiku) 500g",
    category: "Fruits",
    price: 70,
    offerPrice: 57,
    image: [
      "https://images.unsplash.com/photo-1596363505729-4190a9506133?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Malty, honey-sweet, granular brown sapota (Chiku)",
      "Naturally rich in sucrose and fructose for quick energy",
      "Perfect for rich Chiku milkshakes, ice creams, and desserts",
    ],
    inStock: true,
  },
  {
    name: "कीवी / Kiwi (Zespri Green Kiwi) Pack of 3",
    category: "Fruits",
    price: 120,
    offerPrice: 95,
    image: [
      "https://images.unsplash.com/photo-1585059895524-72359e06133a?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Vibrant emerald green tangy-sweet kiwi fruit",
      "Contains double the Vitamin C of an orange and dietary Actinidin",
      "Boosts platelet counts and enhances immune defense",
    ],
    inStock: true,
  },
  {
    name: "नाशपाती / Pears (Indian Green Naspathi) 1kg",
    category: "Fruits",
    price: 140,
    offerPrice: 110,
    image: [
      "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Crisp, grainy, bell-shaped sweet green pears (Naspathi)",
      "Extremely gentle on digestion with high soluble dietary fiber",
      "Delightfully refreshing for autumn snacking",
    ],
    inStock: true,
  },
  {
    name: "अनानास / Pineapple (Ananas) 1 pc",
    category: "Fruits",
    price: 110,
    offerPrice: 85,
    image: [
      "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Sweet, golden, fragrant tropical pineapple (Ananas)",
      "Rich in Bromelain enzyme that aids protein digestion",
      "Great for fruit skewers, grilled pineapple, and fresh juice",
    ],
    inStock: true,
  },
  {
    name: "काला अंगूर / Black Grapes (Seedless) 500g",
    category: "Fruits",
    price: 145,
    offerPrice: 125,
    image: [
      "https://images.unsplash.com/photo-1596363505729-4190a9506133?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Deep purple-black, juicy seedless sweet grapes",
      "Loaded with Resveratrol and heart-healthy antioxidants",
      "Delicious chilled bite-sized fruit snack",
    ],
    inStock: true,
  },
  {
    name: "आड़ू / Peaches (Fresh Indian Aadu) 500g",
    category: "Fruits",
    price: 295,
    offerPrice: 273,
    image: [
      "https://images.unsplash.com/photo-1595180632517-56e6d1c79a40?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Soft, velvety, fragrant sweet peaches (Aadu)",
      "Hand-harvested from Himalayan foothills",
      "Great for salads, fruit tarts, and fresh smoothies",
    ],
    inStock: true,
  },
  {
    name: "संतरा / किन्नू / Orange (Kinnow) 1kg",
    category: "Fruits",
    price: 85,
    offerPrice: 75,
    image: [
      "https://images.unsplash.com/photo-1547514701-42782101795e?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Juicy, glossy, high-pulp Indian Kinnow oranges",
      "Vibrant citrus tang packed with natural Vitamin C",
      "Best for squeezing fresh breakfast juice",
    ],
    inStock: true,
  },
  {
    name: "ड्रैगन फ्रूट / Dragon Fruit (Red / White) 1 pc",
    category: "Fruits",
    price: 130,
    offerPrice: 105,
    image: [
      "https://images.unsplash.com/photo-1527324688151-0e627063f2b1?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Vibrant magenta-skinned exotic pitahaya (Dragon Fruit)",
      "Mildly sweet with crunchy black seeds like kiwi",
      "High in prebiotic fiber and natural iron",
    ],
    inStock: true,
  },
  {
    name: "थाई अमरूद / Thai Guava (Amrood - Pink/White) 1 pc",
    category: "Fruits",
    price: 75,
    offerPrice: 59,
    image: [
      "https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Jumbo, crunchy, aromatic Indian / Thai guava (Amrood)",
      "4 times the Vitamin C of oranges and high in pectin",
      "Classic pairing with black salt and red chilli powder",
    ],
    inStock: true,
  },
  {
    name: "शहतूत / Mulberries (Fresh Shahtoot) 125g",
    category: "Fruits",
    price: 195,
    offerPrice: 181,
    image: [
      "https://images.unsplash.com/photo-1596363505729-4190a9506133?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Sweet, tart, deep-purple wild mulberries (Shahtoot)",
      "Rare seasonal berry rich in Vitamin C, Iron, and Resveratrol",
      "Delicate and burst-in-mouth juicy berry treats",
    ],
    inStock: true,
  },
  {
    name: "अंजीर / Fresh Figs (Anjeer) Pack of 6",
    category: "Fruits",
    price: 110,
    offerPrice: 94,
    image: [
      "https://images.unsplash.com/photo-1595180632517-56e6d1c79a40?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Plump, honey-sweet, jammy fresh purple figs (Anjeer)",
      "Exceptionally high in dietary fiber, potassium, and calcium",
      "Royal fruit for heart health and digestive balance",
    ],
    inStock: true,
  },
  {
    name: "खरबूजा / Muskmelon (Kharbooja) 1 pc",
    category: "Fruits",
    price: 105,
    offerPrice: 85,
    image: [
      "https://images.unsplash.com/photo-1589984662646-e7b2e495949c?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Aromatic, netting-rind sweet orange muskmelon (Kharbooja)",
      "Deeply hydrating and cooling for the body",
      "Rich in Vitamin A and Beta-Carotene",
    ],
    inStock: true,
  },
  {
    name: "आंवला / Amla (Indian Gooseberry) 1kg",
    category: "Fruits",
    price: 165,
    offerPrice: 145,
    image: [
      "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Sacred Ayurvedic superfruit - Indian Gooseberry (Amla)",
      "Highest concentrated source of natural Vitamin C on Earth",
      "Supports immunity, radiant skin, strong hair, and digestion",
    ],
    inStock: true,
  },
  {
    name: "एवोकाडो / Hass Avocado 1 pc",
    category: "Fruits",
    price: 210,
    offerPrice: 175,
    image: [
      "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Rich, buttery, nutty ripe Hass avocado",
      "Packed with monounsaturated healthy fats and Oleic acid",
      "Perfect for avocado toast, guacamole, and keto salads",
    ],
    inStock: true,
  },
  {
    name: "ब्लूबेरी / Blueberries (Fresh) 125g",
    category: "Fruits",
    price: 349,
    offerPrice: 310,
    image: [
      "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Plump, sweet-tart deep blue antioxidant superfruit berries",
      "Loaded with anthocyanins for brain function and cellular health",
      "Ideal for breakfast oats, pancakes, yogurt, and snacking",
    ],
    inStock: true,
  },
];

async function main() {
  console.log("🍎 Updating fruits catalog to match exact Indian list and prices...");

  // Remove existing fruits
  const deleted = await prisma.product.deleteMany({
    where: { category: "Fruits" },
  });
  console.log(`  Removed ${deleted.count} old fruit entries.`);

  // Insert all 25 fruits
  await prisma.product.createMany({
    data: fruitList,
  });

  const count = await prisma.product.count({ where: { category: "Fruits" } });
  console.log(`✅ Successfully added all ${count} fruits!`);
}

main()
  .catch((e) => {
    console.error("Error updating fruits:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

