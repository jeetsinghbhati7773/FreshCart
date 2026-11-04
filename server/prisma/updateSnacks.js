import prisma from "../config/prisma.js";

export const snackList = [
  // 1. Lay's & Classic Potato Chips
  {
    name: "Lay's India's Magic Masala Potato Chips 50g",
    category: "Snacks",
    price: 22,
    offerPrice: 21,
    image: [
      "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "India's iconic blue packet potato chips",
      "Thinly sliced crispy wafers coated with signature Indian spices and tangy mango powder",
      "The undisputed king of spicy Indian potato chips",
    ],
    inStock: true,
  },
  {
    name: "Lay's American Style Cream & Onion Potato Chips 50g",
    category: "Snacks",
    price: 22,
    offerPrice: 21,
    image: [
      "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Creamy, herb-infused classic green pack Lay's",
      "Delicate blend of sour cream and savory spring onions",
      "Crunchy crowd-pleaser snack for movie nights and parties",
    ],
    inStock: true,
  },
  {
    name: "Lay's Classic Salted Potato Chips 50g",
    category: "Snacks",
    price: 22,
    offerPrice: 21,
    image: [
      "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Pure, simple, golden fried potato chips seasoned with fine salt",
      "Yellow pack timeless classic with irresistible crunch",
    ],
    inStock: true,
  },
  {
    name: "Lay's West Indies' Hot 'N' Sweet Chilli Potato Chips 50g",
    category: "Snacks",
    price: 25,
    offerPrice: 21,
    image: [
      "https://images.unsplash.com/photo-1527842891421-42eec6e703ea?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Orange pack sweet heat sensation",
      "Zesty blend of fiery red chillies and sweet undertones",
    ],
    inStock: true,
  },
  {
    name: "Lay's Chile Limon Potato Chips 50g",
    category: "Snacks",
    price: 22,
    offerPrice: 21,
    image: [
      "https://images.unsplash.com/photo-1527842891421-42eec6e703ea?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Tangy lemon zest combined with spicy chilli kick",
      "Bold, citrusy Mexican style flavor crafted for Indian palates",
    ],
    inStock: true,
  },
  {
    name: "Lay's Crispz Herb & Onion Potato Chips 48g",
    category: "Snacks",
    price: 22,
    offerPrice: 20,
    image: [
      "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Extra-crunchy textured potato chips infused with aromatic herbs and onions",
      "Light, airy, and deeply satisfying bite",
    ],
    inStock: true,
  },
  {
    name: "Uncle Chipps Spicy Treat Potato Chips 40g",
    category: "Snacks",
    price: 22,
    offerPrice: 20,
    image: [
      "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Bole Mere Lips, I Love Uncle Chipps! - The pioneer Indian potato chips",
      "Thick, crinkle-cut ridges seasoned with authentic Indian street-style masala",
    ],
    inStock: true,
  },

  // 2. Kurkure, Bingo & Puffed Corn Snacks
  {
    name: "Kurkure Masala Munch Crunchy Snack 45g",
    category: "Snacks",
    price: 22,
    offerPrice: 20,
    image: [
      "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Tedha Hai Par Mera Hai - Iconic crunchy puffed corn curls",
      "Coated with aromatic kitchen spices, red chilli, and amchur",
      "India's all-time favorite crunchy tea-time munch",
    ],
    inStock: true,
  },
  {
    name: "Kurkure Green Chutney Style Crunchy Snack 45g",
    category: "Snacks",
    price: 22,
    offerPrice: 20,
    image: [
      "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Zesty mint and coriander green chutney flavored crunchy curls",
      "Tangy, spicy, and burst-in-mouth flavorful",
    ],
    inStock: true,
  },
  {
    name: "Kurkure Puffcorn Yummy Cheese Snack 55g",
    category: "Snacks",
    price: 22,
    offerPrice: 20,
    image: [
      "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Melt-in-mouth airy puffed corn snack generously coated with yummy cheese",
      "Non-spicy, kid-friendly snack loved by cheese lovers",
    ],
    inStock: true,
  },
  {
    name: "Bingo! Tedhe Medhe Masala Tadka 35g",
    category: "Snacks",
    price: 18,
    offerPrice: 16,
    image: [
      "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Irregular, spindle-shaped crunchy dal and corn sticks",
      "Spicy masala tadka seasoning inspired by Indian street chaat",
    ],
    inStock: true,
  },
  {
    name: "Bingo! Original Style Chilli Sprinkled Potato Chips 45g",
    category: "Snacks",
    price: 22,
    offerPrice: 19,
    image: [
      "https://images.unsplash.com/photo-1527842891421-42eec6e703ea?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Flat-cut crispy potato chips sprinkled with spicy dry red chilli flakes",
      "Light, crunchy, and packed with zesty Indian punch",
    ],
    inStock: true,
  },
  {
    name: "Bingo! Mad Angles Achaari Masti 66g",
    category: "Snacks",
    price: 40,
    offerPrice: 37.5,
    image: [
      "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Unique triangular corn chips seasoned with authentic tangy mango pickle (Achar) masala",
      "Distinct crispy layered texture that crunches in every bite",
    ],
    inStock: true,
  },
  {
    name: "Cheetos Masala Balls Corn Snacks 30g",
    category: "Snacks",
    price: 12,
    offerPrice: 10,
    image: [
      "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Fun spherical corn balls coated with savory Indian masala",
      "Crunchy, airy, and pocket-friendly munching treat",
    ],
    inStock: true,
  },
  {
    name: "Cheetos Cheese Puffs Corn Snacks 30g",
    category: "Snacks",
    price: 12,
    offerPrice: 10,
    image: [
      "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Dangerously cheesy! Soft, airy cheese-flavored puffed corn curls",
      "Melts on the tongue with rich cheddar taste",
    ],
    inStock: true,
  },

  // 3. Nachos & Spicy Tortilla Chips
  {
    name: "Too Yumm! Bhoot Chips (Fiery Ghost Pepper) 45g",
    category: "Snacks",
    price: 42,
    offerPrice: 38,
    image: [
      "https://images.unsplash.com/photo-1527842891421-42eec6e703ea?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Fiery potato and corn crisps spiced with Assam's famous Bhut Jolokia ghost pepper",
      "For true spice adventurers who love extreme chilli challenges",
    ],
    inStock: true,
  },
  {
    name: "Doritos Nacho Cheese Tortilla Chips 40g",
    category: "Snacks",
    price: 40,
    offerPrice: 35,
    image: [
      "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Tooth-rattling crunch triangular corn tortilla chips",
      "Coated with bold, tangy melted nacho cheese seasoning",
      "Best paired with cheesy jalapeno dip or salsa",
    ],
    inStock: true,
  },
  {
    name: "Doritos Sweet Chilli Tortilla Chips 40g",
    category: "Snacks",
    price: 45,
    offerPrice: 40,
    image: [
      "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Crispy triangular tortilla chips with sweet and spicy glaze",
      "Intense balance of soy, red pepper, and sweet chilli",
    ],
    inStock: true,
  },
  {
    name: "Doritos Dinamita Fiery Lime & Chilli Rolled Tortilla Chips 55g",
    category: "Snacks",
    price: 50,
    offerPrice: 48,
    image: [
      "https://images.unsplash.com/photo-1527842891421-42eec6e703ea?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Tightly rolled explosive tortilla chips packed with hot chilli and zesty lime",
      "Unmatched crunch with a dynamite flavor explosion",
    ],
    inStock: true,
  },
  {
    name: "PEPPY Cheese Balls Crunchy Snack 65g",
    category: "Snacks",
    price: 60,
    offerPrice: 56,
    image: [
      "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Nostalgic Indian cheese balls in yellow foil pack",
      "Crispy round spheres baked to perfection with rich savory cheese",
    ],
    inStock: true,
  },

  // 4. Traditional Indian Namkeen & Lachha
  {
    name: "Haldiram's Chilli Chatak Lachha Potato Sticks 200g",
    category: "Snacks",
    price: 65,
    offerPrice: 61.9,
    image: [
      "https://images.unsplash.com/photo-1621996346565-e3d5d6281781?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Crispy shoestring potato sticks seasoned with fiery red chilli and spices",
      "Classic spicy crunch to elevate drinks and evening tea",
    ],
    inStock: true,
  },
  {
    name: "Bikano Aloo Lachha Masala Namkeen 150g",
    category: "Snacks",
    price: 50,
    offerPrice: 47.6,
    image: [
      "https://images.unsplash.com/photo-1621996346565-e3d5d6281781?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Fine shredded potato lachha namkeen spiced with black pepper, mint, and spices",
      "Golden fried and non-greasy traditional teatime companion",
    ],
    inStock: true,
  },
  {
    name: "Sweet Karam Coffee Andhra Spicy Murukku 180g",
    category: "Snacks",
    price: 95,
    offerPrice: 86,
    image: [
      "https://images.unsplash.com/photo-1621996346565-e3d5d6281781?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Traditional South Indian handmade spiral murukku (Chakli)",
      "Crafted with rice flour, roasted gram, sesame, and authentic Andhra red chillies",
      "Authentic grandmother's recipe with divine crunch",
    ],
    inStock: true,
  },

  // 5. Banana & Exotic Chips
  {
    name: "Unibic Kerala Banana Chips Classic Salted 100g",
    category: "Snacks",
    price: 45,
    offerPrice: 43,
    image: [
      "https://images.unsplash.com/photo-1621996346565-e3d5d6281781?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Authentic raw Nendran banana chips fried in pure coconut oil",
      "Lightly salted, wafer-thin golden crisps with signature Kerala aroma",
    ],
    inStock: true,
  },
  {
    name: "Seung Toko Korean Kimchi Banana Chips 80g",
    category: "Snacks",
    price: 50,
    offerPrice: 48,
    image: [
      "https://images.unsplash.com/photo-1621996346565-e3d5d6281781?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Fusion of crisp Kerala banana chips and spicy Korean kimchi seasoning",
      "Sweet, savoury, and tangy gourmet snacking experience",
    ],
    inStock: true,
  },

  // 6. Healthy Millet, Ragi & Veggie Chips
  {
    name: "Snackible Peri Peri Ragi Chips 85g",
    category: "Snacks",
    price: 50,
    offerPrice: 45,
    image: [
      "https://images.unsplash.com/photo-1621996346565-e3d5d6281781?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Guilt-free baked finger millet (Ragi) chips tossed in spicy African Peri Peri seasoning",
      "Rich in calcium, high in dietary fiber, zero trans fat",
    ],
    inStock: true,
  },
  {
    name: "Snackible Masala Mania Beetroot Chips 75g",
    category: "Snacks",
    price: 55,
    offerPrice: 50,
    image: [
      "https://images.unsplash.com/photo-1621996346565-e3d5d6281781?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Vibrant real vacuum-cooked beetroot chips with chatpata masala seasoning",
      "Retains natural nutrients, iron, and deep ruby color without artificial colors",
    ],
    inStock: true,
  },
  {
    name: "Snackible Sweet Chilli Jowar Chips 85g",
    category: "Snacks",
    price: 55,
    offerPrice: 50,
    image: [
      "https://images.unsplash.com/photo-1621996346565-e3d5d6281781?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Gluten-free sorghum (Jowar) crisps spiced with sweet chilli glaze",
      "Ancient Indian super-grain transformed into a crunchy modern snack",
    ],
    inStock: true,
  },
  {
    name: "Snackible Cheese and Herb Multigrain Chips 85g",
    category: "Snacks",
    price: 60,
    offerPrice: 55,
    image: [
      "https://images.unsplash.com/photo-1621996346565-e3d5d6281781?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Blend of 5 super grains (Oats, Ragi, Corn, Wheat & Rice) dusted with cheese and herbs",
      "Wholesome baked crunch with delightful cheesy herbal aroma",
    ],
    inStock: true,
  },
  {
    name: "VayuFarms Ragi Chips Masala 150g",
    category: "Snacks",
    price: 135,
    offerPrice: 125,
    image: [
      "https://images.unsplash.com/photo-1621996346565-e3d5d6281781?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Farm-crafted artisanal millet chips prepared using whole finger millet grains",
      "Seasoned with roasted cumin, rock salt, and Indian spices",
    ],
    inStock: true,
  },
  {
    name: "VayuFarms Beetroot Chips Masala 200g",
    category: "Snacks",
    price: 270,
    offerPrice: 250,
    image: [
      "https://images.unsplash.com/photo-1621996346565-e3d5d6281781?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Premium vacuum-fried whole organic beetroot crisps",
      "Low oil absorption, preserves 90% of natural root nutrients and crunch",
    ],
    inStock: true,
  },
  {
    name: "Pringles Ketchup Stacked Potato Crisps 165g",
    category: "Snacks",
    price: 125,
    offerPrice: 110,
    image: [
      "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Once You Pop, The Fun Don't Stop! - Iconic saddle-shaped stacked crisps in resealable can",
      "Sweet, tangy, tomato ketchup coating on uniform crunchy chips",
    ],
    inStock: true,
  },
  {
    name: "Chatpata Crunch Ragi Chips 100g",
    category: "Snacks",
    price: 65,
    offerPrice: 60,
    image: [
      "https://images.unsplash.com/photo-1621996346565-e3d5d6281781?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Crunchy roasted ragi millet chips bursting with tangy chaat masala flavor",
      "Healthy snacking alternative for health-conscious foodies",
    ],
    inStock: true,
  },
  {
    name: "FitFeast High Protein Multi-Grain Chips 60g",
    category: "Snacks",
    price: 85,
    offerPrice: 75,
    image: [
      "https://images.unsplash.com/photo-1621996346565-e3d5d6281781?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "12g of plant protein per pack from isolated pea and soy protein",
      "Slow-baked multigrain crisps for fitness enthusiasts and gym goers",
    ],
    inStock: true,
  },
  {
    name: "Amul Salted Potato Chips (Standard Pack, 45g)",
    category: "Snacks",
    price: 22,
    offerPrice: 20,
    image: [
      "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Pure potato wafers made with farm fresh potatoes and sea salt",
      "Simple, crispy, homestyle potato chips from trusted Amul quality",
    ],
    inStock: true,
  },

  // 7. Iconic Biscuits, Chocolates & Dry Fruits
  {
    name: "Parle-G Original Glucose Biscuits 800g Family Pack",
    category: "Snacks",
    price: 80,
    offerPrice: 70,
    image: [
      "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "India's iconic tea-time biscuit loved across generations",
      "Crispy, wholesome glucose and milk goodness",
      "Best enjoyed dipped into a hot cup of cutting chai",
    ],
    inStock: true,
  },
  {
    name: "Britannia Good Day Butter Cookies 200g",
    category: "Snacks",
    price: 45,
    offerPrice: 38,
    image: [
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Rich, crunchy butter cookies with a smiling design",
      "Melt-in-mouth texture with rich buttery aroma",
    ],
    inStock: true,
  },
  {
    name: "Haldiram's Nagpur Aloo Bhujia 400g",
    category: "Snacks",
    price: 115,
    offerPrice: 99,
    image: [
      "https://images.unsplash.com/photo-1621996346565-e3d5d6281781?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "India's favorite crispy potato and gram flour namkeen",
      "Seasoned with a tangy blend of mint, spices, and black salt",
      "Irresistibly addictive tea-time munching snack",
    ],
    inStock: true,
  },
  {
    name: "Haldiram's Khatta Meetha Namkeen 400g",
    category: "Snacks",
    price: 105,
    offerPrice: 89,
    image: [
      "https://images.unsplash.com/photo-1621996346565-e3d5d6281781?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Delightful sweet & tangy mixture of sev, boondi, puffed rice, and peanuts",
      "Perfect party mix and evening snacking companion",
    ],
    inStock: true,
  },
  {
    name: "Cadbury Dairy Milk Silk Chocolate Bar 150g",
    category: "Snacks",
    price: 175,
    offerPrice: 155,
    image: [
      "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Silky smooth, rich milk chocolate that melts seamlessly",
      "India's most cherished celebratory chocolate",
    ],
    inStock: true,
  },
  {
    name: "Happilo Premium California Roasted Almonds 200g",
    category: "Snacks",
    price: 260,
    offerPrice: 219,
    image: [
      "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Slow-roasted, lightly salted premium whole California almonds",
      "Packed with Vitamin E, protein, and heart-healthy good fats",
    ],
    inStock: true,
  },
  {
    name: "Happilo Premium Whole Cashews (Kaju) 200g",
    category: "Snacks",
    price: 290,
    offerPrice: 249,
    image: [
      "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Crunchy, creamy grade-A whole cashew nuts",
      "Great for healthy snacking, kheer garnish, and rich curry pastes",
    ],
    inStock: true,
  },
];

async function main() {
  console.log("🍟 Updating snacks & chips catalog to match exact list and prices...");

  const deleted = await prisma.product.deleteMany({
    where: { category: "Snacks" },
  });
  console.log(`  Removed ${deleted.count} old snacks entries.`);

  await prisma.product.createMany({
    data: snackList,
  });

  const count = await prisma.product.count({ where: { category: "Snacks" } });
  console.log(`✅ Successfully added all ${count} snacks & chips products!`);
}

main()
  .catch((e) => {
    console.error("Error updating snacks:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

