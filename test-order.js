const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { createOrder } = require("./controllers/orderController");
const User = require("./models/User");
const Product = require("./models/Product");
const DealerListing = require("./models/DealerListing");

dotenv.config();

const runTest = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected for Testing");

    // 1. Create a dummy Contractor
    let contractor = await User.findOne({ role: "contractor" });
    if (!contractor) {
      contractor = await User.create({
        name: "Test Contractor",
        phone: "8888888888",
        role: "contractor",
        creditLimit: 50000,
      });
      console.log("Created test contractor.");
    }

    // 2. Find any active listing to test with
    const activeListing = await DealerListing.findOne({ isActive: true });
    if (!activeListing) throw new Error("No active listings found. Run seed.js first.");

    console.log(`\n🧪 TEST 1: Placing a valid order for Product: ${activeListing.productId}`);
    
    // Mock Express Req/Res
    let resJson1 = null;
    let resStatus1 = null;
    const req1 = {
      user: { _id: contractor._id },
      body: {
        items: [
          {
            dealerId: activeListing.dealerId,
            productId: activeListing.productId,
            quantity: 1
          }
        ],
        paymentType: "cash",
        deliveryAddress: "123 Test St"
      }
    };
    const res1 = {
      status: (code) => { resStatus1 = code; return res1; },
      json: (data) => { resJson1 = data; return res1; }
    };
    
    await createOrder(req1, res1, (err) => console.error(err));
    console.log(`Status: ${resStatus1}`);
    console.log("Response:", resJson1.message || "Order Created Successfully");

    // 3. Test Fallback Logic (Pass a valid product but WRONG dealer)
    console.log(`\n🧪 TEST 2: Testing Fallback Logic (Wrong Dealer)`);
    // Create a fake dealer ID that doesn't sell this product
    const fakeDealerId = new mongoose.Types.ObjectId();
    
    let resJson2 = null;
    let resStatus2 = null;
    let nextError2 = null;
    const req2 = {
      user: { _id: contractor._id },
      body: {
        items: [
          {
            dealerId: fakeDealerId, // WRONG DEALER
            productId: activeListing.productId, // VALID PRODUCT
            quantity: 1
          }
        ],
        paymentType: "cash",
        deliveryAddress: "123 Test St"
      }
    };
    const res2 = {
      status: (code) => { resStatus2 = code; return res2; },
      json: (data) => { resJson2 = data; return res2; }
    };

    await createOrder(req2, res2, (err) => { nextError2 = err; });
    
    if (nextError2) {
      console.log(`Test 2 failed with next(err):`, nextError2.message);
    } else {
      console.log(`Status: ${resStatus2}`);
      console.log("Response:", resJson2.message || "Order Created via Fallback Dealer!");
      if (resJson2.items && resJson2.items[0].dealerId.toString() !== fakeDealerId.toString()) {
          console.log("✅ Fallback successful! Dealer was automatically swapped.");
      }
    }

    // 4. Test Validation Error (Invalid Product)
    console.log(`\n🧪 TEST 3: Testing Validation Error (Product doesn't exist)`);
    const fakeProductId = new mongoose.Types.ObjectId();
    let resJson3 = null;
    let resStatus3 = null;
    let nextError3 = null;
    const req3 = {
      user: { _id: contractor._id },
      body: {
        items: [
          {
            dealerId: activeListing.dealerId,
            productId: fakeProductId, // WRONG PRODUCT
            quantity: 1
          }
        ],
        paymentType: "cash",
        deliveryAddress: "123 Test St"
      }
    };
    const res3 = {
      status: (code) => { resStatus3 = code; return res3; },
      json: (data) => { resJson3 = data; return res3; }
    };

    await createOrder(req3, res3, (err) => { nextError3 = err; });
    
    if (nextError3) {
      console.log(`Test 3 failed with next(err):`, nextError3.message);
    } else {
      console.log(`Status: ${resStatus3}`);
      console.log("Errors:", resJson3.errors || resJson3.message);
      if (resStatus3 === 400 && resJson3.errors) {
         console.log("✅ Validation successfully caught the invalid product.");
      }
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runTest();
