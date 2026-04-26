const mongoose = require('mongoose');

const combinations = [
  { u: "rajiv22334455_db_user", p: "UXwKHjNXFprQ8X0M" },
  { u: "rajiv", p: "UXwKHjNXFprQ8X0M" }
];

async function test() {
  for (const comb of combinations) {
    const uri = `mongodb+srv://${comb.u}:${comb.p}@cluster0.cuj4bkb.mongodb.net/test?retryWrites=true&w=majority`;
    console.log(`Testing: User=${comb.u}, Pass=${comb.p}`);
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log(`✅ SUCCESS with User=${comb.u}`);
      await mongoose.disconnect();
      process.exit(0);
    } catch (err) {
      console.log(`❌ FAILED: ${err.message}`);
    }
  }
  process.exit(1);
}

test();
