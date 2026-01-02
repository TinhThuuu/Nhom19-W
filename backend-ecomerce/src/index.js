const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const routes = require("./routes");
const cors = require("cors");
const cookieParser = require("cookie-parser");

dotenv.config();

mongoose.set("strictQuery", false);

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
    
// Routes
routes(app);

console.log("MongoDB ENV =", process.env.MongoDB);

// MongoDB connect
mongoose
  .connect(process.env.MongoDB)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// Start server
app.listen(port, () => {
  console.log("Server is running on port:", port);
});
