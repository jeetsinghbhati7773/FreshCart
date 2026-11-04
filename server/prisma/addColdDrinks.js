import prisma from "../config/prisma.js";

const coldDrinks = [
  // 1. Colas
  {
    name: "Thums Up Charged Strong Cola 300ml Can",
    category: "Drinks",
    price: 40,
    offerPrice: 35,
    image: [
      "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "India's highest-selling strong cola brand",
      "Known for its punchy fizz, bold spice notes, and thunderous taste",
      "Best served ice cold with spicy Indian street food",
    ],
    inStock: true,
  },
  {
    name: "Coca-Cola Original Taste 750ml Bottle",
    category: "Drinks",
    price: 45,
    offerPrice: 40,
    image: [
      "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "The classic global cola leader with delicious refreshing taste",
      "Crisp carbonation and iconic caramel flavor",
      "Perfect pairing for family meals, biryani, and celebrations",
    ],
    inStock: true,
  },
  {
    name: "Pepsi Crisp Sweet Cola 750ml Bottle",
    category: "Drinks",
    price: 45,
    offerPrice: 40,
    image: [
      "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Universally favorite crisp, sweet, and bold cola brand",
      "Refreshing carbonated fizz that elevates every meal",
      "Best enjoyed chilled on hot afternoons",
    ],
    inStock: true,
  },
  {
    name: "Campa Cola Great Indian Taste 500ml Bottle",
    category: "Drinks",
    price: 20,
    offerPrice: 18,
    image: [
      "https://images.unsplash.com/photo-1581098365948-6a5a912b7a49?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "The nostalgic Great Indian Taste brand made a massive comeback",
      "Budget-friendly, refreshing cola fizz packed with bold flavour",
      "Authentic Indian heritage cold drink",
    ],
    inStock: true,
  },

  // 2. Lemon-Lime, Citrus & Orange Sodas
  {
    name: "Sprite Crisp Lemon-Lime Soda 750ml Bottle",
    category: "Drinks",
    price: 45,
    offerPrice: 40,
    image: [
      "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Crisp, clean lemon-lime carbonated soda that clears your mind",
      "Dominates India's clear soda segment with zero caffeine",
      "Thirst-quenching citrus burst best served chilled",
    ],
    inStock: true,
  },
  {
    name: "Limca Fresh Lemon-Lime Fizzy Drink 750ml Bottle",
    category: "Drinks",
    price: 45,
    offerPrice: 40,
    image: [
      "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Classic Indian cloudy lemon-lime fizzy drink refreshing consumers since 1971",
      "Distinct tangy lime-lemony punch with bubbly effervescence",
      "The ultimate refresher after sports or travel",
    ],
    inStock: true,
  },
  {
    name: "7Up Citrus Lemon-Lime Soda 750ml Bottle",
    category: "Drinks",
    price: 45,
    offerPrice: 40,
    image: [
      "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Light, bubbly, citrusy lemon-lime carbonated beverage",
      "Clean, crisp taste made to refresh your mood instantly",
      "100% naturally flavored and caffeine-free",
    ],
    inStock: true,
  },
  {
    name: "Mountain Dew Citrus Carbonated Drink 750ml Bottle",
    category: "Drinks",
    price: 45,
    offerPrice: 40,
    image: [
      "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Darr Ke Aage Jeet Hai - High-energy citrus-flavored carbonated soft drink",
      "Electric neon-green fizz with a bold, exhilarating citrus kick",
      "Popular energizing favorite among Indian youth",
    ],
    inStock: true,
  },
  {
    name: "Fanta Sweet Orange Carbonated Drink 750ml Bottle",
    category: "Drinks",
    price: 45,
    offerPrice: 40,
    image: [
      "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Bright, intensely fruity, sweet orange-flavored carbonated soft drink",
      "Lively tingling bubbles with bold orange aroma",
      "Brings instant fruity fun to snacks and birthday parties",
    ],
    inStock: true,
  },
  {
    name: "Mirinda Orange Flavoured Fizzy Drink 750ml Bottle",
    category: "Drinks",
    price: 45,
    offerPrice: 40,
    image: [
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Pagalpanti Bhi Zaroori Hai - Vibrant orange-flavored fizzy drink",
      "Explosive citrus fruitiness with sharp effervescence",
      "Irresistible accompaniment to samosas and chaats",
    ],
    inStock: true,
  },

  // 3. Mango & Fruit Drinks
  {
    name: "Maaza Thick Real Mango Drink 1.2L Bottle",
    category: "Drinks",
    price: 75,
    offerPrice: 65,
    image: [
      "https://images.unsplash.com/photo-1546173159-315724a31696?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "India's top-selling rich, thick, and pulpy mango drink from Coca-Cola",
      "Crafted from hand-picked real Alphonso mango pulp",
      "Har Mausam Aam - Enjoy royal mango indulgence anytime",
    ],
    inStock: true,
  },
  {
    name: "Frooti Fresh 'N' Juicy Mango Drink 1.2L Bottle",
    category: "Drinks",
    price: 75,
    offerPrice: 65,
    image: [
      "https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "The iconic pioneer of mango drinks by Parle Agro",
      "Sweet, tangy mango juice packed with real fruit goodness",
      "Nostalgic favorite for kids and mango lovers across India",
    ],
    inStock: true,
  },
  {
    name: "Slice Thick Mango Fruit Drink 1.2L Bottle",
    category: "Drinks",
    price: 75,
    offerPrice: 65,
    image: [
      "https://images.unsplash.com/photo-1601039641847-7857b994d704?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Aasli Aam Ka Swad - Smooth, luscious, and velvety mango fruit drink",
      "Prepared with succulent Ratnagiri Alphonso mangoes",
      "Delivers pure mango euphoria in every chilled sip",
    ],
    inStock: true,
  },
  {
    name: "Appy Fizz Sparkling Apple Juice Drink 600ml Bottle",
    category: "Drinks",
    price: 40,
    offerPrice: 35,
    image: [
      "https://images.unsplash.com/photo-1568644396922-5c3bfae12521?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "The cool drink to hang out with - Sparkling, carbonated apple juice drink",
      "Crafted with crisp apple juice concentrate in sleek packaging",
      "Bubbly, light, and sophisticated apple refresher",
    ],
    inStock: true,
  },
  {
    name: "Real Fruit Power Mixed Fruit Juice 1L",
    category: "Drinks",
    price: 125,
    offerPrice: 105,
    image: [
      "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Leading packaged fruit juice brand in India offering diverse tropical fruits",
      "Wholesome blend of 9 fruits with zero added preservatives",
      "Rich source of natural Vitamin C and daily dietary nutrients",
    ],
    inStock: true,
  },

  // 4. Energy & Functional Drinks
  {
    name: "Red Bull Energy Drink 250ml Can",
    category: "Drinks",
    price: 125,
    offerPrice: 115,
    image: [
      "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Gives You Wiiings - The globally dominant energy drink",
      "Formulated with high-grade caffeine, taurine, B-group vitamins, and sugars",
      "Vitalizes body and mind during work, long drives, or sports",
    ],
    inStock: true,
  },
  {
    name: "Sting Energy Drink 250ml Bottle",
    category: "Drinks",
    price: 20,
    offerPrice: 18,
    image: [
      "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Electrifying red energy drink with a punch of caffeine and ginseng",
      "High-energy, value-priced carbonated rush popular across local shops",
      "Instant refreshment and alertness boost on a budget",
    ],
    inStock: true,
  },

  // 5. Traditional, Regional & Dairy-Based Refreshers
  {
    name: "Hamdard Rooh Afza Herbal Rose Sharbat 750ml",
    category: "Drinks",
    price: 170,
    offerPrice: 155,
    image: [
      "https://images.unsplash.com/photo-1556881286-fc6915169721?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "A historic rose-and-herbal concentrate beloved across India since 1907",
      "Cooling natural distillates of mint, water lily, rose, and citrus",
      "Best enjoyed mixed with ice-cold milk, water, or falooda",
    ],
    inStock: true,
  },
  {
    name: "Paper Boat Traditional Aam Panna Cooler 200ml",
    category: "Drinks",
    price: 35,
    offerPrice: 30,
    image: [
      "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Iconic nostalgic traditional Indian cooler made from raw green mangoes (Kairi)",
      "Infused with roasted cumin (Jeera), mint, and black salt",
      "Natural heat-stroke prevention drink straight from grandmother's kitchen",
    ],
    inStock: true,
  },
  {
    name: "Amul Masti Spiced Buttermilk (Chaas) 200ml Tetra Pack",
    category: "Drinks",
    price: 15,
    offerPrice: 13,
    image: [
      "https://images.unsplash.com/photo-1570696516188-ade861b84a49?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Chilled, traditional spiced chaas (buttermilk) staple for Indian summers",
      "Prepared from fresh curd blended with green chillies, ginger, and cumin",
      "Cooling digestive probiotic beverage, light and hydrating",
    ],
    inStock: true,
  },
];

