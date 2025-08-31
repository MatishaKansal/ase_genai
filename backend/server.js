const express = require ("express");
require ("dotenv/config");
const cors = require ("cors");
const authRoutes = require ("./routes/authRoutes");
const connectdb = require ("./config/db.js");

const app = express();
app.use(cors());

app.use(express.json());

app.use("/auth", authRoutes);

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on Port ${process.env.PORT}`);
    connectdb();
})