const express = require ("express");
require ("dotenv/config");
const cors = require ("cors");
const authRoutes = require ("./routes/authRoutes.js");
const chatRoutes = require ("./routes/chatRoutes.js");
const connectdb = require ("./config/db.js");
const path = require("path");

const app = express();
app.use(cors());

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/api", chatRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on Port ${process.env.PORT}`);
    connectdb();
})