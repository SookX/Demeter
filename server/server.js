require("dotenv").config({ path: "./config.env" });
const mongoose = require("mongoose");
const app = require("./app");

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI

(async () => {
  try {
    await mongoose.connect(MONGODB_URI, { autoIndex: true });
    console.log(" MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("DB connection failed:", err);
    process.exit(1);
  }
})();
