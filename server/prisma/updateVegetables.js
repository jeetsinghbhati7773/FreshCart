import prisma from "../config/prisma.js";

export const vegetableList = [
  {
    name: "Potato / आलू (Potato) 1kg",
    category: "Vegetables",
    price: 60,
    offerPrice: 48,
    image: [
      "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Fresh farm-harvested Indian potatoes (Aloo)",
      "Versatile kitchen essential for curries, aloo parathas, and fries",
      "Rich in dietary potassium and carbohydrates",
    ],
    inStock: true,
  },
  {
    name: "Tomato / टमाटर (Tomato) 1kg",
    category: "Vegetables",
    price: 75,
    offerPrice: 58,
    image: [
      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Plump, ripe red hybrid tomatoes (Tamatar)",
      "Rich in natural Lycopene and Vitamin C",
      "Essential base for gravies, dal tadka, and fresh salads",
    ],
    inStock: true,
  },
  {
    name: "Onion / प्याज (Onion) 1kg",
    category: "Vegetables",
    price: 65,
    offerPrice: 52,
    image: [
      "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Crisp, pungent Nashik red onions (Pyaz)",
      "Indispensable aromatic cooking base for Indian tadka and gravies",
      "Carefully graded, firm, and clean",
    ],
    inStock: true,
  },
  {
    name: "Carrot / गाजर (Carrot) 1kg",
    category: "Vegetables",
    price: 95,
    offerPrice: 80,
    image: [
      "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Sweet, crunchy organic orange carrots (Gajar)",
      "Loaded with Beta-Carotene and Vitamin A",
      "Ideal for salads, sabzi, gajar ka halwa, and juicing",
    ],
    inStock: true,
  },
  {
    name: "Lady's Finger / भिंडी (Okra) 1kg",
    category: "Vegetables",
    price: 110,
    offerPrice: 88,
    image: [
      "https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Tender, slender, bright green bhindi (Okra)",
      "Perfect for Kurkuri Bhindi, Bhindi Masala, and stir-fries",
      "High in soluble dietary fiber and vitamins",
    ],
    inStock: true,
  },
  {
    name: "Cauliflower / गोभी (Cauliflower) 1 pc",
    category: "Vegetables",
    price: 150,
    offerPrice: 125,
    image: [
      "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Fresh, compact, bright white cauliflower (Phool Gobhi)",
      "Ideal for Aloo Gobhi, Gobhi Paratha, or mixed vegetable curries",
      "Rich in fiber and B-complex vitamins",
    ],
    inStock: true,
  },
  {
    name: "Cabbage / पत्ता गोभी (Cabbage) 1 pc",
    category: "Vegetables",
    price: 90,
    offerPrice: 80,
    image: [
      "https://images.unsplash.com/photo-1551893665-f843f600794e?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Crisp, tight green cabbage (Patta Gobhi)",
      "Great for Indian stir-fries, momos, noodles, and crunchy slaw",
      "Low in calories, high in Vitamin K",
    ],
    inStock: true,
  },
  {
    name: "Broccoli / ब्रोकोली (Broccoli) 500g",
    category: "Vegetables",
    price: 220,
    offerPrice: 175,
    image: [
      "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Nutrient-dense dark green broccoli florets",
      "Superfood packed with Sulforaphane, Vitamin C, and iron",
      "Ideal for salads, soups, pasta, and healthy stir-fries",
    ],
    inStock: true,
  },
  {
    name: "Capsicum / शिमला मिर्च (Capsicum) 1kg",
    category: "Vegetables",
    price: 130,
    offerPrice: 105,
    image: [
      "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Glossy, firm green bell peppers (Shimla Mirch)",
      "Crispy texture and sweet-peppery flavor",
      "Adds crunch to kadai paneer, fried rice, and fajitas",
    ],
    inStock: true,
  },
  {
    name: "Cucumber / खीरा (Cucumber) 1kg",
    category: "Vegetables",
    price: 85,
    offerPrice: 65,
    image: [
      "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Cool, refreshing, hydrating green cucumbers (Kheera)",
      "95% water content, excellent for summer hydration",
      "Perfect for fresh garden salads, raitas, and sandwich slices",
    ],
    inStock: true,
  },
  {
    name: "Bottle Gourd / लौकी (Bottle Gourd) 1 pc",
    category: "Vegetables",
    price: 95,
    offerPrice: 75,
    image: [
      "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Tender, light green farm-fresh bottle gourd (Lauki / Ghiya)",
      "Extremely light on the stomach and aids healthy digestion",
      "Ideal for Lauki Chana Dal, Lauki Kofta, or fresh morning juice",
    ],
    inStock: true,
  },
  {
    name: "Beetroot / चुकंदर (Beetroot) 1kg",
    category: "Vegetables",
    price: 110,
    offerPrice: 92,
    image: [
      "https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Deep ruby red earthy beetroots (Chukandar)",
      "High in dietary nitrates, folate, and natural iron",
      "Boosts stamina and blood circulation; excellent for salads & juices",
    ],
    inStock: true,
  },
  {
    name: "French Beans / फ्रेंच बीन्स (French Beans) 1kg",
    category: "Vegetables",
    price: 145,
    offerPrice: 120,
    image: [
      "https://images.unsplash.com/photo-1592394533824-9440e5d68530?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Slender, crisp, snap-fresh green French beans",
      "Rich source of plant proteins, dietary fiber, and Vitamin C",
      "Key ingredient for vegetable pulao, poriyal, and mixed veg",
    ],
    inStock: true,
  },
  {
    name: "Green Chillies / हरी मिर्च (Green Chillies) 1kg",
    category: "Vegetables",
    price: 125,
    offerPrice: 105,
    image: [
      "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Vibrant, spicy fresh Indian green chillies (Hari Mirch)",
      "Packed with natural capsaicin and high Vitamin C",
      "Essential for authentic Indian heat and zesty tadka",
    ],
    inStock: true,
  },
  {
    name: "Ginger / अदरक (Ginger) 1kg",
    category: "Vegetables",
    price: 240,
    offerPrice: 195,
    image: [
      "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Aromatic, fibrous, zesty fresh ginger roots (Adrak)",
      "Natural anti-inflammatory and digestive aid",
      "Irreplaceable for Indian ginger chai, curries, and marinades",
    ],
    inStock: true,
  },
  {
    name: "Garlic / लहसुन (Garlic) 1kg",
    category: "Vegetables",
    price: 310,
    offerPrice: 265,
    image: [
      "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Pungent, firm, large Indian garlic bulbs (Lehsun)",
      "Loaded with Allicin for immunity and heart health",
      "Creates the irresistible aroma in Indian dal tadka and curries",
    ],
    inStock: true,
  },
  {
    name: "Lemon / नींबू (Lemon) 1kg",
    category: "Vegetables",
    price: 180,
    offerPrice: 145,
    image: [
      "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Juicy, thin-skinned yellow Indian lemons (Nimbu)",
      "Powerhouse of natural Vitamin C and citric acidity",
      "Essential for Nimbu Pani, chaat, and daily meal seasoning",
    ],
    inStock: true,
  },
  {
    name: "Sweet Potato / शकरकंद (Sweet Potato) 1kg",
    category: "Vegetables",
    price: 155,
    offerPrice: 125,
    image: [
      "https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Naturally sweet, creamy, nutrient-rich sweet potatoes (Shakarkand)",
      "Complex carbohydrates with low glycemic index",
      "Delicious boiled, roasted for street-style Shakarkandi Chaat",
    ],
    inStock: true,
  },
  {
    name: "Red Pumpkin / लाल कद्दू (Red Pumpkin) 1kg",
    category: "Vegetables",
    price: 95,
    offerPrice: 82,
    image: [
      "https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Golden-fleshed sweet red pumpkin (Lal Kaddu / Sitaphal)",
      "Rich in Vitamin A, antioxidants, and dietary fiber",
      "Traditional favorite for Kaddu ki Sabzi, sambar, and soups",
    ],
    inStock: true,
  },
  {
    name: "Palak / पालक (Palak/Spinach) 1kg",
    category: "Vegetables",
    price: 135,
    offerPrice: 120,
    image: [
      "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Tender, crisp, farm-harvested green spinach leaves (Palak)",
      "High in natural dietary iron, calcium, and folic acid",
      "Perfect for Palak Paneer, Dal Palak, and nutritious smoothies",
    ],
    inStock: true,
  },
  {
    name: "Methi / मेथी (Fenugreek Leaves) 1kg",
    category: "Vegetables",
    price: 155,
    offerPrice: 135,
    image: [
      "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Fresh, aromatic green fenugreek leaves (Hari Methi)",
      "Distinct herbal aroma with pleasant mild bitterness",
      "Ideal for Methi Thepla, Aloo Methi, and Methi Malai Matar",
    ],
    inStock: true,
  },
  {
    name: "Coriander / हरा धनिया (Coriander) 1 Bunch",
    category: "Vegetables",
    price: 135,
    offerPrice: 120,
    image: [
      "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Lush, aromatic, freshly cut green coriander leaves (Dhaniya)",
      "Indispensable Indian kitchen herb for curries, dal, and green chutney",
    ],
    inStock: true,
  },
  {
    name: "Cluster Beans / ग्वार फली (Cluster Beans) 1kg",
    category: "Vegetables",
    price: 105,
    offerPrice: 88,
    image: [
      "https://images.unsplash.com/photo-1592394533824-9440e5d68530?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Tender, crisp young cluster beans (Gwar Phali)",
      "High in soluble dietary fiber and plant proteins",
      "Delicious prepared as traditional Gwar Phali ki Sabzi with ajwain",
    ],
    inStock: true,
  },
  {
    name: "Zucchini / जुकिनी (Zucchini) 1kg",
    category: "Vegetables",
    price: 190,
    offerPrice: 165,
    image: [
      "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Firm, smooth-skinned fresh green zucchini",
      "Low calorie vegetable versatile for stir-fries, pastas, and grilling",
      "Rich in antioxidants and Vitamin C",
    ],
    inStock: true,
  },
  {
    name: "Ivy Gourd / टिंडा / टिंडोरा (Tindora) 1kg",
    category: "Vegetables",
    price: 105,
    offerPrice: 85,
    image: [
      "https://images.unsplash.com/photo-1592394533824-9440e5d68530?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Crisp, crunchy, slender green ivy gourds (Tindora / Kundru)",
      "Beloved Indian vegetable for dry crunchy stir-fries and sambar",
      "Supports balanced blood sugar and healthy metabolism",
    ],
    inStock: true,
  },
];

async function main() {
  console.log("🥬 Updating vegetables catalog to match exact Indian list and prices...");

  // Remove existing vegetables
  const deleted = await prisma.product.deleteMany({
    where: { category: "Vegetables" },
  });
  console.log(`  Removed ${deleted.count} old vegetable entries.`);

  // Insert all 25 vegetables
  await prisma.product.createMany({
    data: vegetableList,
  });

  const count = await prisma.product.count({ where: { category: "Vegetables" } });
  console.log(`✅ Successfully added all ${count} vegetables!`);
}

main()
  .catch((e) => {
    console.error("Error updating vegetables:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

