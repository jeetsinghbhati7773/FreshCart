import prisma from "../config/prisma.js";

export const dairyList = [
  {
    name: "Amul Taaza Homogenised Toned Milk (1 L Tetra Pak)",
    category: "Dairy",
    price: 80,
    offerPrice: 75,
    image: [
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "UHT-treated homogenized toned milk in long-life aseptic Tetra Pak packaging",
      "No boiling required, store ambiently until opened",
      "Minimum 3.0% Fat and 8.5% SNF, ideal for tea, coffee, and daily nutrition",
    ],
    inStock: true,
  },
  {
    name: "Amul Cow Milk (500 ml Pouch)",
    category: "Dairy",
    price: 30,
    offerPrice: 29,
    image: [
      "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Naturally sweet, easily digestible pasteurized cow milk",
      "Minimum 3.5% Fat and 8.5% SNF",
      "Specially recommended for growing children and morning tea",
    ],
    inStock: true,
  },
  {
    name: "Mother Dairy Full Cream Milk (1 L)",
    category: "Dairy",
    price: 75,
    offerPrice: 72,
    image: [
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Rich, creamy pasteurized full cream milk",
      "Minimum 6.0% Fat and 9.0% SNF",
      "Perfect for making thick malai, dense curd (dahi), and rich Indian desserts",
    ],
    inStock: true,
  },
  {
    name: "Mother Dairy Cow Milk (500 ml Pouch)",
    category: "Dairy",
    price: 32,
    offerPrice: 31,
    image: [
      "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Wholesome, pure cow milk pasteurized for maximum safety",
      "Light and rich in natural nutrients and calcium",
    ],
    inStock: true,
  },
  {
    name: "Amul Pasteurised Butter (100 g Carton)",
    category: "Dairy",
    price: 65,
    offerPrice: 63,
    image: [
      "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Iconic 'Utterly Butterly Delicious' Amul Butter in carton",
      "Pure milk fat seasoned with salt, golden yellow and creamy",
      "Essential for hot parathas, toast, pav bhaji, and cooking",
    ],
    inStock: true,
  },
  {
    name: "Amul Fresh Malai Paneer (200 g)",
    category: "Dairy",
    price: 80,
    offerPrice: 76,
    image: [
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Ultra-soft, melt-in-mouth fresh cottage cheese (Paneer)",
      "High protein vegetarian superfood, firm yet succulent",
      "Stays juicy in curries like Shahi Paneer, Palak Paneer & Kadai Paneer",
    ],
    inStock: true,
  },
  {
    name: "Amul Fresh Malai Paneer (1 kg Pouch)",
    category: "Dairy",
    price: 475,
    offerPrice: 450,
    image: [
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Value bulk pack of fresh malai paneer for parties and family cooking",
      "Vacuum-sealed for hygienic freshness and long-lasting tenderness",
    ],
    inStock: true,
  },
  {
    name: "Mother Dairy Paneer (200 g Pouch)",
    category: "Dairy",
    price: 100,
    offerPrice: 96,
    image: [
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Fresh, rich paneer prepared from pure pasteurized milk",
      "Soft texture that absorbs flavors seamlessly in curries and tikkas",
    ],
    inStock: true,
  },
  {
    name: "Amul Masti Dahi (500 g Pouch)",
    category: "Dairy",
    price: 48,
    offerPrice: 45,
    image: [
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Thick, creamy, naturally fermented homogenized curd (dahi)",
      "Mildly sour, smooth texture, perfect for raitas, chaats, and curd rice",
      "Rich in active probiotic cultures that support gut digestion",
    ],
    inStock: true,
  },
  {
    name: "Amul Masti Dahi (1 kg Pouch)",
    category: "Dairy",
    price: 80,
    offerPrice: 77,
    image: [
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Family pack 1kg fresh dahi, consistently thick and delicious",
      "Ideal for marinating tikkas, preparing kadhi, and daily meals",
    ],
    inStock: true,
  },
  {
    name: "Mother Dairy Classic Dahi (1 kg Pouch)",
    category: "Dairy",
    price: 85,
    offerPrice: 80,
    image: [
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Traditional homestyle classic curd made with pasteurized milk",
      "Thick set consistency, high protein and natural digestive health",
    ],
    inStock: true,
  },
  {
    name: "Amul Probiotic Dahi (400 g Cup)",
    category: "Dairy",
    price: 52,
    offerPrice: 50,
    image: [
      "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Special probiotic formulation with millions of live BB-12 friendly bacteria",
      "Clinically proven to strengthen immunity and support digestive wellness",
    ],
    inStock: true,
  },
  {
    name: "Amul Mishti Doi (200 g Cup)",
    category: "Dairy",
    price: 38,
    offerPrice: 35,
    image: [
      "https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Traditional Bengali sweet caramelized dessert yogurt (Mishti Doi)",
      "Caramel-gold color with creamy, decadent sweetness",
      "Traditional earthen pot flavor ready to serve chilled",
    ],
    inStock: true,
  },
  {
    name: "Mother Dairy Meetha Dahi (150 g Cup)",
    category: "Dairy",
    price: 22,
    offerPrice: 20,
    image: [
      "https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Deliciously sweetened homestyle curd in a convenient single-serve cup",
      "Sweet, soothing dessert after spicy Indian meals",
    ],
    inStock: true,
  },
  {
    name: "Amul Butter Milk / Chaas (680 ml Bottle)",
    category: "Dairy",
    price: 22,
    offerPrice: 20,
    image: [
      "https://images.unsplash.com/photo-1570696516188-ade861b84a49?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Chilled, refreshing Indian spiced chaas in on-the-go PET bottle",
      "Light, salted, and infused with jeera (cumin) and ginger extracts",
      "Perfect cooling digestive beverage after lunch",
    ],
    inStock: true,
  },
  {
    name: "Mother Dairy Probiotic Buttermilk Chaach (300 ml Pouch)",
    category: "Dairy",
    price: 12,
    offerPrice: 10,
    image: [
      "https://images.unsplash.com/photo-1570696516188-ade861b84a49?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Pocket-friendly probiotic spiced buttermilk pouch",
      "Low in calories, rich in probiotics, instant beat-the-heat refresher",
    ],
    inStock: true,
  },
  {
    name: "Mother Dairy Sweet Lassi (150 ml)",
    category: "Dairy",
    price: 15,
    offerPrice: 12,
    image: [
      "https://images.unsplash.com/photo-1570696516188-ade861b84a49?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Traditional Punjabi style sweet lassi crafted from thick curd",
      "Smooth, sweet, and comforting refreshment",
    ],
    inStock: true,
  },
  {
    name: "Mother Dairy Strawberry Lassi (180 ml Bottle)",
    category: "Dairy",
    price: 22,
    offerPrice: 20,
    image: [
      "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Fruity fusion of thick Indian yogurt lassi and real strawberry flavor",
      "Creamy, pink, delicious milkshake alternative",
    ],
    inStock: true,
  },
  {
    name: "Mother Dairy Fruit Yoghurt - Raspberry (100 g Cup)",
    category: "Dairy",
    price: 38,
    offerPrice: 35,
    image: [
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Gourmet fruit yogurt infused with succulent real raspberry fruit chunks",
      "Low fat, rich in calcium, and perfect guilt-free dessert cup",
    ],
    inStock: true,
  },
  {
    name: "Mother Dairy Cheese Slices (52 pcs)",
    category: "Dairy",
    price: 460,
    offerPrice: 432,
    image: [
      "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Jumbo pack of 52 individually wrapped processed cheddar cheese slices",
      "Melts smoothly on toast, burgers, grilled sandwiches, and dosas",
      "Rich in milk calcium and protein",
    ],
    inStock: true,
  },
  {
    name: "Amul Pure Cow Ghee 1L Tin",
    category: "Dairy",
    price: 650,
    offerPrice: 595,
    image: [
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Golden, aromatic, granular (danedar) pure cow ghee",
      "Prepared using traditional slow-cooking methods",
      "Enriches rotis, dals, khichdi, and Indian sweets with divine aroma",
    ],
    inStock: true,
  },
  {
    name: "Farm Fresh White Eggs (Pack of 6)",
    category: "Dairy",
    price: 50,
    offerPrice: 44,
    image: [
      "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Graded, clean, farm-fresh poultry eggs",
      "6 grams of complete protein per egg",
      "Ideal for quick morning omelettes, boiled eggs, and baking",
    ],
    inStock: true,
  },
];

async function main() {
  console.log("🥛 Updating dairy catalog to match exact Indian list and prices...");

  const deleted = await prisma.product.deleteMany({
    where: { category: "Dairy" },
  });
  console.log(`  Removed ${deleted.count} old dairy entries.`);

  await prisma.product.createMany({
    data: dairyList,
  });

  const count = await prisma.product.count({ where: { category: "Dairy" } });
  console.log(`✅ Successfully added all ${count} dairy products!`);
}

main()
  .catch((e) => {
    console.error("Error updating dairy:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

