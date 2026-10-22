require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/parcels", require("./routes/parcelRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));

app.get("/", (req, res) => res.send("API running"));

const PORT = process.env.PORT || 5000;

// Connect to MongoDB, then start the server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log("Server on " + PORT));
  })
  .catch((err) => console.log(err.message));
