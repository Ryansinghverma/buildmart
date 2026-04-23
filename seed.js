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

    // 🔥 Clear old data (optional but useful)
    await Product.deleteMany();
    await DealerListing.deleteMany();
    await User.deleteMany();

    // 👤 Create Dealer
    const dealer = await User.create({
      name: "Sharma Traders",
      phone: "9111111111",
      role: "dealer",
      address: "Delhi",
    });

    console.log("Dealer created:", dealer._id);

    // 🧱 Create Products
    const products = await Product.insertMany([
      { name: "Cement", category: "Cement", unit: "bag" },
      { name: "Steel", category: "Steel", unit: "kg" },
      { name: "Sand", category: "Aggregates", unit: "cft" },
      { name: "Bricks", category: "Bricks", unit: "piece" },
    ]);

    console.log("Products created");

    // 🏪 Create Listings
    const listings = products.map((p) => ({
      dealerId: dealer._id,
      productId: p._id,
      price: Math.floor(Math.random() * 100) + 50,
      stock: 1000,
      deliveryTime: "2 days",
    }));

    await DealerListing.insertMany(listings);

    console.log("Listings created ✅");

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
