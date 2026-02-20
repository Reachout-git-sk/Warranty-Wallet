require("dotenv").config();
const { MongoClient } = require("mongodb");

const MONGO_URI = process.env.MONGO_URI;

// ===== DATA POOLS =====

const electronicsItems = [
  "Smart TV 55inch", "OLED TV 65inch", "4K Monitor", "Gaming Monitor 27inch",
  "Curved Monitor 32inch", "Laptop Pro", "Gaming Laptop", "Ultrabook 14inch",
  "Chromebook", "MacBook Air", "MacBook Pro", "Surface Pro",
  "iPad Pro 12.9", "iPad Mini", "Android Tablet", "Kindle Paperwhite",
  "iPhone 15 Pro", "Samsung Galaxy S24", "Google Pixel 8", "OnePlus 12",
  "Wireless Earbuds", "Over-Ear Headphones", "Noise Cancelling Headphones",
  "Bluetooth Speaker", "Soundbar 400W", "Home Theatre System",
  "DSLR Camera", "Mirrorless Camera", "Action Camera 4K", "Drone Pro",
  "Smart Watch Series 9", "Fitness Tracker", "VR Headset", "Gaming Console",
  "Gaming Controller", "Mechanical Keyboard", "Gaming Mouse", "Webcam 4K",
  "External SSD 1TB", "NAS Drive 4TB", "Wi-Fi Router 6", "Smart Hub",
  "Graphic Tablet", "3D Printer", "Raspberry Pi Kit", "Arduino Starter Kit"
];

const homeItems = [
  "Sofa 3 Seater", "Recliner Chair", "King Bed Frame", "Queen Mattress",
  "Memory Foam Mattress", "Dining Table 6 Seater", "Coffee Table", "TV Stand",
  "Bookshelf 5 Tier", "Wardrobe 3 Door", "Study Desk", "Office Chair",
  "Standing Desk", "Bean Bag", "Floor Lamp", "Ceiling Fan with Light",
  "Smart Light Bulbs Set", "Curtain Set", "Area Rug 8x10", "Wall Mirror",
  "Shoe Rack", "Storage Ottoman", "Side Table", "Dresser with Mirror"
];

const applianceItems = [
  "French Door Refrigerator", "Side by Side Refrigerator", "Mini Fridge",
  "Front Load Washer", "Top Load Washer", "Washer Dryer Combo",
  "Clothes Dryer", "Dishwasher 500 Series", "Built-in Oven",
  "Microwave Oven 30L", "Convection Microwave", "Air Fryer XL",
  "Instant Pot 8Qt", "Pressure Cooker", "Rice Cooker", "Slow Cooker",
  "Stand Mixer 5Qt", "Hand Mixer", "Food Processor", "Blender Pro",
  "Juicer Centrifugal", "Coffee Maker", "Espresso Machine", "Toaster Oven",
  "Electric Kettle", "Sandwich Maker", "Waffle Maker", "Induction Cooktop",
  "Range Hood", "Water Purifier", "Air Purifier HEPA", "Dehumidifier",
  "Room Heater", "Tower Fan", "Window AC 1.5 Ton", "Split AC 2 Ton",
  "Vacuum Cleaner", "Robot Vacuum", "Steam Iron", "Garment Steamer"
];

const furnitureItems = [
  "L-Shaped Sofa", "Sectional Couch", "Futon Sofa Bed", "Accent Chair",
  "Bar Stool Set", "Folding Chair Set", "Outdoor Patio Set", "Garden Bench",
  "Hammock", "Bunk Bed", "Trundle Bed", "Day Bed", "Crib",
  "Changing Table", "High Chair", "Kids Desk", "Toy Storage Unit",
  "Filing Cabinet", "Lateral Cabinet", "Printer Stand", "Monitor Arm",
  "Floating Wall Shelves", "Corner Shelf", "Display Cabinet", "China Cabinet"
];

const otherItems = [
  "Treadmill Pro", "Elliptical Machine", "Stationary Bike", "Rowing Machine",
  "Weight Bench", "Dumbbell Set", "Kettlebell Set", "Pull Up Bar",
  "Yoga Mat Premium", "Foam Roller", "Resistance Bands Set",
  "Electric Scooter", "Hoverboard", "Electric Bike", "Skateboard Electric",
  "Power Tool Set", "Cordless Drill", "Circular Saw", "Jigsaw",
  "Pressure Washer", "Lawn Mower Electric", "Leaf Blower", "Hedge Trimmer",
  "Generator 2000W", "Solar Panel Kit", "Security Camera System", "Smart Doorbell",
  "Smart Lock", "Baby Monitor", "Pet Camera", "Portable Power Station"
];

const stores = [
  "Amazon", "Walmart", "Best Buy", "Costco", "Target", "Home Depot",
  "Croma", "Flipkart", "Reliance Digital", "Apple Store", "Samsung Store",
  "B&H Photo", "Newegg", "Adorama", "Macys", "IKEA", "Wayfair",
  "BJs Wholesale", "Sams Club", "Lowes", "Staples", "Office Depot",
  "GameStop", "Micro Center", "Frys Electronics", "PC Richard",
  "Rex Electronics", "Vijay Sales", "Tata Cliq", "Snapdeal"
];

