const mongoose = require('mongoose');
const uri = "mongodb+srv://rajiv:rajiv22334455_db_user@cluster0.cuj4bkb.mongodb.net/test?retryWrites=true&w=majority";

mongoose.connect(uri)
  .then(() => {
    console.log("SUCCESS: Connected to MongoDB Atlas");
    process.exit(0);
  })
  .catch(err => {
    console.error("FAILURE:", err.message);
    process.exit(1);
  });
