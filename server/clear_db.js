const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB");
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
       await collection.deleteMany({});
       console.log(`Cleared collection: ${collection.collectionName}`);
    }
    console.log("SUCCESS: Database cleared.");
    process.exit(0);
  })
  .catch(err => {
    console.error("FAILURE:", err);
    process.exit(1);
  });
