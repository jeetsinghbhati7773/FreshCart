import prisma from "../config/prisma.js";

export const grainList = [
  {
    name: "गेहूँ / Wheat (Sharbati) 1kg",
    category: "Grains",
    price: 25,
    offerPrice: 22,
    image: ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Premium Sharbati whole wheat grains from Madhya Pradesh",
      "High gluten content ideal for chakki atta and rotis",
      "Rich in dietary fibre, B-vitamins, and essential minerals",
    ],
    inStock: true,
  },
  {
    name: "चावल / Basmati Rice (India Gate Classic) 1kg",
    category: "Grains",
    price: 90,
    offerPrice: 75,
    image: ["https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Premium long-grain basmati rice with fragrant aroma",
      "India Gate's classic basmati with extra-long aged grains",
      "Fluffy, non-sticky when cooked – perfect for biryani and pulao",
    ],
    inStock: true,
  },
  {
    name: "चावल / Sona Masoori Raw Rice 1kg",
    category: "Grains",
    price: 65,
    offerPrice: 55,
    image: ["https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Medium-grain Sona Masoori rice popular in South India",
      "Light, low glycemic index rice ideal for everyday meals",
      "Perfect for South Indian rice meals, idli batter, and simple dal-rice",
    ],
    inStock: true,
  },
  {
    name: "मक्का / Maize Corn Grains 1kg",
    category: "Grains",
    price: 30,
    offerPrice: 25,
    image: ["https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Dried yellow maize corn kernels for making makki ki roti and cornmeal",
      "Rich in fibre, Vitamin B, and antioxidants",
      "Staple grain of Punjab and Himachal Pradesh cuisine",
    ],
    inStock: true,
  },
  {
    name: "जौ / Barley (Jau) Grain 500g",
    category: "Grains",
    price: 45,
    offerPrice: 38,
    image: ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Hulled barley grains – a traditional Indian grain for khichdi and soups",
      "High in beta-glucan fibre for cholesterol and blood sugar management",
      "Also used in jau sattu drinks and Indian barley water",
    ],
    inStock: true,
  },
  {
    name: "बाजरा / Pearl Millet 1kg",
    category: "Grains",
    price: 45,
    offerPrice: 38,
    image: ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Whole pearl millet grains – India's most widely grown and consumed millet",
      "Rich in iron, magnesium, and antioxidants",
      "Used for bajra roti, bajra khichdi, and traditional Rajasthani cuisine",
    ],
    inStock: true,
  },
  {
    name: "ज्वार / Sorghum (Jowar) 1kg",
    category: "Grains",
    price: 55,
    offerPrice: 46,
    image: ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Whole sorghum grains – a gluten-free ancient Indian grain",
      "High in protein, fibre, and antioxidants",
      "Staple of Maharashtra and Karnataka for jowar bhakri and porridge",
    ],
    inStock: true,
  },
  {
    name: "रागी / Finger Millet 1kg",
    category: "Grains",
    price: 75,
    offerPrice: 62,
    image: ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Whole finger millet (ragi/nachni) – India's calcium-king grain",
      "Exceptionally high in calcium, iron, and dietary fibre",
      "Popular in South India for ragi mudde, dosa, and ragi porridge",
    ],
    inStock: true,
  },
  {
    name: "ओट्स / Quaker Rolled Oats 1kg",
    category: "Grains",
    price: 230,
    offerPrice: 195,
    image: ["https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Quaker 100% whole grain rolled oats – India's No.1 oats brand",
      "Rich in beta-glucan soluble fibre for heart health",
      "Versatile – oatmeal, overnight oats, chillas, ladoos, and smoothies",
    ],
    inStock: true,
  },
  {
    name: "क्विनोआ / Quinoa (Organic) 500g",
    category: "Grains",
    price: 320,
    offerPrice: 275,
    image: ["https://images.unsplash.com/photo-1612257999756-eed5cd8bbf36?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Organic whole quinoa – the complete protein superfood pseudocereal",
      "Contains all 9 essential amino acids – rare in plant foods",
      "Gluten-free, high fibre, ideal for healthy bowls, salads, and pulao",
    ],
    inStock: true,
  },
  {
    name: "चौलाई / Amaranth (Rajgira) 500g",
    category: "Grains",
    price: 190,
    offerPrice: 160,
    image: ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Whole amaranth (rajgira) grain – the vrat (fasting) superfood of India",
      "Rich in protein, lysine, and calcium – gluten-free pseudocereal",
      "Used for rajgira chikki, laddoos, and navratri fasting dishes",
    ],
    inStock: true,
  },
  {
    name: "कुट्टू / Buckwheat (Kuttu) 500g",
    category: "Grains",
    price: 275,
    offerPrice: 240,
    image: ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Whole buckwheat (kuttu) – India's most popular Navratri fasting grain",
      "Gluten-free pseudocereal rich in rutin, magnesium, and antioxidants",
      "Used for kuttu ki puri, pancakes, and buckwheat porridge",
    ],
    inStock: true,
  },
  {
    name: "फॉक्सटेल मिलेट / Foxtail Millet (Kangni) 500g",
    category: "Grains",
    price: 90,
    offerPrice: 76,
    image: ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Ancient Indian foxtail millet – a low glycemic superfood grain",
      "Rich in dietary fibre, iron, and slow-digesting complex carbohydrates",
      "Great substitute for rice – foxtail millet khichdi and upma",
    ],
    inStock: true,
  },
  {
    name: "लिटिल मिलेट / Little Millet (Kutki) 500g",
    category: "Grains",
    price: 115,
    offerPrice: 95,
    image: ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Little millet (kutki/samai) – high fibre and protein ancient grain",
      "Very low glycemic index – ideal for diabetics and weight management",
      "Used in traditional South Indian cuisine as a rice substitute",
    ],
    inStock: true,
  },
  {
    name: "बार्नयार्ड मिलेट / Barnyard Millet (Samak) 500g",
    category: "Grains",
    price: 140,
    offerPrice: 118,
    image: ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Barnyard millet (samak/vrat rice) – the go-to Navratri fasting grain",
      "Gluten-free, lowest glycemic index among all millets",
      "Quick-cooking – used for samak ki khichdi, pulao, and idli",
    ],
    inStock: true,
  },
  {
    name: "राइस फ्लेक्स / Poha (Flattened Rice) Thick 500g",
    category: "Grains",
    price: 65,
    offerPrice: 55,
    image: ["https://images.unsplash.com/photo-1627308595229-7830a5c18037?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Thick flattened rice flakes for making poha, chivda, and chaat",
      "Quick-soaking, no-cook rice – ready in minutes",
      "India's favourite breakfast ingredient – poha is loved nationwide",
    ],
    inStock: true,
  },
  {
    name: "कॉर्न फ्लेक्स / Kellogg's Corn Flakes 475g",
    category: "Grains",
    price: 275,
    offerPrice: 235,
    image: ["https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=500&auto=format&fit=crop&q=60"],
    description: [
      "Kellogg's crispy golden corn flakes – India's No.1 breakfast cereal brand",
      "Light, crunchy, fortified with vitamins and iron",
      "Great with cold milk, fresh fruits, and honey for a quick breakfast",
    ],
    inStock: true,
  },
];

async function main() {
  console.log("🌾 Updating Grains catalog...");

  const existing = await prisma.product.findMany({
    where: { category: "Grains" },
    select: { name: true },
  });
  const existingNames = new Set(existing.map((p) => p.name));

  const toAdd = grainList.filter((p) => !existingNames.has(p.name));
  console.log(`  Found ${existingNames.size} existing Grains items. Adding ${toAdd.length} new items.`);

  if (toAdd.length > 0) {
    await prisma.product.createMany({ data: toAdd });
  }

  const total = await prisma.product.count({ where: { category: "Grains" } });
  console.log(`✅ Grains total now: ${total}`);
}

main()
  .catch((e) => { console.error("Error:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

