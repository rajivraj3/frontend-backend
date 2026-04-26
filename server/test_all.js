const mongoose = require('mongoose');

const combinations = [
  { u: "rajiv22334455_db_user", p: "B0xEkaeU1Ci1YRen" },
  { u: "rajiv", p: "B0xEkaeU1Ci1YRen" },
  { u: "rajiv", p: "rajiv22334455_db_user" },
  { u: "rajiv22334455_db_user", p: "rajiv" }
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
