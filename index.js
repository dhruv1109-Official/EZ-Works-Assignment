const express = require("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const opsRoutes = require("./routes/operationRoutes");
const clientRoutes = require("./routes/clientRoutes.js");
const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();

const ConnectDB = async () => {
  await mongoose
    .connect("mongodb://localhost:27017/ez-works")
    .then(() => console.log("Connected To DB"))
    .catch((e) => console.log("Error", e.message));

  port = process.env.PORT;
  app.listen(port, () => console.log(`Server Started on Port ${port}`));
};

ConnectDB()

app.use("/ops", opsRoutes);
app.use("/client", clientRoutes);





