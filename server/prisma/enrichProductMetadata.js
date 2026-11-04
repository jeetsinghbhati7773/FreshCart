import prisma from "../config/prisma.js";

const commonBrands = [
  "Amul", "Mother Dairy", "Lay's", "Kurkure", "Bingo!", "Cheetos", "Too Yumm!",
  "Doritos", "Haldiram's", "Bikano", "Unibic", "Snackible", "VayuFarms",
  "Pringles", "FitFeast", "Cadbury", "Nestlé", "Ferrero Rocher", "Snickers",
  "Mars", "Lindt", "Toblerone", "Paul and Mike", "Manam", "Fabelle",
  "Maggi", "Smith & Jones", "Ching's Secret", "Weikfield", "Bambino",
  "MTR", "Sankalp", "Chokhi Dhani", "iD Fresh", "English Oven",
  "The Health Factory", "Modern", "Baker's Loaf", "Protein Chef", "Britannia",
  "Parle-G", "Happilo", "Thums Up", "Coca-Cola", "Pepsi", "Campa Cola",
  "Sprite", "Limca", "7Up", "Mountain Dew", "Fanta", "Mirinda", "Maaza",
  "Frooti", "Slice", "Appy Fizz", "Real", "Red Bull", "Sting", "Rooh Afza",
  "Paper Boat", "Tata Tea", "Red Label", "Nescafe", "Bisleri", "Harvest Gold",
  "Daawat", "Aashirvaad", "Tata Sampann", "Fortune", "Madhur", "Tata Salt",
  "Everest", "MDH", "Quaker", "Kellogg's"
];

async function enrich() {
  const products = await prisma.product.findMany();
  console.log(`Enriching ${products.length} products with brands, units, and stock quantities...`);

  let updated = 0;
  for (const p of products) {
    let brand = p.brand;
    let unit = p.unit;

    // Detect brand
    if (!brand) {
      for (const b of commonBrands) {
        if (p.name.toLowerCase().includes(b.toLowerCase())) {
          brand = b;
          break;
        }
      }
      if (!brand) {
        brand = p.category === "Vegetables" || p.category === "Fruits" ? "Fresh Farm" : "Generic";
      }
    }

    // Detect unit
    if (!unit) {
      const unitMatch = p.name.match(/(\d+(?:\.\d+)?\s*(?:kg|g|gm|ml|l|litre|liter|piece|pcs|bunch|pack|carton|bottle|can))/i);
      if (unitMatch) {
        unit = unitMatch[0].trim();
      } else if (p.category === "Vegetables" || p.category === "Fruits") {
        unit = "1 kg";
      } else {
        unit = "1 Unit";
      }
    }

    await prisma.product.update({
      where: { id: p.id },
      data: {
        brand,
        unit,
        stockQuantity: p.stockQuantity || 50,
        isActive: true,
      },
    });
    updated++;
  }

  console.log(`✅ Successfully enriched metadata for ${updated} products!`);
}

enrich()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