const brands = [
  "Samsung", "LG", "Sony", "Apple", "Dell", "HP", "Canon", "Nikon",
  "Bose", "Dyson", "KitchenAid", "Whirlpool", "Bosch", "Philips",
  "Panasonic", "Sharp", "Haier", "Lenovo", "Acer", "Asus", "Microsoft",
  "Logitech", "Razer", "Corsair", "Seagate", "Western Digital", "SanDisk",
  "Anker", "Belkin", "JBL", "Harman Kardon", "Sennheiser", "Audio Technica",
  "GoPro", "DJI", "Garmin", "Fitbit", "Xiaomi", "OnePlus", "Google",
  "Amazon", "Ring", "Nest", "Roomba", "Shark", "Bissell", "Hoover",
  "Cuisinart", "Breville", "Ninja", "Instant Pot", "Black Decker",
  "Dewalt", "Milwaukee", "Makita", "Ryobi", "Craftsman", "Stanley"
];

const supportPhones = [
  "1-800-726-7864", "1-888-000-1234", "1-800-555-9876",
  "1-877-345-6789", "1-866-234-5678", "1-800-123-4567",
  "1-855-667-7890", "1-844-789-0123", "1-833-456-7890",
  "1-822-234-5678", "1-800-987-6543", "1-888-111-2222",
  "1-877-333-4444", "1-866-555-6666", "1-855-777-8888"
];

const categories = [
  "Electronics", "Electronics", "Electronics", "Electronics",
  "Home", "Home",
  "Appliances", "Appliances", "Appliances",
  "Furniture",
  "Other"
];

// ===== HELPER FUNCTIONS =====

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPrice(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

function randomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

function randomItemByCategory(category) {
  switch (category) {
    case "Electronics": return randomItem(electronicsItems);
    case "Home": return randomItem(homeItems);
    case "Appliances": return randomItem(applianceItems);
    case "Furniture": return randomItem(furnitureItems);
    default: return randomItem(otherItems);
  }
}

function randomPriceByCategory(category) {
  switch (category) {
    case "Electronics": return randomPrice(50, 5000);
    case "Home": return randomPrice(100, 3000);
    case "Appliances": return randomPrice(30, 2000);
    case "Furniture": return randomPrice(80, 4000);
    default: return randomPrice(20, 1500);
  }
}

// ===== SEED PURCHASES =====

async function seedPurchases(db) {
  const purchases = [];

  for (let i = 1; i <= 1000; i++) {
    const category = randomItem(categories);
    const itemName = randomItemByCategory(category);
    const price = randomPriceByCategory(category);
    const purchaseDate = randomDate(new Date("2021-01-01"), new Date());

    purchases.push({
      itemName: `${itemName}`,
      storeName: randomItem(stores),
      price: price,
      purchaseDate: purchaseDate,
      category: category,
      notes: "",
      receiptFile: null,
      receiptPublicId: null,
      createdAt: new Date(),
    });
  }

  await db.collection("purchases").insertMany(purchases);
  console.log("✅ 1000 purchases inserted");
}

// ===== SEED SUPPORT DOCS =====

async function seedSupportDocs(db) {
  const docs = [];
  const allProducts = [
    ...electronicsItems,
    ...applianceItems,
    ...homeItems,
    ...furnitureItems,
    ...otherItems
  ];

  for (let i = 1; i <= 1000; i++) {
    const brand = randomItem(brands);
    const productName = randomItem(allProducts);
    const warrantyExpiry = randomDate(
      new Date("2023-01-01"),
      new Date("2028-12-31")
    );
    const today = new Date();
    const daysLeft = Math.ceil(
      (warrantyExpiry - today) / (1000 * 60 * 60 * 24)
    );

    let status = "Active";
    if (daysLeft <= 0) status = "Expired";
    else if (daysLeft <= 30) status = "Expiring Soon";

    docs.push({
      productName: `${productName}`,
      brand: brand,
      supportPhone: randomItem(supportPhones),
      supportEmail: `support@${brand.toLowerCase().replace(/ /g, "")}.com`,
      supportWebsite: `https://support.${brand.toLowerCase().replace(/ /g, "")}.com`,
      warrantyExpiry: warrantyExpiry,
      daysLeft: daysLeft,
      status: status,
      notes: "",
      manualFile: null,
      manualPublicId: null,
      createdAt: new Date(),
    });
  }

  await db.collection("support_docs").insertMany(docs);
  console.log("✅ 1000 support docs inserted");
}

// ===== MAIN =====

async function main() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");
    const db = client.db("warrantyWallet");

    const existingPurchases = await db
      .collection("purchases")
      .countDocuments();
    const existingDocs = await db
      .collection("support_docs")
      .countDocuments();

    console.log(`📊 Existing purchases: ${existingPurchases}`);
    console.log(`📊 Existing support docs: ${existingDocs}`);
    console.log("⏳ Seeding data...");

    await seedPurchases(db);
    await seedSupportDocs(db);

    const finalPurchases = await db
      .collection("purchases")
      .countDocuments();
    const finalDocs = await db
      .collection("support_docs")
      .countDocuments();

    console.log(`\n🎉 Seeding complete!`);
    console.log(`📊 Total purchases: ${finalPurchases}`);
    console.log(`📊 Total support docs: ${finalDocs}`);
    console.log(`📊 Grand total records: ${finalPurchases + finalDocs}`);
  } catch (err) {
    console.error("❌ Seed error:", err.message);
  } finally {
    await client.close();
    console.log("🔌 Connection closed");
  }
}

main();