async function main() {
  console.log("🥤 Checking and adding requested Indian cold drinks...");

  const existingProducts = await prisma.product.findMany({
    select: { id: true, name: true },
  });

  const existingNamesLower = new Set(
    existingProducts.map((p) => p.name.toLowerCase().trim())
  );

  let addedCount = 0;
  let skippedCount = 0;

  for (const drink of coldDrinks) {
    // Check if matching drink name already exists
    const isPresent = [...existingNamesLower].some((existing) => {
      const dName = drink.name.toLowerCase();
      // Match key brand name
      if (dName.includes("thums up") && existing.includes("thums up")) return true;
      if (dName.includes("frooti") && existing.includes("frooti")) return true;
      if (dName.includes("rooh afza") && existing.includes("rooh afza")) return true;
      if (dName.includes("coca-cola") && existing.includes("coca-cola")) return true;
      if (dName.includes("pepsi") && existing.includes("pepsi")) return true;
      if (dName.includes("campa") && existing.includes("campa")) return true;
      if (dName.includes("sprite") && existing.includes("sprite")) return true;
      if (dName.includes("limca") && existing.includes("limca")) return true;
      if (dName.includes("7up") && existing.includes("7up")) return true;
      if (dName.includes("mountain dew") && existing.includes("mountain dew")) return true;
      if (dName.includes("fanta") && existing.includes("fanta")) return true;
      if (dName.includes("mirinda") && existing.includes("mirinda")) return true;
      if (dName.includes("maaza") && existing.includes("maaza")) return true;
      if (dName.includes("slice") && existing.includes("slice")) return true;
      if (dName.includes("appy fizz") && existing.includes("appy fizz")) return true;
      if (dName.includes("real fruit") && existing.includes("real fruit")) return true;
      if (dName.includes("red bull") && existing.includes("red bull")) return true;
      if (dName.includes("sting") && existing.includes("sting")) return true;
      if (dName.includes("paper boat") && existing.includes("paper boat")) return true;
      if (dName.includes("amul masti") && existing.includes("amul masti")) return true;
      return existing === dName;
    });

    if (isPresent) {
      console.log(`  ✓ Already present: ${drink.name}`);
      skippedCount++;
    } else {
      await prisma.product.create({
        data: drink,
      });
      console.log(`  + Added: ${drink.name}`);
      existingNamesLower.add(drink.name.toLowerCase().trim());
      addedCount++;
    }
  }

  console.log(`\n🎉 Finished! Added: ${addedCount}, Skipped: ${skippedCount}`);
  const totalDrinks = await prisma.product.count({ where: { category: "Drinks" } });
  console.log(`Total drinks in database: ${totalDrinks}`);
}

main()
  .catch((e) => {
    console.error("Error adding cold drinks:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

