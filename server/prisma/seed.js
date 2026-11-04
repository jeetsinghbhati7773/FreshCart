import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const indianProducts = [
  // ==========================================
  // 1. VEGETABLES (Sabzi)
  // ==========================================
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

  // ==========================================
  // 2. FRUITS (Phal)
  // ==========================================
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

  // ==========================================
  // 3. DAIRY PRODUCTS (Doodh & Dahi)
  // ==========================================
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

  // ==========================================
  // 4. GRAINS & CEREALS (Anaaj, Atta & Dals)
  // ==========================================
  {
    name: "Daawat Rozana Super Basmati Rice 5kg",
    category: "Grains",
    price: 450,
    offerPrice: 389,
    image: [
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Aromatic, slender long-grain Himalayan Basmati Rice",
      "Aged to perfection for fluffy, non-sticky grains after cooking",
      "Ideal for daily meals, biryani, jeera rice, and pulao",
    ],
    inStock: true,
  },
  {
    name: "Aashirvaad Shudh Chakki Whole Wheat Atta 5kg",
    category: "Grains",
    price: 255,
    offerPrice: 230,
    image: [
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "100% pure whole wheat grain flour ground by traditional chakki",
      "Zero maida added; retains whole dietary fiber",
      "Produces exceptionally soft, fluffy rotis that stay fresh longer",
    ],
    inStock: true,
  },
  {
    name: "Tata Sampann Unpolished Toor Dal 1kg",
    category: "Grains",
    price: 185,
    offerPrice: 165,
    image: [
      "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Unpolished arhar/toor dal without artificial water, oil or stone polish",
      "Rich in natural protein, iron, and folic acid",
      "Essential soul food for Indian Dal Tadka and Sambar",
    ],
    inStock: true,
  },
  {
    name: "Tata Sampann Unpolished Moong Dal 1kg",
    category: "Grains",
    price: 160,
    offerPrice: 142,
    image: [
      "https://images.unsplash.com/photo-1585727788461-ea3b6647249b?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Yellow split moong dal, light on the stomach and easy to digest",
      "High protein lentil for khichdi, dal fry, and moong dal cheela",
    ],
    inStock: true,
  },
  {
    name: "Fortune Sunlite Refined Sunflower Oil 1L",
    category: "Grains",
    price: 145,
    offerPrice: 130,
    image: [
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Light, non-greasy cooking oil enriched with Vitamins A, D & E",
      "High smoke point, perfect for daily Indian frying and sautéing",
    ],
    inStock: true,
  },
  {
    name: "Fortune Kachi Ghani Pure Mustard Oil 1L",
    category: "Grains",
    price: 165,
    offerPrice: 148,
    image: [
      "https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Cold-pressed pungent mustard oil (Sarson ka Tel)",
      "Traditional flavor essential for North and East Indian delicacies & pickles",
    ],
    inStock: true,
  },
  {
    name: "Madhur Pure & Hygienic Sugar 1kg",
    category: "Grains",
    price: 52,
    offerPrice: 46,
    image: [
      "https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Sulphur-free, refined sparkling white sugar crystals",
      "Untouched by hand, 100% hygienic for sweetening tea, coffee, and halwa",
    ],
    inStock: true,
  },
  {
    name: "Tata Salt Vacuum Evaporated Iodized Salt 1kg",
    category: "Grains",
    price: 28,
    offerPrice: 25,
    image: [
      "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Desh Ka Namak - Vacuum evaporated iodized table salt",
      "Purity guaranteed, free-flowing crystals for precise seasoning",
    ],
    inStock: true,
  },
  {
    name: "Everest Pure Turmeric Powder (Haldi) 200g",
    category: "Grains",
    price: 65,
    offerPrice: 55,
    image: [
      "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "High Curcumin turmeric powder with deep golden hue",
      "Powerful antiseptic, antioxidant culinary spice for every curry",
    ],
    inStock: true,
  },
  {
    name: "MDH Deggi Mirch Red Chilli Powder 100g",
    category: "Grains",
    price: 85,
    offerPrice: 75,
    image: [
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Special blend of Indian red peppers for vibrant natural curry color and mild heat",
      "Secret behind restaurant-style Indian gravies",
    ],
    inStock: true,
  },

  // ==========================================
  // 5. INSTANT FOOD (Noodles, Soups & Mixes)
  // ==========================================
  {
    name: "Maggi 2-Minute Masala Noodles 280g (Pack of 4)",
    category: "Instant",
    price: 56,
    offerPrice: 50,
    image: [
      "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "India's beloved 2-minute instant noodles",
      "Authentic blend of 10 roasted spices in every Tastemaker sachet",
      "Unmatched comfort food for late nights and rainy evenings",
    ],
    inStock: true,
  },
  {
    name: "Sunfeast YiPPee! Magic Masala Noodles 240g",
    category: "Instant",
    price: 50,
    offerPrice: 44,
    image: [
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Long, round, non-sticky instant noodles with real veggies",
      "Bursting with tangy magic masala spices",
    ],
    inStock: true,
  },
  {
    name: "Ching's Secret Schezwan Instant Noodles 240g",
    category: "Instant",
    price: 55,
    offerPrice: 48,
    image: [
      "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Desi Chinese style fiery Schezwan noodles",
      "Loaded with garlic, red chillies, and bold Sichuan pepper aroma",
    ],
    inStock: true,
  },
  {
    name: "Knorr Mixed Vegetable Soup 43g",
    category: "Instant",
    price: 40,
    offerPrice: 32,
    image: [
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Hearty, warming vegetable soup ready in just 3 minutes",
      "Made with 100% real vegetables, no added preservatives",
    ],
    inStock: true,
  },
  {
    name: "MTR Ready-to-Eat Paneer Butter Masala 300g",
    category: "Instant",
    price: 130,
    offerPrice: 115,
    image: [
      "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Soft paneer cubes simmered in a creamy, buttery tomato-onion gravy",
      "Just heat in boiling water or microwave for 2 minutes",
      "Zero preservatives, authentic Indian restaurant taste",
    ],
    inStock: true,
  },
  {
    name: "MTR Minute Rava Idli Breakfast Mix 500g",
    category: "Instant",
    price: 120,
    offerPrice: 105,
    image: [
      "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Traditional South Indian instant breakfast mix",
      "Makes super soft, steaming hot Rava Idlis in minutes",
      "Just mix with curd and steam for a wholesome breakfast",
    ],
    inStock: true,
  },
  {
    name: "Kissan Fresh Tomato Ketchup 1kg Bottle",
    category: "Instant",
    price: 145,
    offerPrice: 125,
    image: [
      "https://images.unsplash.com/photo-1589135233689-d65287d3a033?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Made from 100% real juicy Indian farm-grown tomatoes",
      "Irreplaceable sweet and tangy dip for samosas, pakoras, and french fries",
    ],
    inStock: true,
  },
  {
    name: "Mother's Recipe Mixed Pickle (Achar) 400g",
    category: "Instant",
    price: 110,
    offerPrice: 95,
    image: [
      "https://images.unsplash.com/photo-1589135233689-d65287d3a033?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Traditional Indian achar crafted with mango, lime, carrot, and green chilli",
      "Matured in mustard oil and aromatic spices",
      "Adds fiery nostalgic taste to dal chawal and parathas",
    ],
    inStock: true,
  },

  // ==========================================
  // 6. SNACKS (Namkeen, Chips & Biscuits)
  // ==========================================
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
    name: "Lay's India's Magic Masala Potato Chips 50g",
    category: "Snacks",
    price: 20,
    offerPrice: 18,
    image: [
      "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Thinly sliced crispy potato wafers coated with signature Indian spices",
      "Unmatched burst of tangy masala in every crunchy bite",
    ],
    inStock: true,
  },
  {
    name: "Kurkure Masala Munch Crispy Snack 90g",
    category: "Snacks",
    price: 20,
    offerPrice: 18,
    image: [
      "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Tedha hai par mera hai! Crispy, crunchy puffed corn curls",
      "Flavored with authentic Indian kitchen spices",
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

  // ==========================================
  // 7. DRINKS (Chai, Coffee, Soft Drinks & Beverages)
  // ==========================================
  // Colas
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

  // Lemon-Lime, Citrus & Orange Sodas
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

  // Mango & Fruit Drinks
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

  // Energy & Functional Drinks
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

  // Traditional, Regional & Dairy-Based Refreshers
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

  // Chai, Coffee & Packaged Water
  {
    name: "Tata Tea Premium Desh Ki Chai 500g",
    category: "Drinks",
    price: 260,
    offerPrice: 235,
    image: [
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Desh Ki Chai - Unique blend of big tea leaves for aroma and small grains for strength",
      "Gives rich amber color and invigorating morning energy",
    ],
    inStock: true,
  },
  {
    name: "Red Label Strong Natural Care Black Tea 500g",
    category: "Drinks",
    price: 290,
    offerPrice: 260,
    image: [
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Enhanced with 5 Ayurvedic ingredients: Ashwagandha, Tulsi, Mulethi, Cardamom & Ginger",
      "Clinically proven to help build daily immunity",
    ],
    inStock: true,
  },
  {
    name: "Nescafe Classic 100% Pure Instant Coffee Jar 100g",
    category: "Drinks",
    price: 340,
    offerPrice: 299,
    image: [
      "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "100% pure coffee crafted from finest Robusta coffee beans",
      "Rich roasted aroma and distinct bold flavor",
      "Delicious as piping hot morning coffee or frothy iced cold coffee",
    ],
    inStock: true,
  },
  {
    name: "Cadbury Bournvita Chocolate Health Drink 500g",
    category: "Drinks",
    price: 245,
    offerPrice: 220,
    image: [
      "https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Malted chocolate drink mix enriched with Vitamin D, Iron, and Vitamin C",
      "Supports strong bones and healthy muscle growth for kids and adults",
    ],
    inStock: true,
  },
  {
    name: "Bisleri Purified Mineral Water 1L Bottle (Pack of 2)",
    category: "Drinks",
    price: 40,
    offerPrice: 36,
    image: [
      "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Purified with 10-step purification process and enriched with minerals",
      "Safe, pure, and trusted hydration everywhere",
    ],
    inStock: true,
  },

  // ==========================================
  // 8. BAKERY & BREADS (Pav, Roti & Cakes)
  // ==========================================
  {
    name: "Harvest Gold 100% Atta Whole Wheat Brown Bread 400g",
    category: "Bakery",
    price: 45,
    offerPrice: 40,
    image: [
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "100% whole wheat flour with zero added maida",
      "Soft slices packed with dietary fiber for healthy digestion",
      "Perfect for healthy morning toasts and vegetable sandwiches",
    ],
    inStock: true,
  },
  {
    name: "Harvest Gold White Bread Family Pack 400g",
    category: "Bakery",
    price: 38,
    offerPrice: 34,
    image: [
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Classic super soft white bread slices freshly baked everyday",
      "Great for butter toast, bread pakora, and grilled cheese sandwiches",
    ],
    inStock: true,
  },
  {
    name: "Fresh Pav Buns (Pack of 6)",
    category: "Bakery",
    price: 30,
    offerPrice: 25,
    image: [
      "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Ultra-soft, fluffy Mumbai-style bakery ladi pav buns",
      "Indispensable partner for street-style Pav Bhaji, Vada Pav, and Misal",
    ],
    inStock: true,
  },
  {
    name: "Britannia Veg Fruit Cake 120g",
    category: "Bakery",
    price: 35,
    offerPrice: 30,
    image: [
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Soft, spongy, eggless tea cake embedded with colorful candied tutti-frutti",
      "Sweet snack to enjoy with your evening tea or coffee",
    ],
    inStock: true,
  },
  {
    name: "Britannia Choco Chill Chocolate Cake 120g",
    category: "Bakery",
    price: 35,
    offerPrice: 30,
    image: [
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Moist, decadent chocolate sponge cake infused with rich cocoa",
      "Quick dessert treat for chocolate cravings",
    ],
    inStock: true,
  },
  {
    name: "Fresh Butter Croissants (Pack of 2)",
    category: "Bakery",
    price: 110,
    offerPrice: 90,
    image: [
      "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=60",
    ],
    description: [
      "Golden, flaky, flaky layered French croissants made with real butter",
      "Delightful bakery luxury for Sunday breakfasts",
    ],
    inStock: true,
  },

  // ==========================================
  // 9. CHOCOLATES (added to Snacks)
  // ==========================================
  { name: "Cadbury Dairy Milk Chocolate Bar 40g", category: "Snacks", price: 50, offerPrice: 40, image: ["https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500&auto=format&fit=crop&q=60"], description: ["India's most-loved creamy milk chocolate since 1948", "Smooth, melt-in-mouth texture with rich cocoa and milk notes", "Perfect gifting chocolate for every occasion"], inStock: true },
  { name: "Cadbury Dairy Milk Silk Oreo Chocolate Bar 130g", category: "Snacks", price: 190, offerPrice: 165, image: ["https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=500&auto=format&fit=crop&q=60"], description: ["Premium Silk chocolate layered with crunchy Oreo cookie bits", "Irresistible combo of creamy milk chocolate and biscuit crunch"], inStock: true },
  { name: "Cadbury 5 Star Chocolate Bar 40g", category: "Snacks", price: 40, offerPrice: 30, image: ["https://images.unsplash.com/photo-1575377427642-087cf684f29d?w=500&auto=format&fit=crop&q=60"], description: ["Chewy caramel and nougat coated in smooth milk chocolate", "India's iconic 'Get Lost' chocolate bar loved for decades"], inStock: true },
  { name: "Cadbury Perk Chocolate Bar 36g", category: "Snacks", price: 20, offerPrice: 15, image: ["https://images.unsplash.com/photo-1575377427642-087cf684f29d?w=500&auto=format&fit=crop&q=60"], description: ["Light, crunchy wafer fingers dipped in smooth Cadbury chocolate", "Popular anytime snack chocolate"], inStock: true },
  { name: "KitKat 4-Finger Milk Chocolate 41.5g", category: "Snacks", price: 50, offerPrice: 40, image: ["https://images.unsplash.com/photo-1619740445970-e02d5bfb3161?w=500&auto=format&fit=crop&q=60"], description: ["Crispy wafer fingers covered in smooth Nestlé milk chocolate", "Have a break, have a KitKat! – iconic global chocolate loved in India"], inStock: true },
  { name: "Nestlé Milkybar White Chocolate 30g", category: "Snacks", price: 30, offerPrice: 22, image: ["https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=500&auto=format&fit=crop&q=60"], description: ["Smooth, creamy pure white chocolate loved by children across India", "Made from real milk solids for a rich milky taste"], inStock: true },
  { name: "Nestlé KitKat Mini Chocolate Sharebag 200g", category: "Snacks", price: 250, offerPrice: 210, image: ["https://images.unsplash.com/photo-1619740445970-e02d5bfb3161?w=500&auto=format&fit=crop&q=60"], description: ["Pack of bite-sized KitKat mini bars perfect for sharing", "Great for parties, gifting, and office sharing"], inStock: true },
  { name: "Amul Dark Chocolate (99% Cocoa) 150g", category: "Snacks", price: 149, offerPrice: 125, image: ["https://images.unsplash.com/photo-1481391243133-f96216dcb5d2?w=500&auto=format&fit=crop&q=60"], description: ["India's favourite desi dark chocolate – intense 99% pure cocoa", "Rich, slightly bitter, antioxidant-packed dark chocolate"], inStock: true },
  { name: "Amul Fruit & Nut Chocolate 150g", category: "Snacks", price: 140, offerPrice: 115, image: ["https://images.unsplash.com/photo-1481391243133-f96216dcb5d2?w=500&auto=format&fit=crop&q=60"], description: ["Creamy Amul milk chocolate studded with raisins and crunchy almonds", "An affordable, wholesome Indian chocolate treat"], inStock: true },
  { name: "Ferrero Rocher Hazelnut Chocolates T16 Gift Pack 200g", category: "Snacks", price: 795, offerPrice: 699, image: ["https://images.unsplash.com/photo-1548907040-4baa42d10919?w=500&auto=format&fit=crop&q=60"], description: ["Premium golden Italian hazelnut chocolate balls in a gift box of 16", "India's most gifted premium chocolate for festivals and celebrations"], inStock: true },
  { name: "Ferrero Rocher T3 Mini Gift Box 37.5g", category: "Snacks", price: 170, offerPrice: 140, image: ["https://images.unsplash.com/photo-1548907040-4baa42d10919?w=500&auto=format&fit=crop&q=60"], description: ["Pack of 3 Ferrero Rocher premium hazelnut chocolate balls", "Elegant golden gift box – perfect token gift"], inStock: true },
  { name: "Snickers Peanut Chocolate Bar 50g", category: "Snacks", price: 60, offerPrice: 50, image: ["https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=500&auto=format&fit=crop&q=60"], description: ["Satisfying hunger-busting bar with peanuts, caramel, nougat, and chocolate", "You're not you when you're hungry – grab a Snickers!"], inStock: true },
  { name: "Mars Chocolate Bar 51g", category: "Snacks", price: 60, offerPrice: 52, image: ["https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=500&auto=format&fit=crop&q=60"], description: ["Classic caramel and nougat bar coated in smooth milk chocolate", "Rich, indulgent treat with layers of textures"], inStock: true },
  { name: "Lindt Excellence 70% Dark Chocolate Bar 100g", category: "Snacks", price: 450, offerPrice: 390, image: ["https://images.unsplash.com/photo-1481391243133-f96216dcb5d2?w=500&auto=format&fit=crop&q=60"], description: ["Swiss master chocolatier's premium 70% dark cocoa bar", "Finest Swiss chocolate crafted from carefully selected cocoa beans"], inStock: true },
  { name: "Lindt Lindor Milk Chocolate Truffles Box 200g", category: "Snacks", price: 1100, offerPrice: 950, image: ["https://images.unsplash.com/photo-1548907040-4baa42d10919?w=500&auto=format&fit=crop&q=60"], description: ["Irresistibly smooth Swiss milk chocolate truffles", "Premium gifting box for weddings, Diwali, and anniversaries"], inStock: true },
  { name: "Toblerone Swiss Milk Chocolate 100g Triangle Bar", category: "Snacks", price: 450, offerPrice: 390, image: ["https://images.unsplash.com/photo-1562690868-60bbe7293e94?w=500&auto=format&fit=crop&q=60"], description: ["Iconic Swiss triangular chocolate bar with honey-almond nougat", "Distinctive mountain-peak shape inspired by the Swiss Alps"], inStock: true },
  { name: "Paul and Mike Dark Chocolate 65% 50g Bar", category: "Snacks", price: 350, offerPrice: 299, image: ["https://images.unsplash.com/photo-1481391243133-f96216dcb5d2?w=500&auto=format&fit=crop&q=60"], description: ["Indian artisan bean-to-bar dark chocolate from Kerala cacao", "Craft chocolate supporting Indian cacao farmers directly"], inStock: true },
  { name: "Manam Single Origin Dark Chocolate 70% 55g", category: "Snacks", price: 450, offerPrice: 399, image: ["https://images.unsplash.com/photo-1481391243133-f96216dcb5d2?w=500&auto=format&fit=crop&q=60"], description: ["Premium Indian single-origin dark chocolate from Telangana cacao", "Award-winning Indian bean-to-bar chocolate brand"], inStock: true },
  { name: "Fabelle Exquisite Chocolate Truffle Box 125g", category: "Snacks", price: 650, offerPrice: 575, image: ["https://images.unsplash.com/photo-1548907040-4baa42d10919?w=500&auto=format&fit=crop&q=60"], description: ["ITC's luxurious handcrafted Indian chocolate truffle collection", "Opulent gifting experience for celebrations and corporate occasions"], inStock: true },

  // ==========================================
  // 10. INSTANT FOODS (Updated)
  // ==========================================
  { name: "Maggi 2-Minute Masala Instant Noodles 70g", category: "Instant", price: 15, offerPrice: 14, image: ["https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=60"], description: ["India's most iconic instant noodles ready in just 2 minutes", "Signature tangy masala taste loved across generations"], inStock: true },
  { name: "Maggi Double Masala Instant Noodles 70g", category: "Instant", price: 20, offerPrice: 18, image: ["https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=60"], description: ["Maggi with double the masala punch for spice lovers", "2X masala tastemaker for an intensely flavored noodle experience"], inStock: true },
  { name: "Smith & Jones Masala Instant Noodles 73g", category: "Instant", price: 15, offerPrice: 12, image: ["https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=60"], description: ["Budget-friendly instant masala noodles for everyday quick meals", "Popular economy alternative to premium noodle brands"], inStock: true },
  { name: "Ching's Secret Singapore Curry Instant Noodles 240g", category: "Instant", price: 75, offerPrice: 65, image: ["https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=60"], description: ["Indo-Chinese fusion instant noodles with aromatic Singapore curry flavor", "Bestselling Ching's noodle variant – bold, spicy, and exotic"], inStock: true },
  { name: "Maggi Pazzta Masala Penne Instant Pasta 70g", category: "Instant", price: 35, offerPrice: 30, image: ["https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=500&auto=format&fit=crop&q=60"], description: ["Quick-cook penne pasta with Maggi's signature masala seasoning", "Indian-style pasta ready in minutes"], inStock: true },
  { name: "Weikfield Cheesy Creamy Instant Pasta 100g", category: "Instant", price: 35, offerPrice: 30, image: ["https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=500&auto=format&fit=crop&q=60"], description: ["Quick instant pasta with a rich cheesy cream sauce sachet", "Kid-friendly quick meal ready in under 5 minutes"], inStock: true },
  { name: "Bambino Macaroni Elbow Pasta 500g", category: "Instant", price: 55, offerPrice: 48, image: ["https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=500&auto=format&fit=crop&q=60"], description: ["Classic elbow-shaped semolina macaroni pasta from India's No.1 pasta brand", "Trusted South Indian pasta brand popular across India for 70+ years"], inStock: true },
  { name: "MTR 3-Minute Poha Breakfast Mix 80g", category: "Instant", price: 32, offerPrice: 28, image: ["https://images.unsplash.com/photo-1627308595229-7830a5c18037?w=500&auto=format&fit=crop&q=60"], description: ["Authentic South Indian style poha breakfast ready in 3 minutes", "Pre-seasoned flattened rice with aromatic tempered spices"], inStock: true },
  { name: "MTR Vegetable Upma Mix 200g", category: "Instant", price: 32, offerPrice: 28, image: ["https://images.unsplash.com/photo-1627308595229-7830a5c18037?w=500&auto=format&fit=crop&q=60"], description: ["Instant semolina upma with real vegetable pieces and authentic seasoning", "South Indian breakfast classic ready in 3 minutes"], inStock: true },
  { name: "MTR Khaman Dhokla Ready Mix 200g", category: "Instant", price: 90, offerPrice: 79, image: ["https://images.unsplash.com/photo-1627308595229-7830a5c18037?w=500&auto=format&fit=crop&q=60"], description: ["Authentic Gujarati steamed khaman dhokla from MTR's trusted mix", "Ready in 15 minutes – perfect for snacks and festive gatherings"], inStock: true },
  { name: "MTR Rava Idli Mix 500g", category: "Instant", price: 130, offerPrice: 115, image: ["https://images.unsplash.com/photo-1630383249896-424e482df921?w=500&auto=format&fit=crop&q=60"], description: ["No-ferment instant rava (semolina) idli mix for fluffy soft idlis", "Consistently soft idlis every time with MTR's authentic recipe"], inStock: true },
  { name: "MTR Dosa Mix 500g", category: "Instant", price: 148, offerPrice: 130, image: ["https://images.unsplash.com/photo-1630383249896-424e482df921?w=500&auto=format&fit=crop&q=60"], description: ["Instant rice and urad dal batter mix for crispy, golden dosas", "Authentic South Indian taste with MTR's heritage recipe"], inStock: true },
  { name: "Haldiram's Ready to Eat Veg Pulao 200g", category: "Instant", price: 85, offerPrice: 72, image: ["https://images.unsplash.com/photo-1536304993881-ff86e0c9b582?w=500&auto=format&fit=crop&q=60"], description: ["Aromatic basmati rice cooked with fresh vegetables and whole spices", "Heat & eat in 2 minutes – perfect for travel and quick meals"], inStock: true },
  { name: "Sankalp Paneer Butter Masala Ready to Eat 300g", category: "Instant", price: 165, offerPrice: 145, image: ["https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&auto=format&fit=crop&q=60"], description: ["Restaurant-style creamy, rich paneer butter masala in a ready-to-eat pack", "Heat in 3 minutes, serve with roti or rice for a complete meal"], inStock: true },
  { name: "Chokhi Dhani Dal Makhani Ready to Eat 300g", category: "Instant", price: 175, offerPrice: 155, image: ["https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60"], description: ["Authentic Rajasthani-style slow-cooked dal makhani in a heat-and-eat pack", "Traditional dhaba flavor with the convenience of instant heating"], inStock: true },
  { name: "iD Fresh Malabar Paratha (5 Pcs) 400g", category: "Instant", price: 115, offerPrice: 99, image: ["https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&auto=format&fit=crop&q=60"], description: ["Soft, flaky, layered Malabar parathas – freshly made and refrigerated", "Heat on tawa in 2 minutes, pair with dal or any curry"], inStock: true },

  // ==========================================
  // 11. BAKERY (Updated)
  // ==========================================
  { name: "English Oven Milk Bread 400g", category: "Bakery", price: 65, offerPrice: 55, image: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60"], description: ["Soft, fluffy sandwich bread made with real milk for a rich flavour", "English Oven's most popular everyday bread"], inStock: true },
  { name: "The Health Factory Whole Wheat Bread (Zero Maida) 400g", category: "Bakery", price: 60, offerPrice: 52, image: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60"], description: ["100% whole wheat bread with zero maida – high in protein and dietary fibre", "Nutritionist-approved healthier bread for weight-conscious eaters"], inStock: true },
  { name: "Modern Sandwich Supreme White Bread 400g", category: "Bakery", price: 65, offerPrice: 55, image: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60"], description: ["Soft, pillowy white sandwich bread with a classic mild flavour", "Modern Bread – a trusted Indian bread brand for 70+ years"], inStock: true },
  { name: "Baker's Loaf Zero Preservatives Whole Wheat Bread 400g", category: "Bakery", price: 85, offerPrice: 75, image: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60"], description: ["Preservative-free whole wheat bread with clean ingredients", "Great for health-conscious households seeking clean label bread"], inStock: true },
  { name: "English Oven Premium White Bread (No Palm Oil) 400g", category: "Bakery", price: 55, offerPrice: 46, image: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60"], description: ["Light, airy premium white bread made without palm oil", "Cleaner ingredient profile than standard bread – popular health-first choice"], inStock: true },
  { name: "Protein Chef 42g Protein Bread 400g", category: "Bakery", price: 72, offerPrice: 62, image: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60"], description: ["High-protein bread with 42g protein per loaf for fitness enthusiasts", "Ideal post-workout toast or gym-goer's daily sandwich base"], inStock: true },
  { name: "Iyengars Bakery Special Bread 400g", category: "Bakery", price: 75, offerPrice: 65, image: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60"], description: ["Bangalore's beloved Iyengar Bakery-style soft white bread", "Popular among South Indian families – best paired with filter coffee"], inStock: true },
  { name: "English Oven Burger Buns (Pack of 6) 240g", category: "Bakery", price: 42, offerPrice: 35, image: ["https://images.unsplash.com/photo-1562059390-a761a084768e?w=500&auto=format&fit=crop&q=60"], description: ["Soft, sesame-topped burger buns ready for home gourmet burgers", "Perfect for homemade aloo tikki burgers, paneer burgers, and sliders"], inStock: true },
  { name: "Modern Cremtreat Vanilla Cream Bun", category: "Bakery", price: 12, offerPrice: 10, image: ["https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=60"], description: ["Soft sweet bun filled with smooth vanilla cream", "Classic Indian bakery treat loved by school children"], inStock: true },
  { name: "Britannia Sweet Bun Pack of 4", category: "Bakery", price: 38, offerPrice: 32, image: ["https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=60"], description: ["Soft, lightly sweet bread buns from India's most trusted brand", "Great for tiffin, evening snack, or as dinner roll"], inStock: true },
  { name: "Lavash Flatbread 200g", category: "Bakery", price: 105, offerPrice: 90, image: ["https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=60"], description: ["Thin, crispy Armenian-style flatbread popular in modern Indian cafes", "Versatile flatbread for wraps, dips, and mezze platters"], inStock: true },
  { name: "Kulcha Bread (Pack of 4) 300g", category: "Bakery", price: 25, offerPrice: 20, image: ["https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&auto=format&fit=crop&q=60"], description: ["Soft, slightly leavened North Indian kulcha bread perfect for chole kulcha", "Traditional Indian flatbread loved across North India"], inStock: true },
  { name: "Pav Bhaji Pav Big Size (12 Pieces) 450g", category: "Bakery", price: 68, offerPrice: 58, image: ["https://images.unsplash.com/photo-1562059390-a761a084768e?w=500&auto=format&fit=crop&q=60"], description: ["Big, fluffy Mumbai-style pav buns perfect for pav bhaji and vada pav", "12-piece family pack ideal for party snacks and street-food nights"], inStock: true },
  { name: "French Bread Loaf 300g", category: "Bakery", price: 48, offerPrice: 40, image: ["https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&auto=format&fit=crop&q=60"], description: ["Classic elongated French-style bread loaf with crispy golden crust", "Perfect with butter, olive oil, or sliced for bruschetta"], inStock: true },
  { name: "Classic French Baguette 250g", category: "Bakery", price: 99, offerPrice: 85, image: ["https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&auto=format&fit=crop&q=60"], description: ["Authentic French baguette with a crackly thin crust and open crumb", "Ideal for cheese boards, soups, sandwiches, and bruschetta"], inStock: true },
  { name: "Italian Herb Panini Bread (2 Pieces) 200g", category: "Bakery", price: 32, offerPrice: 28, image: ["https://images.unsplash.com/photo-1562059390-a761a084768e?w=500&auto=format&fit=crop&q=60"], description: ["Italian-style panini rolls infused with herbs – ready to grill", "Perfect for grilled panini sandwiches at home"], inStock: true },

  // ==========================================
  // 12. GRAINS (Updated)
  // ==========================================
  { name: "गेहूँ / Wheat (Sharbati) 1kg", category: "Grains", price: 25, offerPrice: 22, image: ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=60"], description: ["Premium Sharbati whole wheat grains from Madhya Pradesh", "Rich in dietary fibre, B-vitamins, and essential minerals"], inStock: true },
  { name: "चावल / Basmati Rice (India Gate Classic) 1kg", category: "Grains", price: 90, offerPrice: 75, image: ["https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=500&auto=format&fit=crop&q=60"], description: ["Premium long-grain basmati rice with fragrant aroma", "Fluffy, non-sticky when cooked – perfect for biryani and pulao"], inStock: true },
  { name: "चावल / Sona Masoori Raw Rice 1kg", category: "Grains", price: 65, offerPrice: 55, image: ["https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=500&auto=format&fit=crop&q=60"], description: ["Medium-grain Sona Masoori rice popular in South India", "Light, low glycemic index rice ideal for everyday meals"], inStock: true },
  { name: "मक्का / Maize Corn Grains 1kg", category: "Grains", price: 30, offerPrice: 25, image: ["https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=500&auto=format&fit=crop&q=60"], description: ["Dried yellow maize corn kernels for making makki ki roti and cornmeal", "Staple grain of Punjab and Himachal Pradesh cuisine"], inStock: true },
  { name: "जौ / Barley (Jau) Grain 500g", category: "Grains", price: 45, offerPrice: 38, image: ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=60"], description: ["Hulled barley grains – a traditional Indian grain for khichdi and soups", "High in beta-glucan fibre for cholesterol and blood sugar management"], inStock: true },
  { name: "बाजरा / Pearl Millet 1kg", category: "Grains", price: 45, offerPrice: 38, image: ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=60"], description: ["Whole pearl millet grains – India's most widely grown and consumed millet", "Rich in iron, magnesium, and antioxidants"], inStock: true },
  { name: "ज्वार / Sorghum (Jowar) 1kg", category: "Grains", price: 55, offerPrice: 46, image: ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=60"], description: ["Whole sorghum grains – a gluten-free ancient Indian grain", "Staple of Maharashtra and Karnataka for jowar bhakri and porridge"], inStock: true },
  { name: "रागी / Finger Millet 1kg", category: "Grains", price: 75, offerPrice: 62, image: ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=60"], description: ["Whole finger millet (ragi/nachni) – India's calcium-king grain", "Popular in South India for ragi mudde, dosa, and ragi porridge"], inStock: true },
  { name: "ओट्स / Quaker Rolled Oats 1kg", category: "Grains", price: 230, offerPrice: 195, image: ["https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=500&auto=format&fit=crop&q=60"], description: ["Quaker 100% whole grain rolled oats – India's No.1 oats brand", "Rich in beta-glucan soluble fibre for heart health"], inStock: true },
  { name: "क्विनोआ / Quinoa (Organic) 500g", category: "Grains", price: 320, offerPrice: 275, image: ["https://images.unsplash.com/photo-1612257999756-eed5cd8bbf36?w=500&auto=format&fit=crop&q=60"], description: ["Organic whole quinoa – the complete protein superfood pseudocereal", "Gluten-free, high fibre, ideal for healthy bowls, salads, and pulao"], inStock: true },
  { name: "चौलाई / Amaranth (Rajgira) 500g", category: "Grains", price: 190, offerPrice: 160, image: ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=60"], description: ["Whole amaranth (rajgira) grain – the vrat (fasting) superfood of India", "Rich in protein, lysine, and calcium – gluten-free pseudocereal"], inStock: true },
  { name: "कुट्टू / Buckwheat (Kuttu) 500g", category: "Grains", price: 275, offerPrice: 240, image: ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=60"], description: ["Whole buckwheat (kuttu) – India's most popular Navratri fasting grain", "Gluten-free pseudocereal rich in rutin, magnesium, and antioxidants"], inStock: true },
  { name: "फॉक्सटेल मिलेट / Foxtail Millet (Kangni) 500g", category: "Grains", price: 90, offerPrice: 76, image: ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=60"], description: ["Ancient Indian foxtail millet – a low glycemic superfood grain", "Great substitute for rice – foxtail millet khichdi and upma"], inStock: true },
  { name: "लिटिल मिलेट / Little Millet (Kutki) 500g", category: "Grains", price: 115, offerPrice: 95, image: ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=60"], description: ["Little millet (kutki/samai) – high fibre and protein ancient grain", "Very low glycemic index – ideal for diabetics and weight management"], inStock: true },
  { name: "बार्नयार्ड मिलेट / Barnyard Millet (Samak) 500g", category: "Grains", price: 140, offerPrice: 118, image: ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=60"], description: ["Barnyard millet (samak/vrat rice) – the go-to Navratri fasting grain", "Quick-cooking – used for samak ki khichdi, pulao, and idli"], inStock: true },
  { name: "राइस फ्लेक्स / Poha (Flattened Rice) Thick 500g", category: "Grains", price: 65, offerPrice: 55, image: ["https://images.unsplash.com/photo-1627308595229-7830a5c18037?w=500&auto=format&fit=crop&q=60"], description: ["Thick flattened rice flakes for making poha, chivda, and chaat", "India's favourite breakfast ingredient – poha is loved nationwide"], inStock: true },
  { name: "कॉर्न फ्लेक्स / Kellogg's Corn Flakes 475g", category: "Grains", price: 275, offerPrice: 235, image: ["https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=500&auto=format&fit=crop&q=60"], description: ["Kellogg's crispy golden corn flakes – India's No.1 breakfast cereal brand", "Light, crunchy, fortified with vitamins and iron"], inStock: true },
];

async function main() {
  console.log("🇮🇳 Populating database exclusively with authentic Indian grocery products...");

  // Clear existing products and order items
  await prisma.orderItem.deleteMany();
  await prisma.product.deleteMany();

  console.log(`🧹 Cleared non-Indian products from database.`);
  console.log(`📦 Inserting ${indianProducts.length} authentic Indian grocery products...`);

  await prisma.product.createMany({
    data: indianProducts,
  });

  const count = await prisma.product.count();
  console.log(`✅ Successfully seeded ${count} Indian products into PostgreSQL database!`);

  // Print summary by category
  const categories = await prisma.product.groupBy({
    by: ["category"],
    _count: { id: true },
  });

  console.log("\n📊 Indian Products Breakdown by Category:");
  categories.forEach((c) => {
    console.log(`  - ${c.category}: ${c._count.id} products`);
  });
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
