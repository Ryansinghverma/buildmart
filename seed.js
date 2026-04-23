const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User.js");
const Product = require("./models/Product.js");
const DealerListing = require("./models/DealerListing.js");

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    // 🔥 Clear old data
    await Product.deleteMany();
    await DealerListing.deleteMany();
    await User.deleteMany();

    // 👤 Create Multiple Dealers
    const dealers = await User.insertMany([
      { name: "Sharma Traders", phone: "9111111111", role: "dealer", address: "Delhi" },
      { name: "Gupta Materials", phone: "9222222222", role: "dealer", address: "Noida" },
      { name: "Patel Builders Supply", phone: "9333333333", role: "dealer", address: "Gurgaon" },
      { name: "City Core Logistics", phone: "9444444444", role: "dealer", address: "Faridabad" },
    ]);

    console.log(`${dealers.length} Dealers created`);

    // 🧱 Create Products
    const products = await Product.insertMany([
      { name: "Ambuja Cement", category: "Cement", unit: "bag", description: "High-grade OPC 53 cement" },
      { name: "UltraTech Cement", category: "Cement", unit: "bag", description: "Portland Pozzolana Cement" },
      { name: "Tata Tiscon Steel", category: "Steel", unit: "kg", description: "TMT bars 8mm-32mm" },
      { name: "River Sand", category: "Aggregates", unit: "cft", description: "Fine river sand for plastering" },
      { name: "Crushed Stone Aggregates", category: "Aggregates", unit: "cft", description: "20mm rough crushed stone" },
      { name: "Red Clay Bricks", category: "Bricks", unit: "piece", description: "Class A solid red bricks" },
      { name: "Fly Ash Bricks", category: "Bricks", unit: "piece", description: "Eco-friendly ash bricks" },
      { name: "Teak Wood Planks", category: "Timber", unit: "sqft", description: "Premium teak for doors/windows" }
    ]);

    console.log(`${products.length} Products created`);

    // 🏪 Create Listings (Many-to-Many with variations)
    const listings = [];
    
    // Give each dealer listings for most products, with variations in price and delivery
    for (const dealer of dealers) {
      for (const product of products) {
        // Randomly decide if this dealer stocks this product (85% chance)
        if (Math.random() < 0.85) {
          // Create some variation based on the product so numbers look slightly realistic
          let basePrice = 100;
          if (product.category === 'Steel') basePrice = 5000;
          if (product.category === 'Cement') basePrice = 350;
          if (product.category === 'Bricks') basePrice = 10;
          if (product.category === 'Aggregates') basePrice = 50;
          if (product.category === 'Timber') basePrice = 1500;

          // Randomize price +/- 20%
          const priceVariance = basePrice * 0.2;
          const finalPrice = Math.floor(basePrice - priceVariance + (Math.random() * priceVariance * 2));

          listings.push({
            dealerId: dealer._id,
            productId: product._id,
            price: finalPrice,
            stock: Math.floor(Math.random() * 4950) + 50,
            // Vary delivery time: 1 to 7 days
            deliveryTime: `${Math.floor(Math.random() * 5) + 1} days`,
            isActive: true
          });
        }
      }
    }

    await DealerListing.insertMany(listings);

    console.log(`${listings.length} Listings created with varying prices and delivery times ✅`);

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
